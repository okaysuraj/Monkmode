export default function Preloader() {
  return (
    <div id="pre" aria-label="Loading Kyoto Sanctuary">
      <div className="pre-backdrop"></div>
      <div className="pre-in">
        <div className="pre-mark-wrap">
          <div className="pre-halo" aria-hidden="true"></div>
          <div className="pre-mark">
            <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
              <circle cx="22" cy="24" r="9.5" stroke="#e0231c" strokeWidth="1.5" />
              <path d="M6 12h32M9.5 17h25M22 8v28" stroke="#dfe7e0" strokeWidth="1.4" />
            </svg>
          </div>
        </div>
        <div className="pre-jp jp">影の道</div>
        <div className="pre-bar-container">
          <div className="pre-bar">
            <i id="pre-fill"></i>
          </div>
        </div>
        <div className="pre-meta">
          <span className="pre-status">
            <i className="pre-pulse-dot" aria-hidden="true"></i>
            Raising the mountain temple
          </span>
          <b className="pre-pct-wrap">
            <span id="pre-pct">0</span>%
          </b>
        </div>
        <div className="pre-sublabel">Kyoto Sanctuary · WebGL Experience</div>
      </div>
    </div>
  );
}
