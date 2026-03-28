# Study Assistant - AI-Powered Learning Platform

A secure, scalable web application that provides personalized AI assistance for college students, featuring class organization, document management, and customizable AI assistance levels.

## Features

### ✅ Completed Features
- **User Authentication**: Secure sign up/sign in with email/password or Google OAuth
- **Class Management**: Create, organize, and manage multiple classes
- **AI Chat Interface**: Gemini-powered chat assistant for each class
- **Customizable AI Levels**:
  - Study Helper: Guidance and explanations only
  - Guided Assistant: Step-by-step problem solving
  - Autonomous Agent: Complete solutions and implementations
- **Security Features**:
  - Input sanitization and validation
  - Rate limiting (10 messages/minute per user)
  - Content moderation
  - Secure API endpoints with authentication
- **Modern UI**: Clean, responsive design with Tailwind CSS

### 🚧 Upcoming Features
- Document upload and processing
- RAG (Retrieval-Augmented Generation) for course materials
- Writing style mimicry
- Screen recording processing
- Canvas LMS integration

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **AI**: Google Gemini 1.5 Flash
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI, shadcn/ui

## Security & Privacy

### AI Safety
- All AI interactions happen server-side
- No files are created on the server by AI
- Content is stored securely in the database
- Input sanitization prevents injection attacks
- Rate limiting prevents abuse

### Data Protection
- User data isolation
- Encrypted passwords
- Session-based authentication
- Class-level access control

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Gemini API key

### Installation

1. Clone the repository:
```bash
cd study-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `GEMINI_API_KEY`: Your Gemini API key

4. Set up the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

1. **Sign Up**: Create an account with email/password or Google
2. **Create a Class**: Add your courses from the dashboard
3. **Start Chatting**: Create chat sessions for each class
4. **Choose AI Level**: Select the appropriate assistance level
5. **Ask Questions**: Get help with your coursework

## API Rate Limits

- **Chat Messages**: 10 messages per minute per user
- **Gemini API**: Subject to your API key's quota

## Project Structure

```
/study-assistant
├── app/                  # Next.js app directory
│   ├── api/             # API endpoints
│   ├── auth/            # Authentication pages
│   └── dashboard/       # Main application
├── components/          # React components
│   ├── chat/           # Chat interface
│   └── ui/             # Reusable UI components
├── lib/                # Utility functions
│   ├── gemini.ts       # AI integration
│   ├── auth.ts         # Auth configuration
│   └── prisma.ts       # Database client
└── prisma/             # Database schema
```

## Development

### Database Commands
```bash
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

### Build for Production
```bash
npm run build
npm start
```

## Contributing

This is a private project, but if you have access:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Private - All rights reserved

## Support

For issues or questions, please contact the development team.