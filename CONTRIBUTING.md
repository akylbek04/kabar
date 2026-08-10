# Contributing to Kabar

Thank you for considering a contribution! This guide will help you get started.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Git

## Getting Started

```bash
# Clone and install
git clone https://github.com/akylbek04/kabar.git
cd kabar
cd backend && npm ci && cd ..
cd client && npm ci && cd ..

# Set up environment
cd backend && cp .env.example .env
# Edit .env with your MongoDB URI and a strong JWT_SECRET

# Start development
cd backend && npm run dev   # API on :8000
cd client && npm run dev    # UI on :5173
```

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run the full check before pushing:
   ```bash
   npm run check   # typecheck + lint + build (from root)
   npm test        # run all tests (from root)
   ```
4. Open a Pull Request against `main`
5. CI checks must pass before merging

## Project Structure

| Directory | Purpose |
| --------- | ------- |
| `backend/src/config/` | Environment, DB, auth, multer config |
| `backend/src/controllers/` | Route handlers |
| `backend/src/services/` | Business logic |
| `backend/src/validators/` | Zod request schemas |
| `backend/src/models/` | Mongoose schemas |
| `backend/src/lib/` | Socket.io and WebRTC signaling |
| `client/src/pages/` | React page components |
| `client/src/hooks/` | State management (Zustand) and Socket hooks |
| `client/src/components/` | Reusable UI components |

## Coding Standards

- TypeScript strict mode
- Use `zod` for all request validation
- Run `npm run lint` — fix warnings before committing
- Write tests for new business logic in `src/__tests__/`

## Commit Messages

Use conventional commits:

```
feat(auth): add password strength indicator
fix(chat): resolve topic routing for supergroups
docs: update API endpoint documentation
chore(deps): update mongoose to v8.20
test: add chat service unit tests
```

## Need Help?

Open an issue with the **question** label and we'll help you get started.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.
