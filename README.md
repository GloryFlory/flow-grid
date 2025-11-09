# Flow Grid

**Modern festival scheduling platform for multi-day events**

Built with Next.js 15, Prisma, Supabase, and TypeScript.

---

## What This Is

Flow Grid is a production-ready scheduling platform designed for festivals, yoga retreats, dance workshops, and multi-day events. It combines beautiful public schedules with powerful admin tools, optional booking systems, and Google Sheets integration.

## Perfect For

- **Yoga Festivals** - Multi-day retreats with classes, workshops, and meditation
- **Dance Festivals** - Organize workshops, performances, jams, and socials
- **Conferences** - Schedule talks, breakouts, networking sessions
- **Wellness Retreats** - Coordinate activities across multiple days/weeks
- **Workshop Series** - Manage multi-day creative or educational programs

## Key Features

### Smart Scheduling
- ✅ **Multi-week support** - Handles festivals spanning weeks with repeating day names
- ✅ **Date-based grouping** - Automatically assigns correct dates to sessions
- ✅ **Conditional date display** - Shows dates only when needed (multi-week festivals)
- ✅ **Drag-and-drop reordering** - Custom session order with visual interface
- ✅ **Smart search & filtering** - Filter by day, style, level, teacher, location

### Session Management
- ✅ **CSV bulk upload** - Import hundreds of sessions at once
- ✅ **Google Sheets integration** - Sync from spreadsheets with preview
- ✅ **Merge or Replace modes** - Update sessions without losing data
- ✅ **Three card types** - Minimal, photo, or detailed display
- ✅ **Rich session data** - Prerequisites, capacity, styles, descriptions

### Booking System
- ✅ **Capacity management** - Set limits per session
- ✅ **Real-time availability** - "FULL" badges when at capacity
- ✅ **Participant tracking** - See who booked what
- ✅ **Optional payments** - Flag sessions requiring payment

### Beautiful Public Interface
- ✅ **Mobile-responsive** - Perfect on any device
- ✅ **Tab navigation** - Easy day-by-day browsing
- ✅ **Horizontal scrolling** - Handles 21+ day festivals
- ✅ **European date format** - "14 Nov" instead of "11/14"
- ✅ **Teacher profiles** - Photos, bios, and session lists
- ✅ **Session modals** - Full details in beautiful popups

### Customization
- ✅ **Custom branding** - Upload logos, set colors
- ✅ **Social media links** - Instagram, Facebook, website
- ✅ **Public/private toggle** - Control visibility
- ✅ **Custom slugs** - Your URL: domain.com/your-festival/schedule

### Analytics
- ✅ **View tracking** - See how many people visit your schedule
- ✅ **Session clicks** - Track most popular sessions
- ✅ **Engagement metrics** - Understand attendee interest

### Authentication
- ✅ **Magic link signin** - Passwordless email authentication
- ✅ **Passkey support** - Face ID, Touch ID, Windows Hello (optional)
- ✅ **Secure & simple** - No passwords to remember

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/your-org/festival-scheduler.git
cd festival-scheduler
npm install
npx prisma generate
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- `DATABASE_URL` - PostgreSQL connection (Supabase recommended)
- `NEXTAUTH_SECRET` - Random secret for auth sessions
- `NEXTAUTH_URL` - Your app URL (e.g., `http://localhost:3000`)
- `RESEND_API_KEY` - Email service for magic links (optional)

### 3. Setup Database
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

## Data Management

### Simple CSV Method
1. Create schedule in Google Sheets or Excel
2. Export as CSV
3. Upload via dashboard → "Import from CSV"
4. Deploy - that's it!

### Advanced Google Sheets Integration
- Real-time updates from Google Sheets
- Booking data synced across devices
- No manual CSV exports needed
- See `GOOGLE_SHEETS_SETUP.md` for configuration

## Project Structure

```
festival-scheduler/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Festival admin panel
│   │   └── [slug]/            # Public festival pages
│   ├── components/            # React components
│   │   ├── dashboard/         # Admin UI components
│   │   ├── schedule/          # Public schedule UI
│   │   └── ui/                # Shared UI primitives
│   ├── lib/                   # Utilities & clients
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── prisma.ts         # Database client
│   │   └── supabase.ts       # Supabase client
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript definitions
├── prisma/
│   └── schema.prisma         # Database schema
└── public/                   # Static assets
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth.js with magic links & passkeys
- **Email**: Resend (optional)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Environment Variables
Configure in Vercel dashboard:
- Update `NEXTAUTH_URL` to production URL
- Set `WEBAUTHN_RP_ID` to your domain (for passkeys)
- Ensure all API keys are production-ready

See `VERCEL_DEPLOYMENT.md` for complete deployment guide.

## Database Schema

Key models:
- **User** - Authentication and user data
- **Festival** - Event configurations with branding
- **FestivalSession** - Individual schedule entries
- **Teacher** - Instructor profiles
- **Booking** - Session reservations (optional)
- **WebAuthnCredential** - Passkey credentials (optional)

## Documentation

- **USER_GUIDE.md** - Complete guide for festival organizers
- **GLOSSARY.md** - All platform terms and concepts defined
- **GOOGLE_SHEETS_SETUP.md** - Configure Google Sheets integration
- **BOOKING_SYSTEM_SETUP.md** - Enable session bookings
- **VERCEL_DEPLOYMENT.md** - Deploy to production

## Business Model

Flow Grid supports multiple deployment models:

1. **SaaS Platform** - Multi-tenant with subscriptions
2. **White-Label Service** - Custom instances per client
3. **Self-Hosted** - Open-source deployment
4. **Template Marketplace** - Pre-built festival types

## Proven Success

Built from the successful MAC Festival schedule app, evolved into a 
full-featured platform serving multiple festivals and events worldwide.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For technical support, feature requests, or business inquiries:
- Create an issue on GitHub
- Email: support@tryflowgrid.com

## License

MIT License - Feel free to use for commercial projects.

---

**Transform your festival into an amazing digital experience!**

Maintained with ❤️ by the Flow Grid Team
