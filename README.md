# Flow Grid

Transform any festival or### 1. Clone & Configure
\\\ash
git clone [repository-url]
cd flow-grid
cp .env.example .env.local
# Edit .env.local with your event details
\\\op event into a beautiful, interactive schedule with booking capabilities.

## What This Is

This is the **business platform version** of the successful MAC Festival schedule app. It's designed to be configurable for any festival or workshop event while maintaining all the powerful features that made the original so popular.

##  Perfect For

- **Yoga Festivals** - Schedule classes, workshops, and retreats
- **Dance Festivals** - Organize workshops, performances, and social events  
- **Art Workshops** - Manage creative sessions and artist meetups
- **Conferences** - Handle talks, breakouts, and networking sessions
- **Retreats** - Coordinate activities, meals, and free time

##  Key Features

### Core Scheduling
-  **Multi-day schedule** with filtering by day, style, level, teacher
-  **Smart search** across all sessions
-  **Mobile-responsive** design that works on any device
-  **Customizable branding** - colors, logos, styling

### Advanced Booking (Optional)
-  **Capacity management** - limit attendees per session
-  **Multi-person booking** - register groups together
-  **Real-time conflict detection** - prevents double bookings
-  **Cross-device sync** via Google Sheets integration

### Special Features  
-  **Photoshoot booking** - time-slot management for photo sessions
-  **Event tracking** - participant counts for special events (ceremonies, etc.)
-  **Google Sheets integration** - easy data management
-  **Zero-maintenance** - works with simple CSV uploads

##  Quick Start

### 1. Clone & Configure
\\\ash
git clone [repository-url]
cd festival-scheduler
cp .env.example .env.local
# Edit .env.local with your event details
\\\

### 2. Setup Google Sheets (Optional)
- Create Google Sheet with your schedule
- Add booking tabs if using reservation features
- Configure webhook for real-time updates

### 3. Deploy
\\\ash
npm install
npm run build
npm start
\\\

##  Project Structure

\\\
flow-grid/
 src/
    config/eventConfig.js    # All customization happens here
    app/page.js             # Main schedule interface  
    utils/                  # Google Sheets, bookings, etc.
    data/sessions.json      # Fallback schedule data
 public/                     # Images, logos, assets
 .env.example               # Configuration template
 README.md                  # This file
\\\

##  Customization

All event-specific settings are in \src/config/eventConfig.js\:

- **Event name, description, logos**
- **Colors and branding** 
- **Feature toggles** (enable/disable booking, photoshoot, etc.)
- **Google Sheets integration**
- **Contact information**

##  Data Management

### Simple CSV Method
1. Create schedule in Google Sheets or Excel
2. Export as CSV  
3. Upload to replace \data.csv\
4. Deploy - that's it!

### Advanced Google Sheets Integration
- Real-time updates from Google Sheets
- Booking data synced across devices
- No manual CSV exports needed

##  Business Model

This platform can be used for:

1. **White-label service** - Custom setup for each festival
2. **SaaS platform** - Multi-tenant with subdomains  
3. **One-time licensing** - Sell configured instances
4. **Template marketplace** - Pre-built festival types

##  Proven Success

Built from the MAC Festival schedule app that received overwhelmingly positive feedback:
- Loved by festival attendees
- Easy for organizers to manage
- Works perfectly on mobile devices
- Handles complex multi-day events

##  Contributing

This started as a custom solution for MAC Festival and evolved into a business platform. We welcome contributions that make it even more flexible and powerful for festival organizers worldwide.

##  Support

For business inquiries, custom setups, or technical support:
- Email: [your-email]
- Website: [your-website]

##  License

MIT License - Feel free to use for commercial projects.

---

**Transform your festival into an amazing digital experience! **
