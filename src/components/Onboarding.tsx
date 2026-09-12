type OnboardingProps = {
  onStart: () => void
  error: string | null
  isMobile: boolean
}

export function Onboarding({ onStart, error, isMobile }: OnboardingProps) {
  return (
    <section className="onboarding" aria-labelledby="welcome-title">
      <div className="onboarding-copy">
        <p className="kicker">A local-first accessibility experiment</p>
        <h1 id="welcome-title">Move through the web with your body.</h1>
        <p className="lede">
          GestureNav reads simple hand, arm, and head movements through your webcam and turns them into page navigation.
        </p>
        {isMobile && <p className="device-note"><strong>Best viewed on desktop.</strong> A larger screen and webcam make the gestures easier to use. Keyboard navigation works on every device.</p>}
        <div className="onboarding-actions">
          {!isMobile && <button className="primary-button" type="button" onClick={onStart}>Enable camera and begin</button>}
          <span className="privacy-note">Your video is processed locally in this browser and never uploaded or stored. No account or backend is involved.</span>
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
      </div>
      <div className="gesture-guide" aria-label="Gesture guide">
        <div><strong>Raise right arm</strong><span>Next section</span></div>
        <div><strong>Raise left arm</strong><span>Previous section</span></div>
        <div><strong>Swipe left / right</strong><span>Move between sections</span></div>
        <div><strong>Pinch</strong><span>Click the focused control</span></div>
        <div><strong>Tilt head</strong><span>Scroll up or down</span></div>
        <div><strong>Keyboard arrows</strong><span>Always available as a fallback</span></div>
      </div>
    </section>
  )
}
