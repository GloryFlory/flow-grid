# Retreat Ops V1 Draft (MAC-first)

## Goal
Build a practical V1 that keeps schedule management central and adds operations data from a single WeTravel workbook (multiple tabs/sheets).

V1 is MAC-first but designed so other organizers can reuse it without hardcoded column names.

## Companion Artifacts
- Implementation and API contract: docs/RETREAT_OPS_IMPLEMENTATION_V1.md
- Shared types contract: src/types/retreat-ops.ts

## V1 Scope

### Included in V1
- Multi-sheet WeTravel import (Bookings + Participants tabs in one file)
- Guest lifecycle tracking
- Room tracking basics
- Checklist tracking for pre-event and live event tasks
- Teacher payout tracking (lightweight)
- Sponsor tracking (lightweight)
- Marketing attribution snapshot (manual + imported where available)

### Out of Scope for V1
- Built-in ticket checkout (WeTravel remains source of truth)
- Automated social API ingestion
- Complex accounting
- Advanced room allocation algorithms

## Product Surface
- Keep /dashboard as the primary workspace.
- Place Retreat Ops modules inside each event at /dashboard/festivals/[id].
- Use the event Manage page as the operations hub for schedule, guests, rooms, and related modules.

## Workbook Import (Single File, Multiple Sheets)

### Expected Sheets (V1)
- Booking summary sheet
- Participant report sheet

V1 importer should allow selecting sheet names at upload time, because names may vary.

### Import Flow
1. Upload workbook (.xlsx).
2. Pick which sheet maps to Bookings and which maps to Participants.
3. Auto-suggest column mapping.
4. Show preview: total rows, parse errors, matched guests, unmatched rows.
5. Commit import.

### Matching Logic (Guest-centric)
Primary match key:
- participant email (normalized lower-case, trimmed)

Fallback match key:
- buyer email + participant first name + participant last name

Second fallback:
- buyer email + participant full name fuzzy match (strict threshold, manual review queue)

Deduplication rule:
- same eventId + same normalized participant email -> update existing guest
- if no participant email, use composite key hash and mark low-confidence

## Canonical Data Model (V1)

### Booking (group-level)
Core fields from booking sheet:
- buyerFirstName
- buyerLastName
- buyerEmail
- numberOfParticipants
- currency
- tripPrice
- successfulPayments
- refunds
- pendingPayments
- failedPayments
- externalPayments
- externalRefunds
- balanceDue
- pastDue
- dueNow
- dueLaterInstallments
- discountCodes
- bookingNote
- bookingDateUtc
- tripStartDate
- tripEndDate

Add-ons as flexible JSON:
- bookingAddOns (example keys: superEarlyBird, earlyBird, privateRoom, doubleRoom, macTee)

### Guest (participant-level)
Core fields from participant sheet:
- participantFirstName
- participantLastName
- participantEmail
- phoneNumber
- departureDate
- package
- privateRoomRequested
- doubleRoomRequested
- macTeeSelected
- tShirtSize
- dietaryRequirements
- emergencyContact
- checkoutInfo

Operational status fields (managed in Flow Grid):
- paymentStatus (UNPAID | PARTIAL | PAID)
- waiverSigned (boolean)
- shirtPrepared (boolean)
- shirtCollected (boolean)
- checkInStatus (NOT_CHECKED_IN | CHECKED_IN)
- notes

Flexible custom fields:
- customAnswers JSON
- customConsent JSON

Store long-form question labels separately for display:
- customFieldDefinitions per event: key, label, dataType

## Module Drafts (V1)

### 1) Guest Lifecycle (Primary V1 module)
Views:
- Guest table (filter: payment, waiver, room type, shirt status)
- Guest detail panel (answers, consents, notes)
- Import history panel

Actions:
- Mark waiver signed
- Mark shirt prepared/collected
- Mark check-in
- Add internal notes

### 2) Room Management (Basic)
Data used:
- privateRoomRequested, doubleRoomRequested, room-share answer

Views:
- Rooming queue (unassigned)
- Assigned list

Actions:
- Assign room code manually
- Mark roommate pairing

### 3) Teachers and Payouts (Light)
V1 fields:
- teacherName
- totalSessions
- agreedFee
- amountPaid
- amountOutstanding
- payoutStatus
- payoutNotes

Use manual entry in V1; optionally link teacher to sessions by name.

### 4) Checklists
Types:
- Pre-event
- During event

Checklist item fields:
- title
- module (Guest Ops, Schedule, Rooms, Sponsors, Marketing)
- owner
- dueAt
- doneAt
- status

### 5) Marketing Attribution (Snapshot)
V1 fields:
- channel
- campaign
- spend
- impressions
- clicks
- leads
- purchases
- notes

V1 supports manual entry + simple CSV import.

### 6) Sponsors (Light)
V1 fields:
- sponsorName
- tier
- amount
- status (LEAD | CONFIRMED | INVOICED | PAID)
- deliverables JSON
- contactName
- contactEmail
- notes

## Mapping Strategy (Do Not Hardcode Organizer Questions)
- Keep a required core field list for bookings and guests.
- Everything else maps to dynamic fields.
- Save per-event mapping profile so re-import is one-click.

Suggested mapping metadata:
- sourceSheet
- sourceColumn
- targetField
- transform (boolean parser, currency parser, date parser)
- required (boolean)

## Validation Rules (V1)
- Emails normalized and validated.
- Currency values parsed safely (comma/dot tolerant).
- Dates parsed to ISO with validation errors surfaced in preview.
- Unknown columns never discarded: stored in customAnswers/customConsent.

## Permissions
- V1 modules are admin-only for now.
- Non-admin users keep existing schedule/event permissions.

## Suggested Delivery Plan
1. Data layer + import preview (Bookings + Participants tabs)
2. Guest lifecycle UI with operational statuses
3. Room basics + checklist module
4. Teacher payout + sponsor light modules
5. Marketing snapshot module

## Acceptance Criteria (V1)
- Can upload one workbook with two tabs and complete import with preview.
- At least 95% of participant rows auto-match or create correctly.
- Guest lifecycle statuses are editable and persisted.
- Unknown custom fields are retained and visible per guest.
- /dashboard remains the top-level workspace; /dashboard/schedule remains schedule entry.
