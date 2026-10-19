import Foreground from './Foreground';

export default function ChapterLessons() {
  return (
    <section className="sec" id="lessons" data-cam="3">
      {/* foreground: a low periphery for the atlas — wall fragment, basalt, one stand of grass */}
      <Foreground chapter="lessons" />
      <div className="sec-head" data-rv="fade">
        <span className="k">
          <b>03</b> — Sacred Craft
        </span>
        <span className="rule"></span>
        <span className="k jp">手業</span>
      </div>
      <div className="cur-head">
        <h2 className="display h-sec" data-rv="up">
          Five chapters. Ninety minutes. One quiet mind.
        </h2>
        <p className="body-lg" data-rv="up">
          Each chapter is a walk, not a lecture. You arrive at the gate, climb the steps, sit with
          the lantern, and leave with one thing worth keeping.
        </p>
      </div>
      <div className="cur" id="cur">
        <div className="les" data-les="0" data-cursor>
          <span className="k">01</span>
          <h3>
            The Hidden Gate<em className="jp">山門</em>
          </h3>
          <p>Why a gate is a sentence, and what you agree to when you walk under one.</p>
          <span className="t">14 min</span>
          <i className="bar"></i>
        </div>
        <div className="les" data-les="1" data-cursor>
          <span className="k">02</span>
          <h3>
            Borrowed Scenery<em className="jp">借景</em>
          </h3>
          <p>Shakkei: composing with a mountain you will never own.</p>
          <span className="t">18 min</span>
          <i className="bar"></i>
        </div>
        <div className="les" data-les="2" data-cursor>
          <span className="k">03</span>
          <h3>
            Charred Cypress<em className="jp">焼杉</em>
          </h3>
          <p>Yakisugi: burning a board black so the weather will let it live.</p>
          <span className="t">21 min</span>
          <i className="bar"></i>
        </div>
        <div className="les" data-les="3" data-cursor>
          <span className="k">04</span>
          <h3>
            Lantern Light<em className="jp">灯籠</em>
          </h3>
          <p>How a single ember decides the scale of everything around it.</p>
          <span className="t">17 min</span>
          <i className="bar"></i>
        </div>
        <div className="les" data-les="4" data-cursor>
          <span className="k">05</span>
          <h3>
            The Vermilion Moon<em className="jp">朱月</em>
          </h3>
          <p>Why the moon burns red over the valley, and what the garden does with it.</p>
          <span className="t">22 min</span>
          <i className="bar"></i>
        </div>
      </div>
    </section>
  );
}
