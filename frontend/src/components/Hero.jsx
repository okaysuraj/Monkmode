export default function Hero() {
  return (
    <section className="hero" id="hero" data-cam="0">
      <div className="hero-top">
        <div className="eyebrow" data-rv="fade">
          <span className="dot"></span> Chapter 00 — The Hidden Gate
        </div>
        <h1 className="display h-hero">
          <span className="mask-line">
            <span>Where stillness</span>
          </span>
          <span className="mask-line">
            <span>reveals the</span>
          </span>
          <span className="mask-line">
            <span>unseen.</span>
          </span>
        </h1>
        <p className="hero-sub body" data-rv="up">
          Enter Kyoto through its quiet thresholds, where ritual, craft, and memory shape the path.
        </p>
      </div>

      <div className="hero-spacer"></div>

      <div className="hero-foot">
        <div className="hero-cue" data-rv="fade">
          <span>Scroll to enter</span>
          <span className="track">
            <i></i>
          </span>
        </div>
        <div className="chapters" id="chips">
          <div className="chip" data-chip="0" data-rv="up" data-cursor>
            <span className="num">01</span>
            <span className="tx">
              <b>Thresholds</b>
              <p>Discover the hidden gates that open on to deeper paths.</p>
            </span>
          </div>
          <div className="chip" data-chip="1" data-rv="up" data-cursor>
            <span className="num">02</span>
            <span className="tx">
              <b>Still Gardens</b>
              <p>Witness the courts where silence gently unfolds.</p>
            </span>
          </div>
          <div className="chip" data-chip="2" data-rv="up" data-cursor>
            <span className="num">03</span>
            <span className="tx">
              <b>Sacred Craft</b>
              <p>Embrace the hands and heritage that shape devotion.</p>
            </span>
          </div>
          <div className="chip" data-chip="3" data-rv="up" data-cursor>
            <span className="num">04</span>
            <span className="tx">
              <b>Night Rituals</b>
              <p>Explore the rites that awaken when the day is done.</p>
            </span>
          </div>
        </div>
      </div>

      <a
        className="peek"
        href="#pathways"
        data-view="3"
        data-rv="fade"
        data-cursor
        aria-label="Preview: Sanmon, before the bell"
      >
        <span className="peek-fr" data-frame></span>
        <span className="peek-play">
          <svg viewBox="0 0 22 22" fill="none">
            <path d="M8 5.6 16.4 11 8 16.4z" fill="#dfe7e0" />
          </svg>
        </span>
        <span className="peek-cap">
          <b className="jp">山門</b>
          <i>Sanmon — before the bell</i>
        </span>
      </a>

      <div className="word-fb" aria-hidden="true">
        KAGE
      </div>

      <div className="hero-side" data-rv="up">
        <span className="v jp">影の道</span>
      </div>
    </section>
  );
}
