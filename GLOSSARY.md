# 📖 Flow Grid Glossary

**Quick reference guide for terms and concepts in Flow Grid**

---

## Platform Concepts

### Flow Grid
The festival scheduling platform itself. Manages festivals, sessions, teachers, and attendees.

### Festival
A multi-day event with scheduled sessions. Examples: yoga retreat, dance festival, conference, workshop series.

### Session
An individual activity within a festival. Has a specific time, location, teacher(s), and details. Examples: "Morning Yoga", "Blues Dance Workshop", "Meditation Class".

### Teacher
An instructor, facilitator, or presenter leading sessions. Can have a bio and profile photo.

### Slug
The URL-friendly identifier for a festival. Example: "summer-yoga-2025" creates URL `domain.com/summer-yoga-2025/schedule`

### Public Schedule
The attendee-facing view of your festival. Shows all sessions with filtering and booking options.

### Admin Dashboard
The organizer panel where you manage festivals, sessions, teachers, bookings, and settings.

---

## Session Properties

### Day
The day of the week when a session occurs. Examples: Friday, Saturday, Sunday.

**Multi-Week Note**: In multi-week festivals, sessions with the same day name get different dates automatically.

### Start Time & End Time
When the session begins and ends. Format: HH:mm (24-hour time). Examples: 09:00, 14:30, 18:00.

### Location
Where the session takes place. Examples: "Main Hall", "Yoga Studio A", "Outside Lawn".

### Level
The difficulty or experience level required. Options:
- **Beginner** - No prior experience needed
- **Intermediate** - Some experience recommended
- **Advanced** - Significant experience required
- **All Levels** - Suitable for everyone

### Styles / Types
Categories or styles for the session. Examples:
- Dance: "Blues", "Contact Improvisation", "Fusion"
- Yoga: "Vinyasa", "Yin", "Ashtanga"
- General: "Workshop", "Class", "Social", "Performance"

Multiple styles can be comma-separated: "Blues,Fusion,Social"

### Card Type
Visual presentation style for the session in the public schedule:
- **Minimal** - Simple card with just title, time, teacher
- **Photo** - Includes teacher profile photo
- **Detailed** - Full description, bio, all details

### Capacity
Maximum number of attendees allowed. Used for booking management and "FULL" badges.

### Prerequisites
Required skills or preparation needed before attending. Example: "Must have completed Level 1" or "Bring your own mat".

### Description
Full text explaining what the session covers, what to expect, what to bring, etc.

### Display Order
Numeric value controlling sort order in admin and public schedule. Lower numbers appear first.

---

## Booking System

### Booking
A reservation made by an attendee for a specific session. Tracks name, email, and timestamp.

### Booking Enabled
Toggle setting on a session that allows attendees to reserve spots.

### Capacity
Maximum attendees allowed. When bookings reach capacity, session shows as "FULL".

### Require Payment
Setting that indicates session requires payment to book. (Note: Currently payment processing not fully implemented.)

### Price
Cost in dollars for a session (if payment required). Example: 25.00

### Booking Count
Number of confirmed bookings for a session. Displayed as badge in admin: "12/25" means 12 of 25 spots filled.

---

## Data Management

### CSV (Comma-Separated Values)
A spreadsheet file format for bulk importing sessions. Can be created in Excel, Google Sheets, or text editor.

### CSV Import
Process of uploading a CSV file to create or update many sessions at once.

### Replace Mode
CSV import option that deletes all existing sessions and replaces with new ones from the file.

### Merge Mode
CSV import option that keeps existing sessions and adds new ones from the file. Useful for adding sessions without losing existing data.

### Google Sheets Integration
Connection between Flow Grid and a Google Spreadsheet. Allows you to manage sessions in Google Sheets with live or manual sync.

### Webhook
Automated connection that sends updates from Google Sheets to Flow Grid in real-time. Requires Google Apps Script setup.

---

## Multi-Week Features

### Multi-Week Festival
A festival spanning multiple weeks where day names repeat. Example: Friday Nov 14 to Friday Nov 21 (8 days).

### Occurrence Counter
Internal system that tracks which occurrence of a day name (1st Friday, 2nd Friday, etc.) to assign correct dates.

