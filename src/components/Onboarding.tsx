type OnboardingProps = {
  onStart: () => void
  error: string | null
}

export function Onboarding({ onStart, error }: OnboardingProps) {
  return (
    <section className="onboarding" aria-labelledby="welcome-title">
      <div className="onboarding-copy">
        <p className="kicker">A local-first accessibility experiment</p>
        <h1 id="welcome-title">Move through the web with your body.</h1>
        <p className="lede">
          GestureNav reads simple hand, arm, and head movements through your webcam and turns them into page navigation.
        </p>
        <div className="onboarding-actions">
          <button className="primary-button" type="button" onClick={onStart}>Enable camera and begin</button>
          <span className="privacy-note">Your video is processed locally in this browser and never uploaded.</span>
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
      </div>
      <div className="gesture-guide" aria-label="Gesture guide">
        <div><strong>Swipe</strong><span>Move between sections</span></div>
        <div><strong>Pinch</strong><span>Choose an action</span></div>
        <div><strong>Tilt</strong><span>Scroll gently</span></div>
      </div>
    </section>
  )
}
