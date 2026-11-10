"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { t } from "@/lib/i18n";

// Capa em carrossel: um slide por coleção da Shopify (troca sozinho, com pausa, setas, bolinhas e swipe)
export default function HeroCarousel({ slides, subtitle, cta, interval = 5000 }) {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef(null);
  const count = slides.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const playing = count > 1 && !userPaused && !hover && !reduced;
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setI((n) => (n + 1) % count), interval);
    return () => clearInterval(t); // recriado a cada troca: navegar manualmente reinicia o tempo
  }, [playing, count, interval, i]);

  const go = (n) => setI(((n % count) + count) % count);

  function onTouchEnd(e) {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
  }

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label={t("hero.aria")}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={() => setHover(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((s, k) => {
        const active = k === i;
        return (
          <div
            key={s.href}
            className={`hero-slide ${active ? "is-active" : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-label={t("hero.group", { i: k + 1, n: count })}
            aria-hidden={!active}
          >
            {s.image && <Image src={s.image.url} alt="" fill priority={k === 0} sizes="100vw" />}
            <div className="hero-copy">
              <h2 className="cap">{s.title}</h2>
              {subtitle && <p>{subtitle}</p>}
              <Link href={s.href} className="pill pill-lg" tabIndex={active ? 0 : -1}>{cta}</Link>
            </div>
          </div>
        );
      })}

      {count > 1 && (
        <>
          <button className="hero-arrow left" onClick={() => go(i - 1)} aria-label={t("hero.prev")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button className="hero-arrow right" onClick={() => go(i + 1)} aria-label={t("hero.next")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
          <div className="hero-ui">
            <button className="hero-pause" onClick={() => setUserPaused((p) => !p)} aria-label={userPaused ? t("hero.play") : t("hero.pause")}>
              {userPaused ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
              )}
            </button>
            <div className="hero-dots">
              {slides.map((s, k) => (
                <button key={s.href} className={k === i ? "is-on" : ""} aria-label={t("hero.goto", { name: s.title })} aria-current={k === i} onClick={() => go(k)} />
              ))}
            </div>
          </div>
          <p className="sr-only" aria-live={playing ? "off" : "polite"}>{t("hero.slideOf", { i: i + 1, n: count, name: slides[i].title })}</p>
        </>
      )}
    </section>
  );
}
