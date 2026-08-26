# FX Gym - Full Stack Fitness Platform

A modern, full-stack fitness application built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js (Credentials + OAuth)
- **Validation**: Zod
- **Animations**: Framer Motion
- **Deployment**: Vercel + Neon/PostgreSQL

## 📁 Project Structure

```
fx-gym/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public pages (Home, About, Services, Pricing, Contact)
│   │   ├── (auth)/             # Auth pages (Login, Register)
│   │   ├── api/                # API routes
│   │   ├── globals.css         # Global styles
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # Base UI components (shadcn/ui style)
│   │   ├── layout/             # Header, Footer
│   │   ├── sections/           # Page sections (Hero, Stats, etc.)
│   │   ├── forms/              # Form components
│   │   └── pricing/            # Pricing components
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── prisma.ts           # Prisma client
│   │   ├── utils.ts            # Utility functions
│   │   └── validations/        # Zod schemas
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   └── styles/                 # Theme configuration
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding
├── public/                     # Static assets
├── .env.example                # Environment variables template
└── package.json
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud like Neon, Supabase, Railway)
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
cd fx-gym
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/fx_gym"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
# Optional OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

3. **Set up the database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

4. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to DB |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database with sample data |

## 🎨 Design System

### Colors (Dark/Neon Theme)
- **Background**: `#0a0a0f` (Near black)
- **Surface**: `#12121a` (Dark surface)
- **Primary**: `#00ff88` (Neon green)
- **Secondary**: `#00d4ff` (Neon cyan)
- **Accent**: `#ff3366` (Neon pink/red)
- **Text**: `#f0f0f5` (Near white)

### Fonts
- **UI**: Inter
- **Headings**: Space Grotesk

## 🔐 Authentication

NextAuth.js configured with:
- **Credentials** (email/password with bcrypt)
- **Google OAuth**
- **GitHub OAuth**
- **JWT sessions** (30-day expiry)
- **Role-based access** (ADMIN, TRAINER, MEMBER)

## 🗄️ Database Models

- **User** - Authentication & profiles
- **Service** - Fitness services offered
- **PricingPack** - Membership tiers
- **Membership** - User subscriptions
- **Checkin** - Attendance tracking
- **ContactMessage** - Contact form submissions
- **SiteContent** - CMS for dynamic content

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database (Neon/PostgreSQL)

1. Create PostgreSQL database
2. Run migrations: `npx prisma migrate deploy`
3. Update `DATABASE_URL` in Vercel env vars

## 🔮 Future Phases

- **Phase 2**: Admin Dashboard, Member Portal, Trainer Portal
- **Phase 3**: Check-in/out, Streaks, Progress Tracking
- **Phase 4**: Payments (Stripe), Notifications, Mobile App

## 📝 License

MIT License - feel free to use for your own projects!