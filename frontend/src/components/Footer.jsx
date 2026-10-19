import Foreground from './Foreground';

export default function Footer() {
  return (
    <footer className="foot" data-cam="5">
      {/* foreground: one planting along the lower edge of the colophon */}
      <Foreground chapter="foot" />
      <div className="foot-grid">
        <div className="foot-brand">
          <svg viewBox="0 0 44 44" fill="none" width="34" height="34" aria-hidden="true">
            <circle cx="22" cy="25" r="8.6" fill="#e0231c" fillOpacity=".9" />
            <path d="M5 13h34M9 18.4h26M22 8.5v27" stroke="#dfe7e0" strokeWidth="1.5" />
          </svg>
          <p>
            A five-chapter night walk through a Kyoto mountain temple. Three illustrated garden
            field notes sit inside a live Three.js sanctuary.
          </p>
        </div>
        <div>
          <h4>Chapters</h4>
          <ul>
            <li>
              <a href="#gate" data-cursor>
                The Sanmon
              </a>
            </li>
            <li>
              <a href="#pathways" data-cursor>
                Still Gardens
              </a>
            </li>
            <li>
              <a href="#lessons" data-cursor>
                Sacred Craft
              </a>
            </li>
            <li>
              <a href="#eternity" data-cursor>
                Afterlight
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4>Practice</h4>
          <ul>
            <li>
              <a href="#lessons" data-cursor>
                Borrowed scenery
              </a>
            </li>
            <li>
              <a href="#lessons" data-cursor>
                Lantern light
              </a>
            </li>
            <li>
              <a href="#lessons" data-cursor>
                Charred cypress
              </a>
            </li>
            <li>
              <a href="#lessons" data-cursor>
                Raked gravel
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4>Elsewhere</h4>
          <ul>
            <li>
              <a href="#top" data-cursor>
                Journal
              </a>
            </li>
            <li>
              <a href="#top" data-cursor>
                Field notes
              </a>
            </li>
            <li>
              <a href="#top" data-cursor>
                Colophon
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="foot-base">
        <span>© 2026 Kage — Kage no Michi</span>
        <span className="jp">静けさは一つの技である</span>
        <span>WebGL · Onest · Kyoto</span>
      </div>
    </footer>
  );
}