### Date-Based Grouping
System that groups sessions by actual calendar date, not just day name. Ensures Nov 14 Friday sessions don't mix with Nov 21 Friday sessions.

### Conditional Date Display
Feature that shows dates in tabs/headers only for multi-week festivals. Single-week festivals show just day names.

### Duplicate Day Detection
Automatic detection when a festival has repeating day names, triggering date display mode.

---

## User Interface

### Tab Navigation
Clickable day filters at top of public schedule. Examples: "All Days", "Friday", "Saturday".

### Filter Bar
Controls for filtering sessions by Style, Level, or Teacher. Includes "Clear Filters" button.

### Session Card
Visual representation of a session in the public schedule. Shows key info like title, time, teacher, level.

### Session Modal
Popup window showing full details when you click a session card. Includes description, teacher bio, booking button.

### Drag-and-Drop
Click-and-hold interface for reordering sessions in admin panel. Grab the grip icon (⋮⋮) and drag.

### Grip Icon
The vertical dots (⋮⋮) icon used to drag and reorder sessions.

---

## Branding & Customization

### Primary Color
Main brand color used for buttons, links, and accent elements throughout the schedule.

### Secondary Color
Supporting brand color for secondary elements and accents.

### Logo Upload
Feature to upload your festival logo (PNG/JPG, up to 20MB) that appears in the schedule header.

### Public/Private Toggle
Setting that controls whether the festival schedule is visible to the public or only to you.

### Social Media Links
Optional Instagram, Facebook, and website URLs that appear in the public schedule footer.

---

## Authentication

### Magic Link
Passwordless authentication method. User enters email, receives link, clicks to sign in. No password needed.

### Passkey
Biometric authentication using Face ID, Touch ID, or Windows Hello. More secure and faster than magic links.

### WebAuthn
Web standard for passkey authentication. Supported by modern browsers on Mac, iPhone, Android, Windows.

### Account
User profile for festival organizers. Stores email, created festivals, and preferences.

---

## Analytics & Tracking

### Views
Number of times the public schedule has been loaded. Tracks page views, not unique visitors.

### Session Clicks
Count of how many times a session card was clicked to view details.

### Unique Visitors
Estimated number of different people who viewed the schedule (approximate, based on session activity).

### Analytics Dashboard
Admin panel showing views, clicks, and engagement metrics for your festival.

### Top Sessions
List of most-clicked sessions, showing which are most popular with attendees.

---

## Technical Terms

### Slug
URL-safe identifier without spaces or special characters. "Summer Yoga 2025" becomes "summer-yoga-2025".

### API
Application Programming Interface. Backend system that handles data between database and user interface.

### Database
Where all your festival data is stored (festivals, sessions, teachers, bookings, users).

### Supabase
The database and file storage system used by Flow Grid.

### PostgreSQL
Type of database system (underlying Supabase).

### Prisma
Database tool that manages your data structure and queries.

### NextAuth
Authentication system handling magic links and passkeys.

### Resend
Email service that sends magic link emails.

### Upstash Redis
Optional cache system for passkey challenges.

---

## File Formats & Data

### ISO Date Format
Standard date format: YYYY-MM-DD. Example: 2025-11-14 (November 14, 2025).

### 24-Hour Time
Time format using 00:00 to 23:59. Examples: 09:00 (9 AM), 14:30 (2:30 PM), 18:00 (6 PM).

### Datetime String
Combined date and time: YYYY-MM-DDTHH:mm:ss. Example: 2025-11-14T09:00:00.

### CSV Header
First row of CSV file containing column names: day, start, end, title, teachers, etc.

### Required Columns
CSV columns that must be present: day, start, end, title, teachers, location, level, types, cardType.

### Optional Columns
CSV columns you can leave blank: description, prerequisites, capacity.

---

## Session States & Statuses

### Active Session
Session that is visible and bookable (if booking enabled).

### Full Session
Session where bookings have reached capacity. Shows red "FULL" badge.

### Booking Disabled
Session visible in schedule but attendees cannot book (booking toggle is OFF).

### Archived Festival
Festival that is no longer active or visible (future feature).

---

## Actions & Operations

