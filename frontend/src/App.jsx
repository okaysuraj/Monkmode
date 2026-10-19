import { useEffect } from 'react';
import Overlays from './components/Overlays';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ChapterGate from './components/ChapterGate';
import ChapterPathways from './components/ChapterPathways';
import ChapterLessons from './components/ChapterLessons';
import ChapterEternity from './components/ChapterEternity';
import Footer from './components/Footer';

export default function App() {
  useEffect(() => {
    let cancelled = false;
    let dispose;

    // Load the scene after the page mounts; the content can render immediately.
    import('./scene/engine.js')
      .then(({ boot }) => {
        if (!cancelled) dispose = boot();
      })
      .catch(() => {
        if (cancelled) return;
        document.documentElement.classList.add('no-webgl');
        document.body.classList.add('no-webgl');
        document.body.classList.remove('is-locked');
        document.getElementById('pre')?.classList.add('done');
        document
          .querySelectorAll('[data-rv], .mask-line')
          .forEach((element) => element.classList.add('rv-in'));
      });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <>
      <Overlays />
      <Preloader />
      <Navbar />

      <div className="page" id="top">
        <Hero />
        <ChapterGate />
        <ChapterPathways />
        <ChapterLessons />
        <ChapterEternity />
        <Footer />
      </div>
    </>
  );
}
