export default function Navbar() {
  return (
    <header className="nav" id="nav">
      <a className="brand" href="#top" data-cursor>
        <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <circle cx="22" cy="25" r="8.6" fill="#e0231c" fillOpacity=".9" />
          <path d="M5 13h34M9 18.4h26M22 8.5v27" stroke="#dfe7e0" strokeWidth="1.5" />
          <path d="M14 35.5h16" stroke="#dfe7e0" strokeWidth="1.2" strokeOpacity=".6" />
        </svg>
        <span className="brand-tx">
          <b>KAGE</b>
          <i>HIDDEN REALMS OF KYOTO</i>
        </span>
      </a>
      <nav className="nav-links" id="navlinks">
        <a className="nav-link" href="#gate" data-cursor>
          <span>Temples</span>
          <span className="alt">伽藍</span>
        </a>
        <a className="nav-link" href="#pathways" data-cursor>
          <span>Gardens</span>
          <span className="alt">庭園</span>
        </a>
        <a className="nav-link" href="#lessons" data-cursor>
          <span>Rituals</span>
          <span className="alt">神事</span>
        </a>
        <a className="nav-link" href="#eternity" data-cursor>
          <span>Afterlight</span>
          <span className="alt">残光</span>
        </a>
      </nav>
      <button className="nav-burger" aria-label="Menu" data-cursor>
        <i></i>
        <i></i>
      </button>
    </header>
  );
}
