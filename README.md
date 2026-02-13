# UsoHontoGame (ウソホント)

A truth-or-lie guessing game built with Next.js 16, React 19, and SQLite. Players try to identify which episode among three presented stories is false.

## Features

### Implemented

- **Session Management**
  - Cookie-based authentication
  - Nickname registration
  - Persistent sessions

- **Game Preparation (Moderator)**
  - Create games with configurable player limits (1-100)
  - View and manage game list
  - Edit game settings (during preparation phase)
  - Delete games with cascade deletion
  - Game status management (準備中/出題中/締切)
  - SQLite persistence with automatic migrations

### In Development

- [ ] **Presenter Management**
  - Add presenters to games (1-10 per game)
  - Register 3 episodes per presenter
  - Mark one episode as lie (confidential)

- [ ] **Player Experience**
  - Join active games
  - View and vote on episodes
  - See voting results

## Tech Stack

### Core

- **Framework**: Next.js 16.0.1 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS v4

### Data & Persistence

- **Database**: SQLite (via Prisma)
- **ORM**: Prisma 6.19.0
- **Validation**: Zod 4.1.12
- **ID Generation**: nanoid 5.1.6

### Testing

- **Unit Tests**: Vitest 4.0.7
- **E2E Tests**: Playwright 1.56.1
- **Component Testing**: Testing Library

### Code Quality

- **Linting**: Biome 2.3.4, ESLint 9
- **Formatting**: Biome

## Architecture

This project follows **Clean Architecture** principles with **Domain-Driven Design**:

```
src/
├── app/                    # Next.js pages (Presentation Layer)
├── components/             # React components (Presentation Layer)
└── server/
    ├── application/        # Use Cases (Application Layer)
    ├── domain/             # Entities, Value Objects (Domain Layer)
    └── infrastructure/     # Database, External APIs (Infrastructure Layer)
```

**Key Design Patterns**:

- Repository Pattern (abstraction over data access)
- Server Actions (Next.js mutation API)
- Value Objects (domain validation)
- Use Case Pattern (application logic)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables for Prisma CLI
# This creates .env with relative path to database
echo "DATABASE_URL=\"file:./dev.db\"" > .env

# Set up environment variables for Next.js
# This creates .env.local with absolute path to database
echo "DATABASE_URL=\"file:$(pwd)/prisma/dev.db\"" > .env.local

# Set up database
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

**Note**: The `.env` file contains relative path for Prisma CLI, while `.env.local` contains absolute path for Next.js runtime. Both are needed for the application to work correctly.

### Development

```bash
# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Understanding the Application

This application has two distinct entry points:

**Player View** (`/`)
- For participants joining games
- Shows only active games (status: 出題中)
- Join games, view presenters, and vote on episodes

**Moderator View** (`/games`)
- For game creators/moderators
- Shows only games you created (filtered by your session ID)
- Create, edit, and manage your games

**Note**: There are no navigation buttons between these views. Access them directly via URL.

#### Session Management

Sessions are managed via browser cookies:
- `sessionId`: Unique identifier for your session (generated with nanoid)
- `nickname`: Your display name

On first visit, you'll be prompted to register a nickname, which creates a persistent session.

#### Game Flow

Games have three statuses:
- **準備中** (Preparing): Initial state, moderator setting up presenters/episodes
- **出題中** (Active): Game is live, players can join and vote
- **締切** (Closed): Voting ended, results available

Each game contains:
- 1-10 presenters per game
- 3 episodes per presenter
- Exactly 1 lie among the 3 episodes (hidden from players)

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Open Prisma Studio (GUI for database)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Available Scripts

### Development

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Build for production
npm start            # Start production server
```

### Testing

```bash
npm test                   # Run unit tests with Vitest
npm run test:ui            # Run tests with interactive UI
npm run test:coverage      # Generate coverage report
npm run test:e2e           # Run E2E tests with Playwright
npm run test:e2e:ui        # Run E2E tests with UI
npm run test:e2e:debug     # Debug E2E tests
```

### Code Quality

```bash
npm run lint               # Lint with ESLint
npm run lint:biome         # Lint with Biome
npm run format             # Format code with Biome
npm run format:check       # Check formatting
npm run check              # Lint + format with Biome
```

### Database

```bash
npx prisma migrate dev     # Run migrations (dev)
npx prisma migrate deploy  # Run migrations (production)
npx prisma studio          # Open database GUI
npx prisma generate        # Generate Prisma Client
```

#### Seed Scripts

Two seed scripts are available for generating test data:

**1. Global Seed (`npm run seed`)**
```bash
npm run seed
```
- Creates 150 games total (50 per status)
- Uses a fixed creator ID: `seed-creator-session-id`
- **Clears ALL existing data** before seeding
- Useful for: Fresh start, testing across all statuses

**2. User-Specific Seed (`npm run seed:my <session-id>`)**
```bash
npm run seed:my wDTbv1VX6IqHNmPgqbCX-
```
- Creates ~100 games for specified session ID
- Deletes only games from that session
- Preserves other users' games
- Useful for: Testing `/games` page with many items

