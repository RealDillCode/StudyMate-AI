# StudyMate AI - Intelligent Learning Platform for College Students

## Overview
StudyMate AI is a comprehensive AI-powered learning platform designed specifically for college students. It provides personalized AI assistance for each class, manages course materials, and adapts to individual learning styles.

## Core Features

### 🎓 Class-Based AI Chats
- Separate AI assistant for each enrolled class
- Context-aware conversations based on course materials
- Persistent chat history and progress tracking

### 📚 Material Management
- Upload and process textbooks (PDF, DOCX, etc.)
- Store lecture notes and supplementary materials
- Automatic content indexing for intelligent retrieval

### 🤖 Adjustable AI Assistance Levels
- **Study Help Mode**: Guided learning with hints and explanations
- **Autonomous Agent Mode**: Complete homework assistance with step-by-step solutions
- Custom assistance levels for different subjects

### ✍️ Writing Style Mimicry
- Analyzes student's writing samples
- Creates personalized writing profile
- Generates content matching student's unique style

### 🎥 Screen Recording Processing
- Upload screen recordings of homework instructions
- Automatic transcription and analysis
- Converts video instructions into actionable tasks

### 📊 Progress Tracking
- Monitors learning progress per class
- Identifies knowledge gaps
- Provides personalized study recommendations

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Vector Store**: Pinecone/Weaviate for embeddings
- **AI/ML**: OpenAI API, LangChain
- **File Processing**: PyPDF2, python-docx, OpenCV
- **Authentication**: JWT with FastAPI-Users

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **UI Library**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand
- **API Client**: Axios with React Query
- **Video Processing**: MediaRecorder API

### Infrastructure
- **Containerization**: Docker
- **Object Storage**: AWS S3 or MinIO
- **Queue System**: Celery with Redis
- **Monitoring**: Prometheus + Grafana

## Project Structure
```
studymate-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── public/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis (for Celery)
- Docker (optional)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/studymate-ai.git
cd studymate-ai
```

2. Set up the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend
```bash
cd frontend
npm install
```

4. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run migrations
```bash
cd backend
alembic upgrade head
```

6. Start the development servers
```bash
# Backend
uvicorn app.main:app --reload

# Frontend (in another terminal)
cd frontend
npm run dev
```

## License
MIT

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.