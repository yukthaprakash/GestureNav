import type { ActionType } from './types'

export const ACTION_LABELS: Record<ActionType, string> = {
  'scroll-up': 'Scroll up',
  'scroll-down': 'Scroll down',
  'next-section': 'Next section',
  'previous-section': 'Previous section',
  select: 'Select',
  pause: 'Paused',
  none: 'Ready',
}
