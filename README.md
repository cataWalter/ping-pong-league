# Ping Pong League 🏓

A world-class web application for tracking and managing ping pong matches within your company. Features advanced ELO rating system, achievement tracking, comprehensive statistics, head-to-head comparisons, and tournament management.

![Ping Pong League](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### Core Features
- **Player Management**: Register and manage company employees as players
- **Match Tracking**: Record match results with detailed scores and notes
- **Leaderboard**: Real-time rankings based on ELO ratings with podium display
- **Match History**: View past matches and head-to-head records
- **Statistics Dashboard**: Win rates, average scores, streaks, and more

### Advanced Features
- **ELO Rating System**: Industry-standard rating calculations with margin of victory adjustments
- **Achievement System**: 18+ achievements for milestones (win streaks, rating thresholds, etc.)
- **Head-to-Head Comparison**: Compare any two players with detailed statistics
- **Rating History**: Track rating changes over time with interactive charts
- **Win/Loss Streaks**: Track current and best streaks
- **Best of Formats**: Support for single game, best of 3, 5, or 7
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🏆 Rating Levels

| Rating | Level | Badge Color |
|--------|-------|-------------|
| 1400+ | Grand Master | 🟣 Purple |
| 1300-1399 | Master | 🟡 Yellow |
| 1200-1299 | Expert | 🔵 Blue |
| 1100-1199 | Skilled | 🟢 Green |
| 1000-1099 | Intermediate | ⚪ Gray |
| <1000 | Beginner | ⚪ Gray |

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org) with TypeScript (App Router)
- **Database**: SQLite (development) / [Turso](https://turso.tech) (production)
- **ORM**: [Prisma](https://prisma.io)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Charts**: Custom SVG charts with Tailwind
- **Authentication**: NextAuth.js (optional)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-company/ping-pong-league.git
   cd ping-pong-league
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Initialize the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed sample data** (optional):
   ```bash
   npm run db:seed
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**: Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ping-pong-league/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── players/      # Players API
│   │   │   ├── matches/      # Matches API
│   │   │   ├── leaderboard/  # Leaderboard API
│   │   │   └── stats/        # Statistics API
│   │   ├── players/          # Player pages
│   │   ├── matches/          # Match pages
│   │   ├── leaderboard/      # Leaderboard page
│   │   ├── stats/            # Statistics page
│   │   ├── head2head/        # Head-to-head comparison
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   └── Badge.tsx
│   │   ├── Avatar.tsx        # Player avatar component
│   │   ├── RatingChart.tsx   # Rating history chart
│   │   ├── ThemeProvider.tsx # Dark mode provider
│   │   └── ThemeToggle.tsx   # Dark mode toggle
│   ├── lib/
│   │   ├── db.ts             # Prisma client
│   │   ├── elo.ts            # ELO rating calculations
│   │   ├── achievements.ts   # Achievement definitions
│   │   └── utils.ts          # Utility functions
│   └── types/                # TypeScript types
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data seeder
├── public/                   # Static assets
├── .env.example              # Environment template
├── next.config.js            # Next.js config
├── tailwind.config.js        # Tailwind config
├── tsconfig.json             # TypeScript config
└── package.json
```

## 📊 Database Schema

### Key Tables

- **players**: Player profiles with ratings, stats, and achievements
- **matches**: Match records with scores and rating changes
- **rating_history**: Historical rating tracking
- **achievements**: Earned achievements
- **tournaments**: Tournament information
- **tournament_players**: Tournament participants

## 🏅 Achievement System

The app includes 18+ achievements:

| Icon | Name | Description |
|------|------|-------------|
| 🏆 | First Blood | Win your first match |
| ⭐ | Rising Star | Win 5 matches |
| 🎯 | Challenger | Win 10 matches |
| 🎖️ | Veteran | Win 25 matches |
| 👑 | Legend | Win 50 matches |
| 🔥 | On Fire | Win 3 matches in a row |
| 💪 | Unstoppable | Win 5 matches in a row |
| 🌟 | Dominant Force | Win 10 matches in a row |
| 📈 | Skilled Player | Reach a rating of 1100 |
| 🎓 | Expert | Reach a rating of 1200 |
| 🥇 | Master | Reach a rating of 1300 |
| 🏅 | Grand Master | Reach a rating of 1400 |
| 🏓 | Active Player | Play 10 matches |
| 💯 | Dedicated | Play 50 matches |
| 💎 | Century | Play 100 matches |
| 🎯 | Consistent Winner | Maintain 70% win rate |
| 🏆 | Elite Player | Maintain 80% win rate |
| 🔄 | Comeback King | Win after being behind |

## 📈 ELO Rating System

The rating system uses standard ELO calculations with:
- K-factor of 32 for rating changes
- Margin of victory multiplier
- Initial rating of 1000
- Rating history tracking
- Win probability display

### Formula

```
Expected Score = 1 / (1 + 10^((Opponent Rating - Player Rating) / 400))
New Rating = Old Rating + K * (Actual Score - Expected Score) * Margin Multiplier
```

## 🔧 Configuration

### Environment Variables

```env
# Development (SQLite)
DATABASE_URL=file:./dev.db

# Production (Turso)
DATABASE_URL=libsql://your-db.your-org.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Authentication (optional)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Application
NEXT_PUBLIC_APP_NAME=Ping Pong League
```

## 🚀 Production Deployment

### Using Turso (Recommended)

1. **Install Turso CLI**:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```

2. **Create a database**:
   ```bash
   turso auth signup
   turso db create ping-pong-league
   ```

3. **Get connection details**:
   ```bash
   turso db show ping-pong-league --url
   turso db tokens create ping-pong-league
   ```

4. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

5. **Add environment variables** in Vercel dashboard

## 📱 API Endpoints

### Players
- `GET /api/players` - List all players
- `POST /api/players` - Create a new player

### Matches
- `GET /api/matches` - List all matches
- `POST /api/matches` - Record a new match

### Leaderboard
- `GET /api/leaderboard` - Get current rankings

### Statistics
- `GET /api/stats` - Get league statistics

## 🛠 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed sample data
```

## 🎨 Design Features

- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive**: Mobile-first design with bottom navigation on mobile
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: ARIA labels, keyboard navigation, high contrast support
- **Performance**: Optimized images, code splitting, lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by office ping pong leagues everywhere
- Built with ❤️ for competitive table tennis enthusiasts
- ELO system based on standard chess rating algorithms
- Design inspired by modern SaaS applications

---

**Made with Next.js, TypeScript, and Tailwind CSS**