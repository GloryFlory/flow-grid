# Flow Grid# Flow Grid



**Festival Scheduler / Flow Grid** – Interactive scheduling platform for **Festival Scheduler / Flow Grid** – Interactive scheduling platform for 

festivals and retreats built with Next.js, Prisma, and Supabase.festivals and retreats built with Next.js, Prisma, and Supabase.



## What This Is## What This Is



Flow Grid is a modern, production-ready scheduling platform designed for Flow Grid is a modern, production-ready scheduling platform designed for 

festivals, yoga retreats, dance workshops, and multi-day events. Built on festivals, yoga retreats, dance workshops, and multi-day events. Built on 

Next.js 15 with passwordless authentication, dynamic session management, Next.js 15 with passwordless authentication, dynamic session management, 

and customizable branding.and customizable branding.



##  Perfect For##  Perfect For



- **Yoga Festivals** - Schedule classes, workshops, and retreats- **Yoga Festivals** - Schedule classes, workshops, and retreats

- **Dance Festivals** - Organize workshops, performances, and social events  - **Dance Festivals** - Organize workshops, performances, and social events  

- **Art Workshops** - Manage creative sessions and artist meetups- **Art Workshops** - Manage creative sessions and artist meetups

- **Conferences** - Handle talks, breakouts, and networking sessions- **Conferences** - Handle talks, breakouts, and networking sessions

- **Retreats** - Coordinate activities, meals, and free time- **Retreats** - Coordinate activities, meals, and free time



##  Features##  Key Features



### Dynamic Session Scheduling### Core Scheduling

-  **Multi-day schedule** with filtering by day, style, level, teacher-  **Multi-day schedule** with filtering by day, style, level, teacher

-  **Smart search** across all sessions-  **Smart search** across all sessions

-  **Mobile-responsive** design that works on any device-  **Mobile-responsive** design that works on any device

-  **Teacher profiles** with photos and bios-  **Customizable branding** - colors, logos, styling



### Passkey + Magic-Link Authentication### Advanced Booking (Optional)

-  **WebAuthn passkeys** - Sign in with Face ID, Touch ID, or Windows Hello-  **Capacity management** - limit attendees per session

-  **Magic-link fallback** - Passwordless email authentication  -  **Multi-person booking** - register groups together

-  **Conditional mediation** - Auto-prompt for saved passkeys-  **Real-time conflict detection** - prevents double bookings

-  **Google OAuth** - Social sign-in support-  **Cross-device sync** via Google Sheets integration



👉 **See full Passkey implementation details in [docs/PASSKEYS.md](./docs/PASSKEYS.md)**### Special Features  

-  **Photoshoot booking** - time-slot management for photo sessions

### Teacher & Session Management-  **Event tracking** - participant counts for special events (ceremonies, etc.)

-  **Teacher CRUD operations** - Create, edit, delete teacher profiles-  **Google Sheets integration** - easy data management

-  **Session management** - Full control over schedule entries-  **Zero-maintenance** - works with simple CSV uploads

-  **Photo uploads** - Teacher profile images

-  **Multi-teacher sessions** - Assign multiple instructors##  Quick Start



### Stripe Billing Integration### 1. Clone & Configure

-  **Subscription plans** - Free, Pro, Enterprise tiers\\\ash

-  **Usage limits** - Festival count per plangit clone [repository-url]

-  **Stripe Checkout** - Seamless payment flowcd festival-scheduler

-  **Customer portal** - Self-service billing managementcp .env.example .env.local

# Edit .env.local with your event details

### Branding Customization\\\

-  **Custom logos** - Upload festival-specific branding

-  **Color themes** - Primary, secondary, and accent colors### 2. Setup Google Sheets (Optional)

-  **Custom domains** - White-label per festival- Create Google Sheet with your schedule

-  **Subdomain routing** - Multi-tenant architecture- Add booking tabs if using reservation features

- Configure webhook for real-time updates

##  Quick Start

### 3. Deploy

### 1. Install Dependencies\\\ash

```bashnpm install

npm installnpm run build

npx prisma generatenpm start

npm run dev\\\

```

##  Project Structure

### 2. Configure Environment

```bash\\\

cp .env.example .env.localflow-grid/

# Edit .env.local with your database, auth, and API keys src/

```    config/eventConfig.js    # All customization happens here

    app/page.js             # Main schedule interface  

Required environment variables:    utils/                  # Google Sheets, bookings, etc.

- `DATABASE_URL` - PostgreSQL connection string (Supabase)    data/sessions.json      # Fallback schedule data

- `NEXTAUTH_SECRET` - NextAuth.js secret key public/                     # Images, logos, assets

- `RESEND_API_KEY` - Email service for magic links .env.example               # Configuration template

- `UPSTASH_REDIS_REST_URL` - Redis for passkey challenges README.md                  # This file

- `GOOGLE_CLIENT_ID` - Google OAuth credentials (optional)\\\



### 3. Setup Database##  Customization

```bash

npx prisma db pushAll event-specific settings are in \src/config/eventConfig.js\:

```

