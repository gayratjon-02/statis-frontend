#!/bin/bash
set -e

git reset --hard
git pull origin master

echo "🚀 STATIC-ENGINE Frontend Docker deployment started..."

cd "$(dirname "$0")"

if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with NEXT_PUBLIC_API_URL"
    exit 1
fi

echo "🧹 Stopping old containers..."
docker compose down

echo "🔨 Building Docker image..."
docker compose build --no-cache

echo "▶️  Starting container..."
docker compose up -d

echo "⏳ Waiting for frontend..."
sleep 10

echo "📊 Container status:"
docker compose ps

echo "✅ Frontend deployment finished!"
echo "🌐 Frontend is running at http://localhost:4010"
echo ""
echo "📝 Useful commands:"
echo "   docker compose logs -f static-engine-frontend  - View frontend logs"
echo "   docker compose ps                              - Container status"
echo "   docker compose down                            - Stop container"

docker compose logs --tail 200 -f
