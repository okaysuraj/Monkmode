import Foreground from './Foreground';

export default function ChapterEternity() {
  return (
    <section className="sec fin" id="eternity" data-cam="4">
      {/* foreground: the closing horizon: hill, ruins, grass, and the last branch */}
      <Foreground chapter="eternity" />
      <div className="eyebrow" data-rv="fade">
        Chapter 04 — Afterlight
      </div>
      <h2 className="display" data-rv="up">
        Afterlight
      </h2>
      <p className="body-lg" data-rv="up">
        The gate does not close behind you. Take the walk whenever the noise gets loud — it is
        always the same path, and never the same light.
      </p>
      <a className="cta" href="#top" data-rv="fade" data-cursor>
        <i></i>
        <span>Begin the walk</span>
        <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
          <path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" strokeWidth="1.3" />
        </svg>
      </a>
    </section>
  );
}
