# Feature Priorities & Decisions

## Immediate Questions to Resolve

### 1. Payment Verification Location
**Current State**: `/admin/payments` (separate page)

**Options**:
- **A) Keep Separate** (RECOMMENDED)
  - Quick access via header button
  - Clean, focused interface
  - Different workflow than inquiries
  - Already built and working
  
- **B) Merge into "Inquiries" tab**
  - Rename to "Payments & Inquiries"
  - Could be confusing
  - Mixing two different workflows

**Decision**: Keep separate. Use "Inquiries" tab for contact form submissions and enterprise requests only.

---

### 2. Revolut Testing on Local
**Issue**: You mentioned you can't test it locally

**Checklist**:
- ✅ Environment variables are set (checked .env.local - they're there)
- ✅ Dev server running on port 3000
- ✅ RevolutPaymentModal component exists
- ✅ Pricing page imports it

**To Test**:
1. Go to http://localhost:3000/pricing
2. Click "Get Started" on Pro plan
3. Should see Revolut payment modal
4. Click "Pay with Revolut" - opens payment link
5. Complete payment (you can test with small amount)
6. Click "I've completed payment"
7. Check `/admin/payments` to see pending verification

**If it's not working**: What specifically isn't working? Modal not showing? Button not working? Let me know and I'll debug.

---

## New Feature Requests

### 3. Customize Level Colors
**User Request**: "Option to customize the level colours"

**Context**: Currently session levels have fixed colors (Beginner green, Intermediate blue, Advanced purple, etc.)

**Implementation Options**:

**Option A - Simple Per-Festival Override**:
- Add color picker in `/dashboard/festivals/[id]/branding`
- Store in Festival model: `levelColors: { BEGINNER: '#hex', INTERMEDIATE: '#hex', ... }`
- Override default colors when rendering sessions
- **Pros**: Simple, user-friendly
- **Cons**: Fixed to 4 level names

**Option B - Custom Level System**:
- Let users define their own level names AND colors
- Example: "Gentle", "Moderate", "Vigorous" for yoga
- Store as array: `levels: [{ name: 'Gentle', color: '#...' }, ...]`
- **Pros**: Maximum flexibility
- **Cons**: More complex, migration needed for existing sessions

**Recommendation**: Start with **Option A** - simpler, solves immediate need. Can expand to B later if needed.

**Priority**: MEDIUM (nice-to-have, not blocking)

---

### 4. Offline MySchedule
**User Request**: "Make 'MySchedule' available offline for events that are on a remote location"

**Context**: Users want to save their personal schedule for offline access at festival venues with poor connectivity.

**Implementation Options**:

**Option A - PWA with Service Worker**:
- Make entire site a Progressive Web App
- Cache MySchedule data when online
- Serve from cache when offline
- **Pros**: True offline functionality, can work while traveling
- **Cons**: Complex setup, requires service worker, storage limits

**Option B - Download PDF/Image**:
- Add "Download for Offline" button on MySchedule page
- Generate PDF with QR codes + session details
- Users can save to phone/print
- **Pros**: Simple, works everywhere, no connectivity needed
- **Cons**: Static snapshot, can't update if schedule changes

**Option C - "Save to Phone" HTML**:
- Generate self-contained HTML file with inline CSS
- User downloads and opens in browser later
- Works offline once downloaded
- **Pros**: Interactive, relatively simple
- **Cons**: Slightly technical for non-tech users

**Recommendation**: **Option B** (PDF Download) as MVP, with note that it's a static snapshot. Can add "last updated" timestamp. Later expand to Option A (PWA) if there's demand.

**Priority**: HIGH (users explicitly asked for this, affects user experience at events)

---

## Implementation Order

### Phase 1: Quick Wins (This Week)
1. ✅ Events tab (DONE)
2. ✅ Health score emails (DONE)
3. 🔄 Test Revolut payment flow (verify it works)
4. 📄 MySchedule offline PDF download (HIGH priority, 2-3 hours)

### Phase 2: Branding Enhancements (Next Week)
1. Custom level colors (Option A - simple override)
2. More branding options if needed

### Phase 3: Platform Improvements (Future)
1. Complete "Users" tab in platform dashboard
2. "Inquiries" tab for contact forms
3. PWA/offline support (full implementation)

---

## Technical Notes

### Custom Level Colors Implementation
```prisma
// Add to Festival model
model Festival {
  // ... existing fields
  customLevelColors Json? // { "BEGINNER": "#10b981", "INTERMEDIATE": "#3b82f6", ... }
}
```

```typescript
// Use in session rendering
const levelColor = festival.customLevelColors?.[session.level] || DEFAULT_COLORS[session.level]
```

### Offline MySchedule PDF
- Use `jspdf` (already installed for QR posters)
- Generate from MySchedule page
- Include:
  - Event name/dates
  - User's saved sessions grouped by day/time
  - QR codes for each session (optional)
  - "Generated on [date]" timestamp
  - "Check online for updates" notice

---

## Questions for You

1. **Revolut Testing**: What specifically isn't working? Can you see the pricing page and the "Get Started" button?

2. **Payment Verification**: Should I keep it as `/admin/payments` or move to platform dashboard "Inquiries" tab?

3. **Level Colors**: Do you want custom colors per festival, or should users be able to rename levels too (Beginner → Gentle)?

4. **Offline MySchedule**: PDF download good enough for now, or do you need full PWA offline support immediately?

5. **Priority**: Which one should I build first? My vote is **Offline MySchedule PDF** since users explicitly requested it.

---

## Decision Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-01-15 | Remove "Soon" from Events tab | Tab is now functional with filtering |
| 2026-01-15 | Keep payments separate from inquiries | Different workflows, already built |
| 2026-01-15 | Recommend PDF download for offline | Simpler MVP, can expand to PWA later |
| 2026-01-15 | Recommend simple color override first | Solves immediate need, can expand later |
