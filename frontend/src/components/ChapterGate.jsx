import Foreground from './Foreground';

export default function ChapterGate() {
  return (
    <section className="sec" id="gate" data-cam="1">
      {/* foreground: the wall arrives first, the pine at the edge, the grass last */}
      <Foreground chapter="gate" />
      <div className="sec-head" data-rv="fade">
        <span className="k">
          <b>01</b> — The Sanmon
        </span>
        <span className="rule"></span>
        <span className="k jp">山門</span>
      </div>
      <div className="gate-grid">
        <h2 className="display h-sec" data-rv="up">
          Charred cypress, worn stone, one gate left open.
        </h2>
        <div className="gate-copy">
          <p className="lead" data-rv="up">
            Kage begins where the city stops: a mountain gate of cedar burned black, standing in its
            own weather. The soot is not decoration. It is how a board is taught to survive a
            hundred rainy seasons, and the first thing this place asks you to understand.
          </p>
          <p className="body" data-rv="up">
            Climb the worn steps and the worship hall lifts out of the mist, its paper screens lit
            from inside like a lantern the size of a house. Above the eaves a vermilion moon holds
            its place, patient, half hidden. Nothing here is in a hurry. Neither, for the next
            ninety minutes, are you.
          </p>
          <a className="arrowlink" href="#pathways" data-rv="fade" data-cursor>
            <span>Cross the threshold</span>
            <span className="ar">
              <svg viewBox="0 0 14 14" fill="none">
                <path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" strokeWidth="1.3" />
              </svg>
            </span>
          </a>
        </div>
      </div>
      <div className="gate-stats" data-rv="up">
        <div>
          <b>05</b>
          <span>Chapters</span>
        </div>
        <div>
          <b>92</b>
          <span>Minutes</span>
        </div>
        <div>
          <b>1611</b>
          <span>Hall raised</span>
        </div>
        <div>
          <b>∞</b>
          <span>Stillness</span>
        </div>
      </div>
    </section>
  );
}
