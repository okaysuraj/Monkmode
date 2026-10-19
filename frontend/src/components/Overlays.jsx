export default function Overlays() {
  return (
    <>
      <canvas id="gl" aria-hidden="true"></canvas>
      <div id="vignette"></div>
      <div id="grain"></div>
      <div className="cur-dot" id="cursor"></div>
      <div id="fg-sky" aria-hidden="true"></div>
      <div className="rail" id="rail"></div>
    </>
  );
}