**Getting Your Session ID:**
1. Open DevTools (F12)
2. Go to Application → Cookies → http://localhost:3000
3. Copy the value of `sessionId` cookie

## Project Structure

```
.
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── actions/                # Server Actions (API)
│   │   ├── games/                  # Game pages
│   │   │   ├── page.tsx            # Game list
│   │   │   ├── create/             # Game creation
│   │   │   └── [id]/               # Game detail/edit
│   │   └── page.tsx                # Home (session)
│   ├── components/
│   │   ├── domain/                 # Domain components
│   │   │   ├── game/               # Game UI components
│   │   │   └── session/            # Session UI components
│   │   ├── pages/                  # Page components
│   │   └── ui/                     # Reusable UI
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utilities
│   ├── server/
│   │   ├── application/            # Use Cases & DTOs
│   │   │   ├── dto/                # Data Transfer Objects
│   │   │   └── use-cases/          # Business logic
│   │   ├── domain/                 # Domain layer
│   │   │   ├── entities/           # Domain entities
│   │   │   ├── errors/             # Domain errors
│   │   │   ├── repositories/       # Repository interfaces
│   │   │   ├── schemas/            # Zod validation schemas
│   │   │   └── value-objects/      # Value objects
│   │   └── infrastructure/         # External dependencies
│   │       └── repositories/       # Repository implementations
│   └── types/                      # TypeScript types
├── tests/
│   ├── e2e/                        # Playwright E2E tests
│   ├── integration/                # Integration tests
│   └── unit/                       # Vitest unit tests
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Migration files
│   └── dev.db                      # SQLite database
└── specs/                          # Feature specifications
```

## Database Schema

Current schema (as of 2025-11-11):

```prisma
model Game {
  id             String      @id @default(uuid())
  name           String
  creatorId      String
  maxPlayers     Int
  currentPlayers Int         @default(0)
  status         String      @default("準備中")
  presenters     Presenter[]
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model Presenter {
  id        String    @id @default(uuid())
  gameId    String
  nickname  String
  episodes  Episode[]
  game      Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())
}

model Episode {
  id          String    @id @default(uuid())
  presenterId String
  text        String
  isLie       Boolean
  presenter   Presenter @relation(fields: [presenterId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
}
```

## Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm test

# Run specific test file
npm test tests/unit/use-cases/CreateGame.test.ts

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Run specific test
npm run test:e2e -- tests/e2e/game-creation.spec.ts
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Repository Type (optional, defaults to 'prisma')
# REPOSITORY_TYPE="memory"  # Use in-memory for testing
```

## Development Workflow

1. **Feature Development**
   - Create feature spec in `specs/[feature-number]/spec.md`
   - Generate implementation plan
   - Write tests (TDD approach)
   - Implement feature following Clean Architecture
   - Run tests and ensure coverage

2. **Database Changes**
   - Update `prisma/schema.prisma`
   - Create migration: `npx prisma migrate dev --name description`
   - Update repository implementations
   - Update domain entities if needed

3. **Code Quality**
   - Format: `npm run format`
   - Lint: `npm run check`
   - Test: `npm test && npm run test:e2e`
   - Build: `npm run build`

## Development Tips

### Testing with Multiple Users

To simulate multiple users simultaneously:

1. **Normal Browser**: User A (e.g., session: `abc123`)
2. **Incognito/Private Mode**: User B (e.g., session: `xyz789`)

Each browser context maintains separate cookies, allowing independent sessions.

**Example Workflow:**
```bash
# Terminal 1: Seed games for User A
npm run seed:my abc123

# Terminal 2: Seed games for User B
npm run seed:my xyz789

# Browser 1 (normal): Navigate to http://localhost:3000/games
# Browser 2 (incognito): Navigate to http://localhost:3000/games
# Each sees only their own games
```

### Finding Your Session ID

Your session ID is stored in a browser cookie. To retrieve it:

1. Open **DevTools** (F12 or right-click → Inspect)
2. Navigate to **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. Expand **Cookies** → `http://localhost:3000`
4. Find the `sessionId` cookie
5. Copy its **Value** (e.g., `wDTbv1VX6IqHNmPgqbCX-`)

**Use Cases:**
- Generate test data for your session: `npm run seed:my <your-session-id>`
- Debug session-specific issues
- Verify session persistence across page reloads

### Page Navigation During Development

Since there are no built-in navigation buttons between player and moderator views:

- **Player View**: `http://localhost:3000/`
- **Moderator View**: `http://localhost:3000/games`

Bookmark both URLs or type them directly in the address bar.

## Contributing

This project follows:

- **Clean Architecture** for separation of concerns
- **Domain-Driven Design** for business logic
- **Repository Pattern** for data access abstraction
- **Test-Driven Development** for quality assurance

## License

Private project - All rights reserved

## Acknowledgments

Built with [Claude Code](https://claude.ai/code)
