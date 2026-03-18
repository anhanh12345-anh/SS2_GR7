#!/bin/bash

echo "🚀 FinanceFlow - Setup Script"
echo "=============================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js >= 18"
    exit 1
fi

echo "✅ Node.js $(node -v) found"
echo ""

# Setup Backend
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please edit backend/.env and set your MONGODB_URI and JWT_SECRET"
else
    echo "✅ .env already exists"
fi

cd ..

# Setup Frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend && npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "  Then open: http://localhost:5173"
echo ""
echo "⚠️  Make sure MongoDB is running or update MONGODB_URI in backend/.env"
