# 📚 Flow Grid User Guide

**Complete guide for festival organizers using Flow Grid**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Festival Management](#festival-management)
3. [Session Management](#session-management)
4. [Teacher Management](#teacher-management)
5. [Booking System](#booking-system)
6. [Google Sheets Integration](#google-sheets-integration)
7. [Public Schedule](#public-schedule)
8. [Analytics](#analytics)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Creating Your Account

1. Go to the sign-in page
2. Enter your email address
3. Click "Send Magic Link"
4. Check your email and click the link to sign in
5. You're in! No password required.

### Your First Festival

1. Click **"Create New Festival"** from your dashboard
2. Fill in basic information:
   - **Festival Name** (e.g., "Summer Yoga Retreat 2025")
   - **URL Slug** (e.g., "summer-yoga-2025") - this creates your public URL
   - **Start Date** and **End Date**
   - **Description** (optional)
3. Click **"Create Festival"**

---

## Festival Management

### Editing Festival Details

1. Go to **Dashboard** → **Your Festivals**
2. Click on the festival you want to edit
3. Click the **"Edit Festival"** button
4. Update any details and click **"Save Changes"**

### Customizing Branding

Make your festival schedule match your brand:

1. **Logo Upload**:
   - Click **"Branding"** tab
   - Upload your logo (PNG or JPG, up to 20MB)
   - Logo appears in the header of your public schedule

2. **Colors**:
   - **Primary Color** - Main brand color (buttons, links)
   - **Secondary Color** - Accent elements
   - Preview changes in real-time

3. **Social Media Links**:
   - Add Instagram, Facebook, website links
   - Links appear in your public schedule footer

### Making Schedule Public/Private

- **Private** (default): Only you can see the schedule
- **Public**: Anyone with the link can view it
- Toggle in festival settings

### Your Public Schedule URL

Your schedule is available at:
```
https://your-domain.com/your-slug/schedule
```

Share this link with your attendees!

---

## Session Management

### Adding Sessions Manually

1. Go to **Sessions** tab
2. Click **"Add New Session"**
3. Fill in session details:
   - **Title** (required)
   - **Day** - Which day of the festival
   - **Start Time** & **End Time**
   - **Location**
   - **Teacher(s)** - Select from existing teachers
   - **Level** - Beginner, Intermediate, Advanced, All Levels
   - **Styles** - Dance styles, yoga types, etc. (comma-separated)
   - **Capacity** - Maximum attendees (optional)
   - **Description**
   - **Prerequisites** (optional)
   - **Card Type**:
     - **Minimal** - Simple card with basic info
     - **Photo** - Includes teacher photo
     - **Detailed** - Full description and details
4. Click **"Create Session"**

### Bulk Upload via CSV

Perfect for importing many sessions at once:

1. **Prepare Your CSV File**:
   ```csv
   day,start,end,title,teachers,location,level,capacity,prerequisites,types,cardType,description
   Friday,09:00,10:30,Morning Yoga,Sarah Johnson,Main Hall,Beginner,30,,Workshop,detailed,Start your day
   Friday,11:00,12:30,Dance Flow,Mike Chen,Studio A,Intermediate,25,,Class,photo,Dynamic movement
   ```

2. **Required Columns**:
   - `day` - Day name (Friday, Saturday, etc.)
   - `start` - Start time (HH:mm format)
   - `end` - End time (HH:mm format)
   - `title` - Session name
   - `teachers` - Teacher name(s), comma-separated
   - `location` - Where the session happens
   - `level` - Beginner | Intermediate | Advanced | All Levels
   - `types` - Session types (Workshop, Class, Social, etc.)
   - `cardType` - minimal | photo | detailed

3. **Upload Process**:
   - Click **"Upload CSV"**
   - Choose your file
   - **Preview** your sessions
   - Choose **"Replace All"** or **"Merge"**:
     - **Replace** - Deletes existing sessions, adds new ones
     - **Merge** - Keeps existing sessions, adds new ones
   - Click **"Confirm Import"**

### Multi-Week Festivals

For festivals spanning multiple weeks where day names repeat (e.g., Friday week 1 and Friday week 2):

- Flow Grid **automatically assigns correct dates**
- Sessions are grouped by **actual date**, not just day name
- Public schedule shows dates when needed: **"Fri, 14 Nov"**
- Admin view sorts chronologically

**Example**: 
- Festival: Nov 14-21 (Friday to Friday)
- Your CSV lists sessions by day name
- System assigns:
  - First Friday sessions → Nov 14
  - Second Friday sessions → Nov 21

### Reordering Sessions

Drag and drop sessions to change their order:

1. Click and hold the **grip icon** (⋮⋮) on the left
2. Drag the session up or down
3. Drop it in the new position
4. Changes save automatically

Order affects:
- Display order in admin list
- Public schedule (when sorted by custom order)

### Editing Sessions

1. Click the **Edit** button (✏️) next to any session
2. Modify details in the modal
3. Click **"Save Changes"**

### Deleting Sessions

1. Click the **Delete** button (🗑️) next to the session
2. Confirm deletion
3. Session is removed permanently

---

## Teacher Management

### Adding Teachers

1. Go to **Teachers** tab
2. Click **"Add New Teacher"**
3. Enter:
   - **Name** (required)
   - **Bio** (optional) - About the teacher
4. Click **"Create Teacher"**

### Uploading Teacher Photos

1. Find the teacher in the list
2. Click **"Upload Photo"**
3. Choose image (PNG, JPG, up to 20MB)
4. Photo appears in:
   - Teacher profiles
   - Session cards (if card type is "photo" or "detailed")
   - Public schedule modals

### Editing Teacher Info

1. Click **Edit** next to teacher name
2. Update name or bio
3. Click **"Save"**

### Deleting Teachers

⚠️ **Warning**: You can only delete teachers who aren't assigned to any sessions.

1. Remove teacher from all sessions first
2. Click **Delete** button
3. Confirm deletion

---

## Booking System

### Enabling Bookings for a Session

1. Edit the session
2. Toggle **"Enable Bookings"** to ON
3. Set:
   - **Capacity** - Maximum attendees
   - **Require Payment** - ON/OFF
   - **Price** - If payment required (e.g., 25.00)
4. Save changes

### Viewing Bookings

1. Go to **Sessions** tab
2. Look for the booking counter:
   - **Green badge** - Has bookings
   - **Red "FULL" badge** - At capacity
   - **Gray dash** - No bookings enabled
3. Click the booking badge to view details:
   - Who booked (name, email)
   - Booking timestamp
   - Payment status

### Managing Bookings

Currently, bookings can be viewed but not manually edited from the admin panel. Users book through the public schedule.

**Future Enhancement**: Admin booking management (cancel, add, modify) coming soon.

---

## Google Sheets Integration

### Why Use Google Sheets?

- **Live Sync**: Update your schedule in Google Sheets, changes appear instantly
- **Collaboration**: Multiple team members can edit
- **Familiar Interface**: Use spreadsheets instead of admin panel
- **Backup**: Your data lives in both Flow Grid and Google Sheets

### Setting Up Google Sheets

1. **Create Your Google Sheet**:
   - Open Google Sheets
   - Create columns matching CSV format (see [Bulk Upload](#bulk-upload-via-csv))
   - Fill in your sessions

2. **Share Your Sheet**:
   - Click **Share** in Google Sheets
   - Set to **"Anyone with the link can view"**
   - Copy the sheet URL

3. **Connect to Flow Grid**:
   - Go to **Sessions** tab
   - Click **"Import from Google Sheets"**
   - Paste your sheet URL
   - Click **"Validate"**

4. **Import Your Data**:
   - Preview shows what will be imported
   - Choose **"Replace All"** or **"Merge"**
   - Click **"Import"**

### Keeping Google Sheets in Sync

**Option 1: Manual Sync**
- Edit your Google Sheet
- Go to Flow Grid → **Import from Google Sheets**
- Import again (replaces old data)

**Option 2: Webhook (Advanced)**
- Set up Google Apps Script webhook
- Changes sync automatically
- See `GOOGLE_SHEETS_SETUP.md` for details

---

## Public Schedule

### What Your Attendees See

Your public schedule includes:

1. **Header**:
   - Festival logo
   - Festival name and dates
   - Social media links

2. **Day Tabs**:
   - Click to filter by day
   - **"All Days"** shows everything
   - Multi-week festivals show dates: **"Fri, 14 Nov"**

3. **Filters**:
   - **Style** - Filter by dance style, yoga type, etc.
   - **Level** - Beginner, Intermediate, Advanced
   - **Teacher** - See sessions by specific teacher
   - **Clear Filters** button to reset

4. **Session Cards**:
   - Three visual styles (minimal, photo, detailed)
   - Click any session to see full details

5. **Session Details Modal**:
   - Full description
   - Teacher bio and photo
   - Time, location, level, capacity
   - Prerequisites
   - Styles/types
   - **Book Now** button (if booking enabled)

### Mobile Experience

The schedule is fully responsive:
- Filters collapse on mobile (tap to expand)
- Horizontal scrolling for many days
- Touch-friendly session cards
- Easy booking on phone

### Sharing Your Schedule

Share your public URL:
```
https://your-domain.com/your-slug/schedule
```

Tips:
- Add to festival website
- Share on social media
- Include in confirmation emails
- Print QR codes for event signage

---

## Analytics

### Festival Analytics

View insights about your festival:

1. Go to festival → **Analytics** tab
2. See:
   - **Total Views** - How many people viewed your schedule
   - **Session Clicks** - Which sessions are most popular
   - **Unique Visitors** - Approximate unique viewers
   - **Views Over Time** - Daily traffic chart

### Session Performance

See which sessions are most popular:
- **Top Sessions** list shows click counts
- Helps you plan future events
- Identifies popular teachers/styles

### Booking Analytics

If booking is enabled:
- See booking counts per session
- Track capacity utilization
- Identify fully booked sessions

---

## Troubleshooting

### Sessions Not Showing in Correct Order

**Solution**: 
1. Check date range of festival
2. Verify session dates are within festival dates
3. Use drag-and-drop to manually reorder
4. Check that `displayOrder` is set correctly

### Multi-Week Festival Days Grouping Wrong

**Issue**: Both Friday sessions showing under same group

**Solution**: 
- Update to latest version (includes date-based grouping fix)
- Re-import CSV or Google Sheets
- System will assign correct dates automatically

### CSV Import Failing

**Common Issues**:
1. **Wrong date format**: Use YYYY-MM-DD for dates
2. **Wrong time format**: Use HH:mm (24-hour), e.g., 09:00, 14:30
3. **Missing required columns**: Ensure all required columns present
4. **Special characters**: Avoid special characters in teacher names
5. **Comma in fields**: If field contains comma, wrap in quotes: "John Doe, Jane Smith"

**Fix**:
- Download sample CSV from platform
- Check column headers match exactly
- Validate data in Excel/Sheets before uploading

### Google Sheets Import Not Working

1. **Check Sheet Permissions**: Must be "Anyone with link can view"
2. **Validate URL**: Use the "share" URL, not the browser URL
3. **Check Sheet Format**: Ensure columns match CSV format
4. **Try Manual Import**: Use "Import Now" instead of automatic sync

### Photos Not Displaying

1. **Check file size**: Max 20MB
2. **Check file type**: Must be PNG, JPG, or JPEG
3. **Check permissions**: Ensure you're logged in
4. **Clear cache**: Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

### Bookings Not Working

1. **Check session settings**: Booking enabled? Capacity set?
2. **Check user email**: Must be signed in to book
3. **Check capacity**: Session might be full
4. **Check payment settings**: If payment required, user may need payment info

### Public Schedule Not Updating

1. **Check festival visibility**: Must be set to "Public"
2. **Check session status**: Sessions must be active
3. **Clear browser cache**: Hard refresh
4. **Wait a moment**: Changes can take 10-30 seconds to propagate

---

## Tips & Best Practices

### Organizing Your Schedule

1. **Use consistent naming**: "Morning Yoga" not "yoga morning" or "Yoga (Morning)"
2. **Include levels**: Helps attendees find appropriate sessions
3. **Add detailed descriptions**: More info = better engagement
4. **Upload teacher photos**: Makes schedule more personal
5. **Set realistic capacities**: Better to have extra space than turn people away

### CSV Best Practices

1. **Test with small batch first**: Import 5-10 sessions to test
2. **Keep a backup**: Save CSV file as backup
3. **Use templates**: Download sample CSV and modify
4. **Check for duplicates**: Before importing in "Merge" mode

### Multi-Week Festivals

1. **Order CSV chronologically**: List sessions in date order
2. **Use clear titles**: "Week 1 Opening" vs "Week 2 Opening"
3. **Check date display**: Preview public schedule before sharing
4. **Test booking**: Book a test session to verify flow

### Booking System

1. **Set realistic capacities**: Account for no-shows (add 10%)
2. **Enable booking early**: Give attendees time to plan
3. **Monitor capacity**: Check booking counts regularly
4. **Communicate**: Email updates when sessions fill up

---

## Getting Help

### Documentation

- **USER_GUIDE.md** (this file) - Complete user guide
- **GLOSSARY.md** - Terms and definitions
- **SETUP_GOOGLE_SYNC.md** - Google Sheets setup
- **ADMIN_GUIDE.md** - Advanced admin features

### Support

- **Email**: support@tryflowgrid.com
- **GitHub Issues**: Report bugs or request features

### Common Questions

**Q: Can I have multiple festivals?**
A: Yes! Create as many as you need from your dashboard.

**Q: Can I export my data?**
A: Yes, sessions can be exported to CSV from the admin panel.

**Q: Is there a limit on sessions?**
A: No hard limit. Platform handles 1000+ sessions easily.

**Q: Can attendees create accounts?**
A: Yes, they sign in with magic links to book sessions.

**Q: Do I need technical knowledge?**
A: No! Designed for non-technical festival organizers.

---

**Last Updated**: November 2025  
**Version**: 2.0  
**Platform**: Flow Grid Festival Scheduler
