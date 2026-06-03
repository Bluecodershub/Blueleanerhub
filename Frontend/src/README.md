# Bluelearnerhub Frontend

Next.js 14+ frontend for the Bluelearnerhub edtech platform.

## 🏗️ Architecture

### App Router Structure

The app uses Next.js 14 App Router with route groups for role-based layouts:

- **(marketing)** - Public landing pages
- **(auth)** - Authentication pages (centered layout)
- **(student)** - Student portal with sidebar
- **(candidate)** - Job seeker dashboard
- **(corporate)** - Corporate/employer dashboard
- **(hr)** - HR recruiter dashboard
- **(admin)** - Admin panel
- **(shared)** - Shared features across roles

### Key Features

- 🎨 **Modern UI**: shadcn/ui + Radix UI components
- 🎭 **Animations**: Isometric designs, Lottie animations, smooth transitions
- 🌓 **Dark Mode**: Full dark/light theme support
- 📱 **Responsive**: Mobile-first design
- ⚡ **Performance**: Code splitting, lazy loading, optimized images
- 🔐 **Auth**: JWT-based authentication with role-based access
- 🎯 **Type Safety**: Full TypeScript coverage

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Directory Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── (marketing)/        # Public pages
│   ├── (auth)/            # Authentication
│   ├── (student)/         # Student dashboard
│   ├── (candidate)/       # Candidate dashboard
│   ├── (corporate)/       # Corporate dashboard
│   ├── (admin)/           # Admin panel
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── branding/          # Logo and branding
│   ├── animations/        # Animated components
│   ├── tutorials/         # Tutorial components
│   ├── hackathon/         # Hackathon features
│   ├── jobs/              # Job listings
│   ├── interview/         # Interview features
│   ├── quiz/              # Quiz components
│   ├── ide/               # Code editor
│   ├── ai/                # AI companion
│   └── shared/            # Shared components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
│   ├── api.ts            # API client (Axios)
│   └── utils.ts          # Helper functions
├── store/                # State management (Zustand)
├── types/                # TypeScript types
├── config/               # Configuration files
│   ├── theme.ts          # Brand colors
│   ├── nav.ts            # Navigation config
│   └── site.ts           # Site metadata
└── styles/               # Global styles
```

## 🎨 Branding

**Brand Name**: Bluelearnerhub  
**Tagline**: Learn. Code. Excel. Get Hired.  
**Powered by**: Bluelearnerhub

**Primary Colors**:

- Main Brand: `#3b82f6` (Blue 500)
- Interactive: `#2563eb` (Blue 600)

**Fonts**:

- Sans: Inter
- Mono: JetBrains Mono

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **API Client**: Axios
- **Code Editor**: Monaco Editor
- **Animations**: Framer Motion, Lottie
- **Icons**: Lucide Icons

## 📦 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 🎯 Key Components

### Layout Components

- `Header` - Main navigation
- `Sidebar` - Dashboard sidebar
- `Footer` - Site footer

### Feature Components

- `TutorialViewer` - Interactive lesson viewer
- `CodePlayground` - Interactive code editor
- `HackathonCard` - Hackathon preview
- `AIChatInterface` - AI Syncc companion
- `InterviewRoom` - Video interview interface

## 🔗 API Integration

API client is configured in `src/lib/api.ts` with:

- Automatic JWT token injection
- Request/response interceptors
- Error handling
- Type-safe endpoints

```typescript
import api from '@/lib/api'

// Example usage
const tutorials = await api.get('/tutorials')
```

## 🎭 Animations

The platform features custom animations:

- Isometric hero sections
- Floating elements
- Liquid flow backgrounds
- Page transitions
- Loading states

Animation components are in `src/components/animations/`.

## 📱 Responsive Design

Breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 🧪 Development

```bash
# Run development server with turbo
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## 🚢 Deployment

Build optimized for:

- Static export for CDN
- Docker containerization
- Vercel deployment
- Server-side rendering (SSR)

## 📄 License

Proprietary - © 2026 Bluelearnerhub (Powered by Bluelearnerhub)
