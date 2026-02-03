#!/bin/bash

# Swarm Accelerator - Development Setup Script
# This script sets up the local development environment

set -e

echo "🦾 Swarm Accelerator - Development Setup"
echo "========================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found."
    echo "   Install with: brew install postgresql@15"
    echo "   Or use a cloud database (Supabase, Railway, Neon)"
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ PostgreSQL detected"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check for .env.local
if [ ! -f .env.local ]; then
    echo ""
    echo "⚙️  Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "🔑 IMPORTANT: You need to add your OpenAI API key to .env.local"
    echo "   Get one at: https://platform.openai.com/api-keys"
    echo ""
    read -p "Press enter to open .env.local in your editor..."
    ${EDITOR:-nano} .env.local
else
    echo "✅ .env.local already exists"
fi

# Set up database
echo ""
echo "🗄️  Setting up database..."
read -p "Do you want to create the database now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Create database if using local PostgreSQL
    if command -v psql &> /dev/null; then
        echo "Creating database 'swarm_accelerator'..."
        createdb swarm_accelerator 2>/dev/null || echo "Database might already exist"
    fi
    
    # Run Prisma migrations
    echo "Running Prisma migrations..."
    npx prisma migrate dev --name init
    
    echo "✅ Database setup complete"
else
    echo "⏭️  Skipping database setup"
    echo "   Run manually with: npx prisma migrate dev"
fi

# Generate Prisma Client
echo ""
echo "🔄 Generating Prisma Client..."
npx prisma generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev"
echo ""
echo "📊 To view database:"
echo "   npx prisma studio"
echo ""
echo "🔧 Next steps:"
echo "   1. Add your OpenAI API key to .env.local"
echo "   2. Run: npm run dev"
echo "   3. Visit: http://localhost:3000"
echo ""
