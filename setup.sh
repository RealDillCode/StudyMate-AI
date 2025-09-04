#!/bin/bash

# StudyMate AI Setup Script

echo "🎓 StudyMate AI - Setup Script"
echo "================================"

# Check for required tools
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites checked"

# Create .env file from example
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your OpenAI API key and other configurations"
    echo "Press Enter to continue after editing .env..."
    read
fi

# Create necessary directories
echo "Creating directories..."
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p frontend/public/uploads

# Start services with Docker Compose
echo "Starting services..."
docker-compose up -d postgres redis minio

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker-compose run --rm backend alembic upgrade head

# Create MinIO bucket
echo "Creating MinIO bucket..."
docker-compose exec minio mc alias set myminio http://localhost:9000 minioadmin minioadmin123
docker-compose exec minio mc mb myminio/studymate --ignore-existing

# Start all services
echo "Starting all services..."
docker-compose up -d

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Services are starting up..."
echo ""
echo "Access the application at:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8000"
echo "  - API Documentation: http://localhost:8000/docs"
echo "  - MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
echo "  - Flower (Celery monitoring): http://localhost:5555"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"
echo ""
echo "⚠️  Remember to:"
echo "  1. Add your OpenAI API key to .env file"
echo "  2. Configure Pinecone (optional) for vector search"
echo "  3. Set a secure SECRET_KEY in production"
echo ""
echo "Happy studying! 📚"