- **Event name, description, logos**

### 4. Run Development Server- **Colors and branding** 

```bash- **Feature toggles** (enable/disable booking, photoshoot, etc.)

npm run dev- **Google Sheets integration**

# Open http://localhost:3000- **Contact information**

```

##  Data Management

##  Project Structure

### Simple CSV Method

```1. Create schedule in Google Sheets or Excel

festival-scheduler/2. Export as CSV  

├── src/3. Upload to replace \data.csv\

│   ├── app/                    # Next.js App Router pages4. Deploy - that's it!

│   │   ├── auth/              # Authentication pages (signin, signup)

│   │   ├── api/               # API routes (auth, festivals, etc.)### Advanced Google Sheets Integration

│   │   ├── dashboard/         # Dashboard & admin panel- Real-time updates from Google Sheets

│   │   └── [slug]/            # Dynamic festival pages- Booking data synced across devices

│   ├── components/            # React components- No manual CSV exports needed

│   │   ├── dashboard/         # Admin UI components

│   │   ├── schedule/          # Festival schedule UI##  Business Model

│   │   └── ui/                # Shared UI primitives

│   ├── lib/                   # Utilities & clientsThis platform can be used for:

│   │   ├── auth.ts           # NextAuth configuration

│   │   ├── passkeys.ts       # WebAuthn helpers1. **White-label service** - Custom setup for each festival

│   │   ├── prisma.ts         # Database client2. **SaaS platform** - Multi-tenant with subdomains  

│   │   └── redis.ts          # Redis client3. **One-time licensing** - Sell configured instances

│   ├── hooks/                # Custom React hooks4. **Template marketplace** - Pre-built festival types

│   └── types/                # TypeScript definitions

├── prisma/##  Proven Success

│   └── schema.prisma         # Database schema

├── docs/                     # DocumentationBuilt from the MAC Festival schedule app that received overwhelmingly positive feedback:

│   └── PASSKEYS.md          # Passkey implementation guide- Loved by festival attendees

└── public/                   # Static assets (logos, images)- Easy for organizers to manage

```- Works perfectly on mobile devices

- Handles complex multi-day events

##  Tech Stack

##  Contributing

- **Framework**: Next.js 15 (App Router)

- **Database**: PostgreSQL (Supabase)This started as a custom solution for MAC Festival and evolved into a business platform. We welcome contributions that make it even more flexible and powerful for festival organizers worldwide.

- **ORM**: Prisma

- **Auth**: NextAuth.js with WebAuthn/Passkeys##  Support

- **Email**: Resend

- **Cache**: Upstash RedisFor business inquiries, custom setups, or technical support:

- **Payments**: Stripe- Email: [your-email]

- **Styling**: Tailwind CSS- Website: [your-website]

- **Language**: TypeScript

##  License

##  Authentication

MIT License - Feel free to use for commercial projects.

Flow Grid implements modern passwordless authentication:

---

1. **Magic Links** - Email-based sign-in (no passwords)

2. **WebAuthn Passkeys** - Biometric authentication (Face ID, Touch ID)**Transform your festival into an amazing digital experience! **

3. **Google OAuth** - Social login option
4. **One-time Setup Modal** - Prompts passkey registration after first login
5. **Conditional Mediation** - Auto-fills passkeys on supported browsers

See [docs/PASSKEYS.md](./docs/PASSKEYS.md) for complete implementation details.

##  Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Environment Variables
Configure in Vercel dashboard or `.env.production`:
- Update `WEBAUTHN_RP_ID` to your domain (e.g., `yourdomain.com`)
- Set `NEXTAUTH_URL` to production URL (e.g., `https://yourdomain.com`)
- Ensure all API keys are production-ready

##  Database Schema

Key models:
- **User** - Authentication and user data
- **Festival** - Event configurations with branding
- **FestivalSession** - Individual schedule entries
- **Teacher** - Instructor profiles
- **WebAuthnCredential** - Passkey credentials
- **Subscription** - Billing and plan limits
- **Booking** - Session reservations

##  Customization

All festival-specific settings are stored in the database and configurable 
via the admin dashboard:

- Event name, description, dates
- Custom logo uploads
- Color schemes (primary, secondary, accent)
- Custom domain mapping
- Session templates and categories

##  Business Model

Flow Grid supports multiple deployment models:

1. **SaaS Platform** - Multi-tenant with subscriptions
2. **White-Label Service** - Custom instances per client
3. **Self-Hosted** - Open-source deployment
4. **Enterprise License** - On-premise installations

##  Proven Success

Built from the successful MAC Festival schedule app, evolved into a 
full-featured platform serving multiple festivals and events worldwide.

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  Support

For technical support, feature requests, or business inquiries:
- GitHub Issues: [Create an issue](https://github.com/your-org/festival-scheduler/issues)
- Email: support@tryflowgrid.com

##  License

MIT License - Feel free to use for commercial projects.

---

Maintained with ❤️ by Flo – Flow Grid Team
