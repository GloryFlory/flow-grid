# Retreat Ops V1 - Schema and API Contract

## Purpose
This document turns the V1 product draft into implementation-ready backend contracts.

It follows existing platform conventions:
- Next.js app routes under src/app/api
- Server-side role checks via getServerSession(authOptions)
- Prisma as source of truth
- Tailwind + existing Card/Button components for UI consistency on dashboard pages

## Platform Style Alignment
- Keep dashboard IA intact: /dashboard remains primary, /dashboard/schedule remains schedule entry.
- Retreat Ops modules are event-scoped and should be accessed from /dashboard/festivals/[id].
- New ops modules should use the same visual language already used in dashboard cards:
  - Card + CardHeader + CardContent
  - Existing gray/blue semantic palette
  - Same spacing rhythm (mb-6/mb-8, gap-3/gap-6)
- Admin-only modules must follow existing role check pattern used in admin APIs.

## Prisma Model Proposal (V1)

### New enums
- GuestPaymentStatus: UNPAID, PARTIAL, PAID
- GuestCheckInStatus: NOT_CHECKED_IN, CHECKED_IN
- ImportJobStatus: PREVIEWED, COMMITTED, FAILED

### New models

1. RetreatImportJob
- id String @id @default(cuid())
- eventId String
- createdById String
- source String (default: WETRAVEL)
- workbookFilename String?
- bookingsSheetName String
- participantsSheetName String
- status ImportJobStatus @default(PREVIEWED)
- stats Json
- issues Json
- mappings Json
- previewSnapshot Json
- createdAt DateTime @default(now())
- committedAt DateTime?

Indexes:
- @@index([eventId, createdAt])
- @@index([createdById, createdAt])

2. RetreatBooking
- id String @id @default(cuid())
- eventId String
- externalSource String (WETRAVEL)
- externalBookingKey String?
- buyerFirstName String?
- buyerLastName String?
- buyerEmail String?
- numberOfParticipants Int?
- currency String?
- tripPrice Decimal?
- successfulPayments Decimal?
- refunds Decimal?
- pendingPayments Decimal?
- failedPayments Decimal?
- externalPayments Decimal?
- externalRefunds Decimal?
- balanceDue Decimal?
- pastDue Decimal?
- dueNow Decimal?
- dueLaterInstallments Decimal?
- discountCodes String?
- bookingNote String?
- bookingDateUtc DateTime?
- tripStartDate DateTime?
- tripEndDate DateTime?
- bookingAddOns Json?
- rawPayload Json?
- createdAt DateTime @default(now())
- updatedAt DateTime @updatedAt

Indexes:
- @@index([eventId, buyerEmail])
- @@index([eventId, bookingDateUtc])
- @@unique([eventId, externalSource, externalBookingKey])

3. RetreatGuest
- id String @id @default(cuid())
- eventId String
- bookingId String?
- firstName String
- lastName String
- email String?
- normalizedEmail String?
- phoneNumber String?
- departureDate DateTime?
- packageName String?
- privateRoomRequested Boolean @default(false)
- doubleRoomRequested Boolean @default(false)
- roomCode String?
- roomMateNote String?
- macTeeSelected Boolean @default(false)
- tShirtSize String?
- dietaryRequirements String?
- emergencyContact String?
- checkoutInfo String?
- paymentStatus GuestPaymentStatus @default(UNPAID)
- waiverSigned Boolean @default(false)
- shirtPrepared Boolean @default(false)
- shirtCollected Boolean @default(false)
- checkInStatus GuestCheckInStatus @default(NOT_CHECKED_IN)
- customAnswers Json?
- customConsent Json?
- notes String?
- createdAt DateTime @default(now())
- updatedAt DateTime @updatedAt

Indexes:
- @@index([eventId, normalizedEmail])
- @@index([eventId, paymentStatus])
- @@index([eventId, checkInStatus])
- @@index([eventId, roomCode])

4. RetreatCustomFieldDefinition
- id String @id @default(cuid())
- eventId String
- fieldKey String
- label String
- dataType String
- section String (ANSWER | CONSENT)
- createdAt DateTime @default(now())
- updatedAt DateTime @updatedAt

Indexes:
- @@unique([eventId, fieldKey, section])

### Relation targets
All new eventId references should point to Festival.id to stay compatible with current architecture.

## API Contract Proposal (V1)

### 1) POST /api/retreat-ops/import/preview
Admin-only.

Request:
- eventId
- sheetSelection: bookingsSheetName, participantsSheetName
- mappings[]
- workbookBase64

Response:
- importJobId
- stats: bookingRows, participantRows, matchedGuests, newGuests, lowConfidenceMatches, issues
- issues[]
- rows[] preview sample

Behavior:
- Parses workbook and selected sheets.
- Applies mapping transforms.
- Matches guests by normalized email, then fallback keys.
- Stores preview snapshot in RetreatImportJob.
- Does not mutate RetreatGuest or RetreatBooking.

### 2) POST /api/retreat-ops/import/commit
Admin-only.

Request:
- eventId
- importJobId
- applyRoomSignals
- overwriteExistingFields

Response:
- importedBookings
- importedGuests
- updatedGuests
- skippedRows

Behavior:
- Uses preview snapshot from import job.
- Upserts booking and guest records.
- Marks import job as COMMITTED.

### 3) GET /api/retreat-ops/guests
Admin-only.

Query:
- eventId
- paymentStatus?
- waiverSigned?
- shirtPrepared?
- shirtCollected?
- checkInStatus?
- roomType?
- search?
- page?
- pageSize?

Response:
- rows[]
- pagination: page, pageSize, total

### 4) PATCH /api/retreat-ops/guests/[id]
Admin-only.

Supported updates:
- paymentStatus
- waiverSigned
- shirtPrepared
- shirtCollected
- checkInStatus
- roomCode
- notes

### 5) GET /api/retreat-ops/import/jobs
Admin-only.

Query:
- eventId

Response:
- recent import jobs with status and stats

## Workbook Mapping Rules
- Required targets are minimal: firstName, lastName, and at least one of email or buyerEmail.
- Unknown participant columns are persisted into customAnswers or customConsent.
- Organizer can save per-event mappings for reuse.

## Matching and Deduping Rules
Primary:
- eventId + normalized participant email

Fallback 1:
- eventId + buyerEmail + participant firstName + participant lastName

Fallback 2:
- eventId + buyerEmail + fuzzy full-name match (strict)

Conflict handling:
- Low-confidence matches are flagged in preview and require commit with overwriteExistingFields=false by default.

## Security and Permissions
- All endpoints are admin-only in V1.
- Validate user owns event or has event-level admin access.
- Never trust workbook column labels; only apply selected mappings.

## Delivery Sequence
1. Prisma schema + migration for RetreatImportJob, RetreatBooking, RetreatGuest, RetreatCustomFieldDefinition
2. Shared types in src/types/retreat-ops.ts
3. Import preview endpoint
4. Import commit endpoint
5. Guests list and guest patch endpoints
6. Dashboard module pages using existing card and table styles

## Test Plan (Minimum)
- Unit tests for transform parsers (currency/date/boolean/email)
- Matching tests for primary and fallback paths
- API auth tests for admin-only guard
- Import idempotency test (same file imported twice)
- Guest status update tests
