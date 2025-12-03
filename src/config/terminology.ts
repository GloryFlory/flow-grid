// Terminology options for customizable event labels

export const PRESENTER_LABELS = [
  { value: 'Facilitator', description: 'Retreats, healing events, ceremonies' },
  { value: 'Teacher', description: 'Yoga festivals, dance events, workshops' },
  { value: 'Speaker', description: 'Conferences, expos, summits' },
  { value: 'Instructor', description: 'Fitness events, sports clinics' },
  { value: 'Artist', description: 'Music festivals, art shows' },
  { value: 'Host', description: 'Meetups, community events' },
] as const

export type PresenterLabel = typeof PRESENTER_LABELS[number]['value']

export const DEFAULT_PRESENTER_LABEL = 'Facilitator'

// Helper to get plural form
export function getPresenterLabelPlural(label: string): string {
  if (label.endsWith('s')) return label
  return `${label}s`
}

// Helper to get the label with proper article
export function getPresenterLabelWithArticle(label: string): string {
  const vowels = ['A', 'E', 'I', 'O', 'U']
  const article = vowels.includes(label[0].toUpperCase()) ? 'an' : 'a'
  return `${article} ${label}`
}

// Helper to validate and cast presenter label
export function asPresenterLabel(value: string | undefined | null): string {
  const valid = PRESENTER_LABELS.map(l => l.value)
  if (value && valid.includes(value as PresenterLabel)) {
    return value
  }
  return DEFAULT_PRESENTER_LABEL
}
