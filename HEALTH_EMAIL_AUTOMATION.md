# Health Score Email Automation

## Overview
The health score email system sends automated, personalized follow-up emails to users whose events have low health scores. Each email includes specific, actionable recommendations based on which criteria the event is missing.

## Health Score Criteria (Total: 100 points)

1. **Published** (25 points) - Event is live and accessible to the public
2. **Has Sessions** (20 points) - Event has >10 sessions
3. **Has Views** (20 points) - Schedule has >100 views
4. **Has Branding** (15 points) - Custom logo or colors uploaded
5. **Has Shares** (10 points) - Event has been shared at least once
6. **Recent Activity** (10 points) - Updated within last 7 days

## Email Tiers

### Critical (0-39) 🚨
- **Subject**: "Let's Get Your Event Live! 🚀"
- **Tone**: Urgent but encouraging
- **Focus**: Getting the most important things done first (publish + sessions)

### Moderate (40-59) ✨
- **Subject**: "A Few Quick Wins to Improve Your Event ✨"
- **Tone**: Encouraging and supportive
- **Focus**: Building on existing progress

### Good (60-79) 💪
- **Subject**: "Almost Perfect! Here's How to Reach 100% 💪"
- **Tone**: Congratulatory with gentle nudges
- **Focus**: Final polish and optimization

## How to Use

### Access the Tool
Navigate to: **Platform Dashboard > Health Emails** button (top right)

Or directly: `/admin/health-emails`

### Steps

1. **Set Threshold**
   - Default: 60 (sends to events with <60 health score)
   - Adjust based on campaign goals
   - Lower threshold = fewer emails, higher impact users
   - Higher threshold = more emails, broader reach

2. **Preview Recipients**
   - Click "Preview Recipients" to see who would receive emails
   - Shows:
     - Event name
     - Owner email
     - Current health score
     - Email subject line
     - Missing criteria with point values
   - **No emails are sent** - this is a safe preview

3. **Send Emails**
   - Review the preview carefully
   - Click "Send to X Users"
   - Confirm in dialog
   - Emails are sent via Resend API
   - Results show:
     - Number sent successfully
     - Number failed
     - Any error messages

## Email Personalization

Each email is dynamically generated based on the specific criteria the event is missing:

### Not Published
> **Event is Live (+25 pts)**
> Your festival is in draft mode. Make it live so attendees can find it!
> [Publish Now]

### Low Sessions
> **Add More Sessions (+20 pts)**
> You have 3 sessions. Add 7 more to reach the recommended minimum.
> [Add Sessions]

### Low Views
> **Get More Visibility (+20 pts)**
> Your schedule has 15 views. Share it on social media to reach 100+ views!
> [Share Event]

### No Branding
> **Add Branding (+15 pts)**
> Upload your logo and customize colors to make your event stand out.
> [Upload Logo]

### No Shares
> **Social Sharing (+10 pts)**
> Get your first share! Use the share buttons to spread the word.
> [Get Share Link]

### Inactive
> **Stay Active (+10 pts)**
> Your event hasn't been updated recently. Keep your schedule fresh!
> [Update Event]

## Technical Details

### API Endpoint
`POST /api/admin/health-emails`

**Request Body:**
```json
{
  "mode": "preview" | "send",
  "threshold": 60
}
```

**Response (Preview):**
```json
{
  "mode": "preview",
  "threshold": 60,
  "totalFestivals": 145,
  "lowHealthCount": 38,
  "preview": [
    {
      "festivalId": "...",
      "festivalName": "Summer Yoga Festival",
      "ownerEmail": "user@example.com",
      "healthScore": 45,
      "missingCriteria": [...],
      "emailSubject": "Summer Yoga Festival - A Few Quick Wins ✨",
      "emailPreview": "Your event health score is 45/100..."
    }
  ]
}
```

**Response (Send):**
```json
{
  "mode": "send",
  "threshold": 60,
  "totalFestivals": 145,
  "results": {
    "sent": 37,
    "failed": 1,
    "errors": [
      { "festivalId": "...", "error": "User email not found" }
    ]
  }
}
```

### Email Service
- Uses Resend API
- From: `hello@flowgrid.app`
- HTML emails with responsive design
- Includes direct dashboard links with festival ID

### Data Source
- Calls `getFestivalHealthList()` from `/src/lib/adminAnalytics.ts`
- Real-time calculation of health scores
- Includes all published and draft events
- Filters out deleted events

## Best Practices

### Frequency
- **Don't spam**: Recommended once per month maximum
- **Track sends**: Consider adding a "last_health_email_sent" field to track
- **Time of day**: Send during business hours in user's timezone (future feature)

### Threshold Strategy
- **Initial launch**: Start with threshold 40 (critical users only)
- **Follow-up**: After 2 weeks, send to threshold 60
- **Regular cadence**: Monthly emails to threshold 70
- **Seasonal campaigns**: Before peak booking seasons, threshold 80

### Monitoring
- Check send results for high failure rates
- Monitor email open rates (requires Resend webhook setup)
- Track health score improvements after campaigns
- Watch for unsubscribe requests

## Future Enhancements

### Automation Ideas
1. **Scheduled Cron Job**: Run automatically weekly
2. **Smart Timing**: Send based on user timezone
3. **Drip Campaigns**: Multi-email sequences for very low scores
4. **A/B Testing**: Test different subject lines and messaging
5. **Unsubscribe Management**: Respect opt-outs
6. **Open/Click Tracking**: Measure engagement
7. **Success Stories**: Include testimonials from high-scoring events
8. **Seasonal Suggestions**: Context-aware tips based on time of year

### Database Tracking
Consider adding a `HealthEmailLog` model:

```prisma
model HealthEmailLog {
  id             String   @id @default(cuid())
  festivalId     String
  userId         String
  healthScore    Int
  threshold      Int
  sentAt         DateTime @default(now())
  opened         Boolean  @default(false)
  clicked        Boolean  @default(false)
  
  festival       Festival @relation(fields: [festivalId], references: [id])
  user           User     @relation(fields: [userId], references: [id])
}
```

## Troubleshooting

### No emails sending
- Check `RESEND_API_KEY` in environment variables
- Verify Resend domain is verified
- Check user email addresses are valid

### High failure rate
- Database connection issues
- Invalid email addresses
- Resend API rate limits
- Missing user records

### Email content not personalized
- Check `getFestivalHealthList()` returns breakdown data
- Verify `getMissingCriteria()` function logic
- Test with sample festival data

## Example Usage Scenarios

### Scenario 1: Launch Campaign
**Goal**: Get all draft events published

1. Set threshold to 100 (all events)
2. Preview recipients
3. Filter to only unpublished events (manual review)
4. Send emails with "Let's Get Your Event Live!" messaging

### Scenario 2: Engagement Boost
**Goal**: Re-engage inactive users

1. Set threshold to 50 (moderate + critical)
2. Focus on "Recent Activity" criteria
3. Send before peak booking season
4. Follow up after 1 week

### Scenario 3: Quality Improvement
**Goal**: Raise overall platform quality

1. Set threshold to 80 (include "good" tier)
2. Target branding and session count
3. Offer Pro plan discount incentive
4. Track health score changes over 30 days

## Related Documentation
- `ADMIN_ANALYTICS_GUIDE.md` - Health scoring details
- `USER_GUIDE.md` - User-facing dashboard features
- `/src/lib/adminAnalytics.ts` - Health calculation logic
- `/src/app/dashboard/platform/page.tsx` - Analytics tab with health scores
