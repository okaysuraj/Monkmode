// Track browser resources together so remounts cannot leave animation loops behind.
export function createLifecycle() {
  let disposed = false;
  const cleanups = [];
  const timers = new Set();
  const frames = new Set();
  return {
    get disposed() {
      return disposed;
    },
    cleanup(callback) {
      cleanups.push(callback);
    },
    listen(target, event, callback, options) {
      target.addEventListener(event, callback, options);
      cleanups.push(() => target.removeEventListener(event, callback, options));
    },
    observe(observer) {
      cleanups.push(() => observer.disconnect());
      return observer;
    },
    delay(callback, milliseconds) {
      const id = setTimeout(() => {
        timers.delete(id);
        if (!disposed) callback();
      }, milliseconds);
      timers.add(id);
      return id;
    },
    cancelDelay(id) {
      clearTimeout(id);
      timers.delete(id);
    },
    frame(callback) {
      const id = requestAnimationFrame((time) => {
        frames.delete(id);
        if (!disposed) callback(time);
      });
      frames.add(id);
      return id;
    },
    cancelFrame(id) {
      cancelAnimationFrame(id);
      frames.delete(id);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      timers.forEach(clearTimeout);
      frames.forEach(cancelAnimationFrame);
      cleanups.reverse().forEach((cleanup) => cleanup());
      cleanups.length = 0;
      timers.clear();
      frames.clear();
    },
  };
}
