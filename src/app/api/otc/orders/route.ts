// API: OTC Order Book
// POST /api/otc/orders - Place buy/sell order
// GET /api/otc/orders - Get user's orders

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderBookManager } from '@/lib/matching/otc-orderbook';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.assetId || !body.userId || !body.side || !body.quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: assetId, userId, side, quantity' },
        { status: 400 }
      );
    }

    // Get asset
    const asset = await prisma.asset.findUnique({
      where: { id: body.assetId },
    });

    if (!asset || !asset.active) {
      return NextResponse.json({ error: 'Asset not found or inactive' }, { status: 404 });
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        assetId: body.assetId,
        userId: body.userId,
        side: body.side.toUpperCase(),
        orderType: (body.orderType || 'LIMIT').toUpperCase(),
        quantity: body.quantity,
        price: body.price || null,
        minQuantity: body.minQuantity || null,
        maxQuantity: body.maxQuantity || null,
        isPublic: body.isPublic !== false, // Default true
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        status: 'OPEN',
      },
    });

    console.log(
      `[OTC] Order placed: ${order.side} ${order.quantity} ${asset.symbol} @ ${order.price || 'MARKET'}`
    );

    // Add to in-memory order book
    const orderBook = orderBookManager.getOrderBook(body.assetId);
    orderBook.placeOrder({
      assetId: order.assetId,
      userId: order.userId,
      side: order.side === 'BUY' ? 'buy' : 'sell',
      orderType:
        order.orderType === 'MARKET'
          ? 'market'
          : order.orderType === 'LIMIT'
          ? 'limit'
          : 'rfi',
      quantity: Number(order.quantity),
      price: order.price ? Number(order.price) : undefined,
      minQuantity: order.minQuantity ? Number(order.minQuantity) : undefined,
      maxQuantity: order.maxQuantity ? Number(order.maxQuantity) : undefined,
      isPublic: order.isPublic,
      expiresAt: order.expiresAt || undefined,
    });

    // Get updated order book snapshot
    const snapshot = orderBook.getSnapshot();

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        assetId: order.assetId,
        symbol: asset.symbol,
        side: order.side,
        quantity: order.quantity,
        price: order.price,
        status: order.status,
      },
      orderBook: {
        bestBid: snapshot.bids[0]?.price || null,
        bestAsk: snapshot.asks[0]?.price || null,
        spread: snapshot.bidAskSpread,
        lastPrice: snapshot.lastPrice,
      },
    });
  } catch (error) {
    console.error('[OTC] Place order error:', error);
    return NextResponse.json(
      {
        error: 'Failed to place order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/otc/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const assetId = searchParams.get('assetId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,
        ...(assetId && { assetId }),
        ...(status && { status: status.toUpperCase() as any }),
      },
      include: {
        asset: {
          select: {
            symbol: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('[OTC] Get orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// DELETE /api/otc/orders/:id - Cancel order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!orderId || !userId) {
      return NextResponse.json(
        { error: 'Missing orderId or userId parameter' },
        { status: 400 }
      );
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check ownership
    if (order.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Can't cancel filled/cancelled orders
    if (order.status === 'FILLED' || order.status === 'CANCELLED') {
      return NextResponse.json(
        { error: `Cannot cancel ${order.status.toLowerCase()} order` },
        { status: 400 }
      );
    }

    // Update database
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    // Cancel in order book
    const orderBook = orderBookManager.getOrderBook(order.assetId);
    orderBook.cancelOrder(orderId);

    console.log(`[OTC] Order cancelled: ${orderId}`);

    return NextResponse.json({
      success: true,
      message: 'Order cancelled',
    });
  } catch (error) {
    console.error('[OTC] Cancel order error:', error);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}
