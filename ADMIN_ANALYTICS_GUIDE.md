# Admin Analytics Dashboard - FlowGrid

## Overview

The Admin Analytics Dashboard provides platform administrators with comprehensive metrics and insights into user activity, festival health, and platform growth. This system is exclusively accessible to users with the `ADMIN` role in the database.

**Access URL:** `/dashboard/platform`

**Key Features:**
- Platform overview metrics (users, festivals, views)
- Weekly activity trends  
- Festival health scoring with detailed breakdowns
- Event tracking integration

---

## Accessing the Dashboard

### Prerequisites
1. You must have an account with `role = 'ADMIN'` in the database
2. Set admin role directly in Supabase:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```
3. Sign out and sign back in to refresh your session

### Navigation
- **Direct URL:** Navigate to `/dashboard/platform`
- **Dashboard Link:** Users with ADMIN role will see a "Platform" link (with Shield icon) in their dashboard navigation
- **Security:** Non-admin users will see "Access Denied" if they try to access this page

---

## Dashboard Features

### Platform Overview Cards

Five key metrics displayed at the top:

1. **Total Users** - All registered users on the platform
2. **Total Festivals** - All festivals created (published and unpublished)
3. **Last 30 Days** - New festivals created in the past 30 days
4. **Published** - Festivals currently live and accessible to the public
5. **Schedule Views** - Total number of times schedules have been viewed (from analytics events)

### Weekly Activity Table

Shows the last 8 weeks of platform activity with:
- Week date range
- New users registered that week
- New festivals created that week

This helps track growth trends and identify busy/slow periods.

### Festival Health Scores

The dashboard displays all festivals with a comprehensive health score (0-100) that helps identify:
- Active vs. inactive festivals
- Festivals needing engagement support
- Success metrics for outreach

**Expandable Details:** Click the chevron (▶) next to any festival to see a detailed breakdown showing exactly why it received its health score, including:
- Published status (+25 points if published)
- Session count (+20 points if >10 sessions)
- Schedule views (+20 points if >100 views)
- Branding customization (+15 points if has logo/colors)
- Social shares (+10 points if has shares)
- Recent activity (+10 points if active within 7 days)

Each criterion shows:
- ✅ Green checkmark if achieved
- ❌ Gray X if not achieved
- Current value and threshold requirement
- Points earned vs. maximum possible

**Health Score Color Coding:**
- 🟢 Green (80-100): Healthy, active festival
- 🟡 Yellow (60-79): Moderate engagement, could use support
- 🟠 Orange (40-59): Low engagement, needs attention
- 🔴 Red (0-39): Inactive or minimal setup

---

## Health Scoring Algorithm

The health score is calculated based on six criteria, each contributing points to a total score out of 100:

### 1. Published Status (25 points)
- **Criteria:** Festival `isPublished = true`
- **Why it matters:** Published festivals are accessible to the public and generating value

### 2. Session Count (20 points)
- **Criteria:** Festival has more than 10 sessions
- **Why it matters:** Indicates substantial content and event planning effort

### 3. Schedule Views (20 points)
- **Criteria:** Festival has received more than 100 schedule views
- **Why it matters:** Shows user engagement and traffic

### 4. Branding (15 points)
- **Criteria:** Festival has custom logo OR non-default colors
- **Default colors:** `#4a90e2` (primary), `#7b68ee` (secondary)
- **Why it matters:** Customization indicates investment in the festival's identity

### 5. Social Shares (10 points)
- **Criteria:** Festival has at least one `schedule_shared` analytics event
- **Why it matters:** Organic marketing and user enthusiasm

### 6. Recent Activity (10 points)
- **Criteria:** Last activity (analytics event or festival update) within past 7 days
- **Why it matters:** Active festivals are more likely to succeed

---

## Event Tracking System

The platform includes dual event tracking to both Prisma (internal) and Amplitude (optional external analytics).

### Tracked Events

1. **schedule_viewed** - User views a festival schedule page
2. **session_clicked** - User clicks on a session to view details
3. **schedule_shared** - User shares a schedule (social, link copy, etc.)
4. **filter_used** - User applies filters to the schedule

### Implementation

Event tracking is handled by `src/lib/trackEvent.ts`:

```typescript
import { trackScheduleView, trackSessionClick, trackScheduleShare } from '@/lib/trackEvent'

// Track schedule page view (automatically tracked on page load)
await trackScheduleView({
  userId: session?.user?.id,
  festivalId: festival.id,
  deviceId: getDeviceId() // Client-side unique ID
})

// Track session interaction
await trackSessionClick({
  userId: session?.user?.id,
  festivalId: festival.id,
  sessionId: session.id,
  deviceId: getDeviceId()
})

// Track schedule share (automatically tracked when user clicks share button)
await trackScheduleShare({
  festivalId: festival.id,
  method: 'copy' | 'facebook' | 'twitter' | 'native',
  deviceId: getDeviceId()
})
```

**Automatic Tracking:**
- **Schedule Views**: Automatically tracked when users visit `/{slug}/schedule`
- **Social Shares**: Automatically tracked when users click the share button and choose a method
- No manual implementation required - already integrated into the schedule interface

