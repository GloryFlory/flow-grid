export type PageType = 'WEBINAR' | 'EARLY_BIRD' | 'WAITLIST' | 'VOLUNTEER' | 'SCHOLARSHIP' | 'DISCOVERY_CALL' | 'RETREAT_INTEREST'

export interface PageTypeConfig {
  label: string
  description: string
  defaultCta: string
  defaultTemplate: string
  showDate: boolean
  showDuration: boolean
  showJoinLink: boolean
  joinLinkLabel: string
  joinLinkPlaceholder: string
  joinButtonText: string
  dateLabel: string
  emailSubjectPrefix: string
}

export const PAGE_TYPE_CONFIG: Record<PageType, PageTypeConfig> = {
  WEBINAR: {
    label: 'Webinar',
    description: 'Live online session with a join link and countdown',
    defaultCta: 'Sign me up',
    defaultTemplate: 'minimal',
    showDate: true,
    showDuration: true,
    showJoinLink: true,
    joinLinkLabel: 'Webinar Join Link',
    joinLinkPlaceholder: 'https://zoom.us/j/...',
    joinButtonText: 'Join Webinar',
    dateLabel: 'Date & Time',
    emailSubjectPrefix: "You're signed up:",
  },
  EARLY_BIRD: {
    label: 'Early Bird / Countdown',
    description: 'Countdown to a ticket sale, event launch, or deadline',
    defaultCta: 'Get early access',
    defaultTemplate: 'countdown',
    showDate: true,
    showDuration: false,
    showJoinLink: true,
    joinLinkLabel: 'Ticket / Booking Link',
    joinLinkPlaceholder: 'https://tickets.example.com/...',
    joinButtonText: 'Get Tickets',
    dateLabel: 'Deadline / Launch Date',
    emailSubjectPrefix: "You're on the early bird list:",
  },
  WAITLIST: {
    label: 'Waitlist',
    description: 'Collect interest with no specific date — great for retreats or courses',
    defaultCta: 'Join the waitlist',
    defaultTemplate: 'minimal',
    showDate: false,
    showDuration: false,
    showJoinLink: false,
    joinLinkLabel: '',
    joinLinkPlaceholder: '',
    joinButtonText: '',
    dateLabel: '',
    emailSubjectPrefix: "You're on the waitlist:",
  },
  RETREAT_INTEREST: {
    label: 'Retreat Interest',
    description: 'Gauge interest in a future retreat before committing to dates',
    defaultCta: "I'm interested",
    defaultTemplate: 'minimal',
    showDate: false,
    showDuration: false,
    showJoinLink: false,
    joinLinkLabel: '',
    joinLinkPlaceholder: '',
    joinButtonText: '',
    dateLabel: '',
    emailSubjectPrefix: "Thanks for your interest:",
  },
  VOLUNTEER: {
    label: 'Volunteer Signup',
    description: 'Invite people to help at the event in exchange for a free or discounted pass',
    defaultCta: 'Apply to volunteer',
    defaultTemplate: 'minimal',
    showDate: true,
    showDuration: false,
    showJoinLink: false,
    joinLinkLabel: '',
    joinLinkPlaceholder: '',
    joinButtonText: '',
    dateLabel: 'Event Date',
    emailSubjectPrefix: 'Volunteer application received:',
  },
  SCHOLARSHIP: {
    label: 'Scholarship / Subsidy',
    description: 'Let people apply for a subsidised or sponsored spot at your event',
    defaultCta: 'Apply for a scholarship',
    defaultTemplate: 'minimal',
    showDate: true,
    showDuration: false,
    showJoinLink: false,
    joinLinkLabel: '',
    joinLinkPlaceholder: '',
    joinButtonText: '',
    dateLabel: 'Application Deadline',
    emailSubjectPrefix: 'Scholarship application received:',
  },
  DISCOVERY_CALL: {
    label: 'Discovery Call',
    description: 'Invite people to request a short call with you — no Calendly required',
    defaultCta: 'Request a call',
    defaultTemplate: 'speaker',
    showDate: false,
    showDuration: false,
    showJoinLink: false,
    joinLinkLabel: '',
    joinLinkPlaceholder: '',
    joinButtonText: '',
    dateLabel: '',
    emailSubjectPrefix: 'Discovery call request received:',
  },
}

export const ALL_PAGE_TYPES: PageType[] = [
  'WEBINAR',
  'EARLY_BIRD',
  'WAITLIST',
  'RETREAT_INTEREST',
  'VOLUNTEER',
  'SCHOLARSHIP',
  'DISCOVERY_CALL',
]

/** Convert a human title into a URL-safe slug */
export function toPageSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'page'
}