### Create
Add a new festival, session, or teacher to the system.

### Edit / Update
Modify existing festival, session, or teacher information.

### Delete
Permanently remove a festival, session, or teacher.

### Import
Bring in data from CSV or Google Sheets.

### Export
Download data as CSV file (future feature).

### Sync
Update data between Google Sheets and Flow Grid.

### Reorder
Change the display sequence of sessions using drag-and-drop.

### Preview
View how something will look before publishing or importing.

### Publish
Make a festival schedule publicly visible.

### Draft
Keep a festival private until ready to publish.

---

## Common Abbreviations

### CSV
Comma-Separated Values (file format)

### API
Application Programming Interface

### URL
Uniform Resource Locator (web address)

### PNG/JPG
Image file formats

### UTC
Coordinated Universal Time (timezone standard)

### CRUD
Create, Read, Update, Delete (basic data operations)

### UI
User Interface (what users see and interact with)

### UX
User Experience (how the product feels to use)

---

## Platform-Specific Terms

### Festival Dashboard
Your main control panel showing all your festivals.

### Session Management
Admin interface for adding, editing, reordering, and deleting sessions.

### Teacher Library
Collection of all teachers associated with your festivals.

### Booking Management
Interface showing who booked which sessions.

### Festival Settings
Configuration page for festival details, dates, branding, visibility.

### Import Modal
Popup window for uploading CSV or connecting Google Sheets.

### Preview Modal
Window showing what CSV data will look like before importing.

### Edit Modal
Popup for modifying session or teacher details.

---

## Best Practices Terms

### Consistent Naming
Using the same format for similar items. Example: "Morning Yoga" not "yoga morning" or "Yoga (AM)".

### Chronological Order
Arranging items by date/time from earliest to latest.

### Backup
Keeping a copy of your data (CSV file) in case you need to restore.

### Test Import
Importing a small number of sessions first to verify format before bulk import.

### Capacity Buffer
Setting capacity slightly higher than expected to account for no-shows. Example: expect 50, set capacity to 55.

---

## Error Messages & Issues

### "Invalid CSV format"
CSV file doesn't have required columns or has formatting errors.

### "Session not found"
Trying to edit or view a session that was deleted or doesn't exist.

### "Unauthorized"
Not logged in or don't have permission to access something.

### "Booking full"
Session has reached maximum capacity and cannot accept more bookings.

### "Invalid date range"
Festival end date is before start date, or session date is outside festival dates.

### "Duplicate slug"
Trying to create festival with slug that already exists. Must use unique slug.

---

## Feature Flags

### Booking Enabled
Master toggle for entire booking system on a session.

### Public Festival
Toggle making festival visible to anyone with the link.

### Payment Required
Toggle requiring payment for a session booking.

### Date Display
Automatic feature that shows dates for multi-week festivals.

---

## Future/Planned Terms

### Waiting List
Feature to add people to queue when session is full (not yet implemented).

### Payment Processing
Actual Stripe integration for charging payments (structure exists, processing not live).

### User Roles
Different permission levels (organizer, admin, viewer - structure exists, not enforced).

### Multi-Language
Support for festivals in different languages (planned).

### Email Templates
Customizable booking confirmation emails (planned).

### Export Feature
Download session data as CSV (planned).

---

## Quick Reference

### Time Formats
- **CSV**: 09:00, 14:30 (HH:mm, 24-hour)
- **Display**: 9:00 AM, 2:30 PM (formatted for users)
- **Internal**: 2025-11-14T09:00:00 (ISO datetime)

### Date Formats
- **CSV**: 2025-11-14 (YYYY-MM-DD)
- **Display**: Friday, Nov 14 (formatted for users)
- **Short Display**: 14 Nov (compact tabs)

### File Size Limits
- **Images**: 20MB maximum
- **CSV**: No hard limit (tested up to 10MB)

### Capacity Indicators
- **12/25** - 12 booked out of 25 capacity
- **FULL** - At capacity, no more bookings
- **—** - Booking not enabled

---

**Last Updated**: November 2025  
**Version**: 2.0  
**Platform**: Flow Grid Festival Scheduler

---

**Need a term explained?** Email support@tryflowgrid.com