**Share Button Features:**
- Appears in the header of every public schedule page
- Options available:
  - Copy Link (with visual confirmation)
  - Facebook share
  - Twitter share
  - Native share menu (on mobile devices that support it)
- Each share method is tracked separately to show which platforms are most popular

### Database Storage

Events are stored in the `Analytics` table:

```prisma
model Analytics {
  id         String    @id @default(cuid())
  event      String
  properties Json?
  deviceId   String?
  userId     String?
  festivalId String?
  timestamp  DateTime  @default(now())
  
  user       User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
  festival   Festival? @relation(fields: [festivalId], references: [id], onDelete: Cascade)
}
```

### Amplitude Integration (Optional)

To enable Amplitude tracking:

1. Sign up at [amplitude.com](https://amplitude.com)
2. Get your API key and project ID
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_AMPLITUDE_API_KEY=your_api_key_here
   ```
4. Events will automatically send to both Prisma and Amplitude

---

## Technical Implementation

### File Structure

```
src/
├── lib/
│   ├── adminAnalytics.ts       # Server-side analytics helpers
│   └── trackEvent.ts           # Event tracking utilities
├── app/
│   └── dashboard/
│       └── platform/
│           └── page.tsx        # Admin dashboard UI
└── types/
    └── next-auth.d.ts          # Extended NextAuth types with role
```

### Helper Functions

**`getPlatformOverview()`**
- Returns high-level platform metrics
- Used for the overview cards

**`getWeeklyStats()`**
- Returns weekly activity for last 8 weeks
- Generates week labels and counts

**`getFestivalHealthList()`**
- Returns all festivals with health scores and detailed breakdowns
- Sorts by health score (descending)
- Includes expandable breakdown data for each scoring criterion

### Types

```typescript
export type PlatformOverview = {
  totalUsers: number
  totalFestivals: number
  festivalsLast30Days: number
  publishedFestivals: number
  totalScheduleViews: number
}

export type HealthBreakdown = {
  published: { achieved: boolean; points: number }
  sessions: { achieved: boolean; points: number; value: number }
  views: { achieved: boolean; points: number; value: number }
  branding: { achieved: boolean; points: number }
  shares: { achieved: boolean; points: number }
  recentActivity: { achieved: boolean; points: number; lastActivity: Date | null }
}

export type FestivalHealth = {
  id: string
  name: string
  ownerEmail: string | null
  plan: string
  sessionsCount: number
  scheduleViews: number
  lastActivity: Date | null
  isPublished: boolean
  hasBranding: boolean
  hasShares: boolean
  healthScore: number
  breakdown: HealthBreakdown
}
```

---

## Troubleshooting

### Dashboard shows "Access Denied"

**Problem:** Your session doesn't have the ADMIN role

**Solution:**
1. Verify your role in Supabase:
   ```sql
   SELECT email, role FROM users WHERE email = 'your-email@example.com';
   ```
2. If `role` is not `'ADMIN'`, update it:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```
3. Sign out completely from FlowGrid
4. Sign back in to get a fresh session with the updated role

### Health scores all showing 0

**Problem:** No analytics events being tracked

**Solution:**
1. Verify `Analytics` table exists in database:
   ```sql
   SELECT COUNT(*) FROM "Analytics";
   ```
2. Check that tracking calls are being made on public schedule pages
3. Test by manually triggering a view:
   ```typescript
   import { trackScheduleView } from '@/lib/trackEvent'
   await trackScheduleView({ festivalId: 'test-id', deviceId: 'test-device' })
   ```

### Breakdown details not showing

**Problem:** Database may have old data without breakdown structure

**Solution:**
The breakdown is calculated fresh on each load. If festivals aren't showing breakdowns:
1. Check browser console for errors
2. Verify the festival has been loaded with the latest schema
3. Clear cache and reload the page

### Weekly stats showing all zeros

**Problem:** No recent signups or festival creation activity

**Solution:**
This is expected for new platforms or quiet periods. As users sign up and create festivals, the stats will populate.

---

## Future Enhancements

Potential additions to the analytics system:

1. **User Engagement Metrics**
   - Session duration on schedules
   - Return visit rate
   - User journey tracking

2. **Revenue Analytics** (for Pro plans)
   - MRR (Monthly Recurring Revenue)
   - Conversion rates
   - Churn analysis

3. **Festival Comparison**
   - Compare festivals side-by-side
   - Benchmark against platform averages
   - Success pattern identification

4. **Export Functionality**
   - CSV export of all data
   - PDF report generation
   - Scheduled email summaries

5. **Cohort Analysis**
   - User retention by signup week
   - Festival success by creator tenure
   - Feature adoption tracking

---

## Support

For questions or issues with the admin analytics system:

1. Check this guide first
2. Review the implementation files listed above
3. Test with sample data using the seed script
4. Contact technical support if issues persist

**Last Updated:** December 2024
**Version:** 2.0 (with expandable health score breakdowns)
