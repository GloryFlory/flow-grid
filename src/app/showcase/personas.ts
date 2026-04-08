export type PersonaId = 'dance' | 'yoga' | 'music' | 'conference' | 'workshop' | 'sports'

export interface MockSession {
  time: string
  title: string
  teacher: string
  location: string
  level: string
  color: string
}

export interface Persona {
  id: PersonaId
  emoji: string
  label: string
  tagline: string
  color: string
  accentColor: string
  bgColor: string
  borderColor: string
  features: string[]
  painPoint: string
  quote: string
  quoteAuthor: string
  demoUrl: string
  sessions: MockSession[]
}

export const PERSONAS: Persona[] = [
  {
    id: 'dance',
    emoji: '💃',
    label: 'Dance Festival',
    tagline: 'Multi-style. Multi-teacher. Zero chaos.',
    color: '#b40225',
    accentColor: '#ff4560',
    bgColor: '#fff1f3',
    borderColor: '#fecdd3',
    painPoint: 'Juggling 40 teachers across 4 stages in a WhatsApp group.',
    quote: 'We used to send a PDF that was outdated the moment it was printed.',
    quoteAuthor: 'Bachata festival organiser, Berlin',
    demoUrl: '/flow-grid-demo/schedule',
    features: ['Filter by style (Salsa, Bachata, Kizomba…)', 'Teacher photos & bios', 'Multi-room grid view', 'Capacity & booking tracking'],
    sessions: [
      { time: '10:00', title: 'Bachata Sensual Foundations', teacher: 'Carlos & Mia', location: 'Main Hall', level: 'Beginner', color: '#b40225' },
      { time: '11:30', title: 'Salsa On2 Styling', teacher: 'Luis Vargas', location: 'Studio B', level: 'Intermediate', color: '#ff7119' },
      { time: '13:00', title: 'Kizomba Musicality', teacher: 'Ana Torres', location: 'Rooftop', level: 'All Levels', color: '#466d60' },
      { time: '15:00', title: 'Zouk Flow & Connection', teacher: 'Pedro & Sofia', location: 'Main Hall', level: 'Advanced', color: '#2a468b' },
    ]
  },
  {
    id: 'yoga',
    emoji: '🧘',
    label: 'Yoga Retreat',
    tagline: 'Serene schedules for transformative events.',
    color: '#466d60',
    accentColor: '#6b9e8a',
    bgColor: '#f0faf5',
    borderColor: '#bbf7d0',
    painPoint: 'Attendees calling you on day 1 asking "what time is morning practice?"',
    quote: 'My attendees love being able to save their favourite sessions beforehand.',
    quoteAuthor: 'Yoga retreat organiser, Bali',
    demoUrl: '/flow-grid-demo/schedule',
    features: ['Level filtering (Beginner → Advanced)', 'Personal schedule builder', 'Teacher bios & photos', 'Offline-friendly mobile view'],
    sessions: [
      { time: '07:00', title: 'Sunrise Hatha Practice', teacher: 'Priya Sharma', location: 'Shala', level: 'All Levels', color: '#edb75b' },
      { time: '09:30', title: 'Vinyasa Flow', teacher: 'James O\'Brien', location: 'Garden', level: 'Intermediate', color: '#466d60' },
      { time: '11:00', title: 'Yin & Restore', teacher: 'Mei Lin', location: 'Shala', level: 'Beginner', color: '#6b9e8a' },
      { time: '17:00', title: 'Pranayama & Meditation', teacher: 'Priya Sharma', location: 'Rooftop', level: 'All Levels', color: '#2a468b' },
    ]
  },
  {
    id: 'music',
    emoji: '🎵',
    label: 'Music Festival',
    tagline: 'Complex lineups. Simple experience.',
    color: '#edb75b',
    accentColor: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    painPoint: 'Stage clashes nobody knew about until the artist arrived.',
    quote: 'The grid view showed us a clash between two headliners on day 1. Saved us.',
    quoteAuthor: 'Festival director, Amsterdam',
    demoUrl: '/flow-grid-demo/schedule',
    features: ['Multi-stage grid view', 'Filter by genre or artist', 'Real-time updates', 'QR code posters per stage'],
    sessions: [
      { time: '14:00', title: 'DJ Solaris', teacher: 'DJ Solaris', location: 'Main Stage', level: 'Electronic', color: '#edb75b' },
      { time: '15:30', title: 'The Wanderers', teacher: 'The Wanderers', location: 'Forest Stage', level: 'Indie Folk', color: '#466d60' },
      { time: '17:00', title: 'NOVA', teacher: 'NOVA', location: 'Main Stage', level: 'Hip-Hop', color: '#b40225' },
      { time: '21:00', title: 'Closing Ceremony', teacher: 'All Artists', location: 'Main Stage', level: 'All', color: '#2a468b' },
    ]
  },
  {
    id: 'conference',
    emoji: '🎤',
    label: 'Conference & Expo',
    tagline: 'Multiple tracks. One clear schedule.',
    color: '#2a468b',
    accentColor: '#3b5bdb',
    bgColor: '#eef2ff',
    borderColor: '#c7d2fe',
    painPoint: 'A 40-page agenda PDF nobody prints or reads.',
    quote: 'Attendees actually knew where to go. First time in 6 years.',
    quoteAuthor: 'Conference chair, London',
    demoUrl: '/flow-grid-demo/schedule',
    features: ['Track & room management', 'Speaker profiles & bios', 'Session favouriting', 'Export to calendar'],
    sessions: [
      { time: '09:00', title: 'Opening Keynote', teacher: 'Sarah Chen', location: 'Auditorium', level: 'All', color: '#2a468b' },
      { time: '10:30', title: 'AI in Product Design', teacher: 'Mark Rivera', location: 'Track A', level: 'Intermediate', color: '#3b5bdb' },
      { time: '10:30', title: 'Scaling Engineering Teams', teacher: 'Lena Müller', location: 'Track B', level: 'Advanced', color: '#466d60' },
      { time: '14:00', title: 'Panel: Future of Work', teacher: 'Various', location: 'Auditorium', level: 'All', color: '#edb75b' },
    ]
  },
  {
    id: 'workshop',
    emoji: '🎨',
    label: 'Workshop Series',
    tagline: 'Recurring workshops, effortlessly organised.',
    color: '#7c3aed',
    accentColor: '#8b5cf6',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    painPoint: 'Rebuilding your schedule from scratch every month.',
    quote: 'I duplicate last month\'s schedule and update the dates. Takes 5 minutes.',
    quoteAuthor: 'Pottery studio owner, Vienna',
    demoUrl: '/flow-grid-demo/schedule',
    features: ['Duplicate events instantly', 'Recurring schedule templates', 'Capacity limits per class', 'Embed on your own website'],
    sessions: [
      { time: '10:00', title: 'Wheel Throwing Basics', teacher: 'Elena Kovac', location: 'Studio 1', level: 'Beginner', color: '#7c3aed' },
      { time: '13:00', title: 'Glazing Techniques', teacher: 'Tom Weiss', location: 'Studio 2', level: 'Intermediate', color: '#8b5cf6' },
      { time: '15:00', title: 'Sculpture & Hand-Building', teacher: 'Elena Kovac', location: 'Studio 1', level: 'All Levels', color: '#466d60' },
      { time: '17:00', title: 'Advanced Throwing', teacher: 'Ren Nakamura', location: 'Studio 2', level: 'Advanced', color: '#b40225' },
    ]
  },
  {
    id: 'sports',
    emoji: '⚡',
    label: 'Sports & Fitness',
    tagline: 'From boot camps to tournaments.',
    color: '#0891b2',
    accentColor: '#06b6d4',
    bgColor: '#ecfeff',
    borderColor: '#a5f3fc',
    painPoint: 'Athletes showing up to the wrong court at the wrong time.',
    quote: 'Zero confusion on match day. The QR posters at each court were a game changer.',
    quoteAuthor: 'Padel tournament organiser, Madrid',
    demoUrl: '/flow-grid-demo/schedule',
    features: ['Court / field assignment', 'Bracket & match scheduling', 'Level & category filtering', 'QR codes per venue'],
    sessions: [
      { time: '08:00', title: 'HIIT Morning Blast', teacher: 'Coach Patel', location: 'Court A', level: 'Advanced', color: '#0891b2' },
      { time: '09:30', title: 'Mobility & Recovery', teacher: 'Sara Jönsson', location: 'Gym', level: 'All Levels', color: '#466d60' },
      { time: '11:00', title: 'Padel Mixed Doubles', teacher: 'Referee', location: 'Court B', level: 'Intermediate', color: '#edb75b' },
      { time: '14:00', title: 'Finals — Open Category', teacher: 'Referee', location: 'Main Court', level: 'Advanced', color: '#b40225' },
    ]
  },
]
