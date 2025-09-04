#!/bin/bash

# TODO App Setup Script
echo "🚀 Setting up TODO App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build the project"
    exit 1
fi

echo "✅ Project built successfully"

# Create database directory
echo "🗃️ Setting up database..."
mkdir -p database

echo "✅ Database directory created"

# Run migrations (will be implemented later)
echo "🏃 Running database migrations..."
# npm run migrate

echo "✅ Setup complete!"
echo ""
echo "🎉 TODO App is ready to use!"
echo ""
echo "Available commands:"
echo "  📱 CLI:     npm run start:cli -- add 'My first todo'"
echo "  🌐 Web:     npm run start:web"
echo "  🤖 MCP:     npm run start:mcp"
echo ""
echo "Development commands:"
echo "  🔧 Dev CLI: npm run dev:cli"
echo "  🔧 Dev Web: npm run dev:web"
echo "  🔧 Dev MCP: npm run dev:mcp"
echo "  🧪 Tests:   npm test"
echo ""
echo "For more information, see README.md"
