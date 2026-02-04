// API: OTC Order Book Snapshot
// GET /api/otc/orderbook?assetId=xxx - Get real-time order book

import { NextRequest, NextResponse } from 'next/server';
import { orderBookManager } from '@/lib/matching/otc-orderbook';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');

    if (!assetId) {
      return NextResponse.json({ error: 'Missing assetId parameter' }, { status: 400 });
    }

    // Get asset
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Get order book snapshot
    const orderBook = orderBookManager.getOrderBook(assetId);
    const snapshot = orderBook.getSnapshot();

    // Get recent trades
    const recentTrades = orderBook.getTrades(20);

    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
      },
      orderBook: {
        bids: snapshot.bids.map((b) => ({
          price: b.price,
          quantity: b.quantity,
          orders: b.orders,
          total: b.price * b.quantity,
        })),
        asks: snapshot.asks.map((a) => ({
          price: a.price,
          quantity: a.quantity,
          orders: a.orders,
          total: a.price * a.quantity,
        })),
        spread: {
          absolute: snapshot.bidAskSpread,
          percentage:
            snapshot.lastPrice > 0
              ? (snapshot.bidAskSpread / snapshot.lastPrice) * 100
              : 0,
        },
        darkPool: {
          buyInterest: snapshot.darkPoolBuyInterest,
          sellInterest: snapshot.darkPoolSellInterest,
        },
      },
      market: {
        lastPrice: snapshot.lastPrice,
        high24h: snapshot.high24h,
        low24h: snapshot.low24h,
        volume24h: snapshot.volume24h,
        trades24h: snapshot.trades24h,
        change24h:
          snapshot.lastPrice && snapshot.low24h
            ? ((snapshot.lastPrice - snapshot.low24h) / snapshot.low24h) * 100
            : 0,
      },
      recentTrades: recentTrades.map((t) => ({
        id: t.id,
        price: t.price,
        quantity: t.quantity,
        totalValue: t.totalValue,
        side: 'buy', // From buyer's perspective
        timestamp: t.executedAt,
      })),
      timestamp: snapshot.timestamp,
    });
  } catch (error) {
    console.error('[OTC] Get orderbook error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch order book',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
