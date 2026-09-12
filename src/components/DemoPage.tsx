import type { RefObject } from 'react'

type DemoPageProps = {
  sectionRefs: RefObject<HTMLElement | null>[]
  onAction: (action: 'scroll-up' | 'scroll-down' | 'select') => void
}

const sections = [
  {
    eyebrow: '01 / Orientation',
    title: 'Navigate without reaching for the mouse.',
    text: 'GestureNav turns familiar body movements into calm, predictable page controls. Try a swipe, raise an arm, or tilt your head.',
    accent: 'lime',
  },
  {
    eyebrow: '02 / Hands',
    title: 'Open palm to move. Pinch to choose.',
    text: 'Keep your hands in frame and use an open palm to scroll. A pinch acts like a select action, giving you a precise fallback when mobility is limited.',
    accent: 'coral',
  },
  {
    eyebrow: '03 / Arms',
    title: 'Whole-arm gestures for clear intent.',
    text: 'Raise your left or right arm to move between sections. The gesture is deliberately broad, making it legible across different camera positions.',
    accent: 'blue',
  },
  {
    eyebrow: '04 / Face',
    title: 'Small head movements, gentle feedback.',
    text: 'Tilt left or right to scroll. If you look away for a moment, tracking pauses automatically so the interface stays respectful of your attention.',
    accent: 'yellow',
  },
  {
    eyebrow: '05 / Practice',
    title: 'Your browser. Your camera. Your control.',
    text: 'Everything runs locally in this tab. Nothing is uploaded, and keyboard controls remain available whenever you need them.',
    accent: 'white',
  },
]

export function DemoPage({ sectionRefs, onAction }: DemoPageProps) {
  return (
    <main className="demo-page">
      {sections.map((section, index) => (
        <section
          className={`demo-section accent-${section.accent}`}
          id={`section-${index + 1}`}
          key={section.title}
          ref={sectionRefs[index]}
          tabIndex={-1}
        >
          <span className="section-number">{section.eyebrow}</span>
          <div className="section-copy">
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </div>
          <div className="section-controls" aria-label={`${section.title} controls`}>
            <button type="button" onClick={() => onAction('scroll-up')} aria-label="Scroll up">↑</button>
            <button type="button" onClick={() => onAction('select')} aria-label="Select">Select</button>
            <button type="button" onClick={() => onAction('scroll-down')} aria-label="Scroll down">↓</button>
          </div>
        </section>
      ))}
    </main>
  )
}
