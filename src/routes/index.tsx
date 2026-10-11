import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import hero from "@/assets/hero.jpg";
import garden from "@/assets/garden.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solemn Home | Honoring Every Life" },
      {
        name: "description",
        content:
          "Family-owned funeral home offering traditional funerals, cremation, memorial services and pre-planning with grace and care.",
      },
      { property: "og:title", content: "Solemn Home" },
      {
        property: "og:description",
        content: "Compassionate funeral, cremation and memorial services. Available 24 hours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PHONE = "(000) 000-0000";

const services = [
  {
    n: "I",
    t: "Traditional Funerals",
    d: "Visitation, chapel service and graveside committal. We handle every detail so you don't have to.",
  },
  {
    n: "II",
    t: "Cremation Services",
    d: "Dignified cremation, with room for a memorial gathering, keepsakes or a scattering ceremony.",
  },
  {
    n: "III",
    t: "Celebrations of Life",
    d: "A gathering that sounds and feels like them. Their music, their stories, their people.",
  },
  {
    n: "IV",
    t: "Pre-Planning",
    d: "Write down your wishes now, so your family never has to guess later.",
  },
];

const steps = [
  { t: "Call us, any hour", d: "A director answers. Not a machine. We come to you, day or night." },
  { t: "Sit down together", d: "We listen first. Then we lay out every option and every price." },
  { t: "We carry the rest", d: "Paperwork, flowers, music, the chapel. You focus on your family." },
];

const packages = [
  {
    t: "Remembrance",
    p: "2,950",
    f: ["Direct cremation", "Memorial urn", "Online tribute page", "Death certificates"],
  },
  {
    t: "Heritage",
    p: "6,800",
    f: [
      "Visitation & chapel service",
      "Premium casket selection",
      "Floral arrangements",
      "Printed programs",
      "Funeral coach",
    ],
    featured: true,
  },
  {
    t: "Legacy",
    p: "11,500",
    f: [
      "Full-service funeral",
      "Bespoke floral design",
      "Live-streamed service",
      "Reception hosting",
      "Grief support for one year",
    ],
  },
];

const tributes = [
  { name: "Margaret Ellen Hayes", years: "1938 · 2026", candles: 214 },
  { name: "Robert James Whitfield", years: "1951 · 2026", candles: 158 },
  { name: "Eleanor Rose Delacroix", years: "1944 · 2026", candles: 97 },
];

const faqs = [
  {
    q: "What do I do first when someone dies?",
    a: "Call us. We'll tell you exactly what happens next and come to collect your loved one with care, at any hour.",
  },
  {
    q: "Will there be surprise costs?",
    a: "No. You get a written price list before anything is decided. The number we agree on is the number you pay.",
  },
  {
    q: "Can we make the service personal?",
    a: "Yes. Music, photos, readings, a favorite place. If it mattered to them, we'll find a way to include it.",
  },
];

/* Hero caption bands: [start, end] of hero scroll progress */
const bands = [
  { range: [0.0, 0.3], eyebrow: "Family owned since 1962", line: "Some goodbyes need time." },
  { range: [0.32, 0.6], eyebrow: "Day or night", line: "We'll be here for every one of them." },
];

/* Deterministic pseudo-random so server and client render the same embers */
const rand = (i: number, s: number) => {
  const x = Math.sin(i * 9301 + s * 49297) * 233280;
  return x - Math.floor(x);
};
const embers = Array.from({ length: 22 }, (_, i) => ({
  left: `${rand(i, 1) * 100}%`,
  size: 2 + rand(i, 2) * 3,
  dur: 14 + rand(i, 3) * 16,
  delay: -rand(i, 4) * 30,
  drift: (rand(i, 5) - 0.5) * 80,
}));

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function DrawLine({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`draw-line ${className}`}
      viewBox="0 0 240 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M0 12 H96 C108 12 110 2 120 2 C130 2 132 12 144 12 H240" />
      <circle cx="120" cy="18" r="2" />
    </svg>
  );
}

function Index() {
  const [sent, setSent] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const [lit, setLit] = useState<Record<string, boolean>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const heroRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const bandRefs = useRef<(HTMLDivElement | null)[]>([]);
  const settleRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-reveal]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heroEl = heroRef.current;
    const footerEl = footerRef.current;

    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            reveal.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    revealItems.forEach((item) => reveal.observe(item));

    // Scroll-scrubbed hero: lerp displayed progress toward target, rest when settled.
    let target = reduced ? 1 : 0;
    let shown = target;
    let lastWritten = -1;
    let raf = 0;

    const readTarget = () => {
      if (!heroEl) return;
      const rect = heroEl.getBoundingClientRect();
      const span = heroEl.offsetHeight - window.innerHeight;
      target = reduced || span <= 0 ? 1 : clamp(-rect.top / span);
      setScrolled(window.scrollY > window.innerHeight * 0.6);

      if (!footerEl) {
        setShowBackTop(false);
        return;
      }

      const footerRect = footerEl.getBoundingClientRect();
      const revealThreshold = window.innerHeight + 360;
      setShowBackTop(footerRect.top <= revealThreshold);
    };

    const write = (p: number) => {
      if (!heroEl || Math.abs(p - lastWritten) < 0.0005) return;
      lastWritten = p;
      heroEl.style.setProperty("--p", p.toFixed(4));
      bands.forEach((b, i) => {
        const el = bandRefs.current[i];
        if (!el) return;
        const [s = 0, e = 1] = b.range;
        const fadeIn = clamp((p - s) / 0.08);
        const fadeOut = clamp((e - p) / 0.08);
        const o = i === 0 ? Math.min(1, fadeOut) : Math.min(fadeIn, fadeOut);
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - o) * 24).toFixed(1)}px, 0)`;
        el.style.filter = `blur(${((1 - o) * 6).toFixed(1)}px)`;
      });
      if (settleRef.current) {
        const o = clamp((p - 0.66) / 0.14);
        settleRef.current.style.opacity = o.toFixed(3);
        settleRef.current.style.transform = `translate3d(0, ${((1 - o) * 32).toFixed(1)}px, 0)`;
        settleRef.current.style.pointerEvents = o > 0.5 ? "auto" : "none";
      }
      if (cueRef.current) cueRef.current.style.opacity = clamp(1 - p * 6).toFixed(3);
    };

    const tick = () => {
      shown += (target - shown) * 0.12;
      if (Math.abs(target - shown) < 0.0008) shown = target;
      write(shown);
      raf = shown === target ? 0 : requestAnimationFrame(tick);
    };

    const onScroll = () => {
      readTarget();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    readTarget();
    shown = target;
    write(shown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      reveal.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header
        className={`site-nav fixed inset-x-0 top-0 z-30 transition-all duration-700 ${scrolled ? "is-solid" : ""}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-deep-foreground">
          <a href="#" className="flex items-center gap-3 font-serif text-2xl tracking-wide">
            <span className="nav-flame" aria-hidden="true" />
            Solemn Home
          </a>
          <nav className="hidden gap-10 text-sm tracking-wide md:flex">
            {[
              ["Services", "#services"],
              ["Packages", "#packages"],
              ["Tributes", "#tributes"],
              ["Contact", "#contact"],
            ].map(([l, h]) => (
              <a key={h} href={h} className="nav-link">
                {l}
              </a>
            ))}
          </nav>
          <a
            href={`tel:${PHONE}`}
            className="btn-ghost hidden px-5 py-2 text-xs uppercase tracking-[0.2em] sm:inline-block"
          >
            24/7 · {PHONE}
          </a>
        </div>
      </header>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`back-top ${showBackTop ? "is-visible" : ""}`}
        aria-label="Back to top"
      >
        <span aria-hidden="true">↑</span>
      </button>

      {/* Cinematic hero: scroll drives the camera push and the story */}
      <section ref={heroRef} className="hero-cine relative" aria-label="Welcome">
        <div className="hero-cine__stage sticky top-0 h-screen overflow-hidden">
          <img
            src={hero}
            alt="Sunlit memorial chapel with lilies and candles"
            width={1920}
            height={1088}
            fetchPriority="high"
            className="hero-cine__image absolute inset-0 h-full w-full object-cover"
          />
          <div className="hero-cine__scrim absolute inset-0" aria-hidden="true" />
          <div className="hero-cine__vignette absolute inset-0" aria-hidden="true" />
          <div className="hero-cine__grain absolute inset-0" aria-hidden="true" />
          <div className="embers absolute inset-0" aria-hidden="true">
            {embers.map((e, i) => (
              <span
                key={i}
                style={
                  {
                    left: e.left,
                    width: e.size,
                    height: e.size,
                    animationDuration: `${e.dur}s`,
                    animationDelay: `${e.delay}s`,
                    "--drift": `${e.drift}px`,
                  } as CSSProperties
                }
              />
            ))}
          </div>

          {/* Caption bands */}
          <div className="absolute inset-0 mx-auto flex max-w-7xl items-end px-6 pb-28 text-deep-foreground">
            {bands.map((b, i) => (
              <div
                key={b.line}
                ref={(el) => {
                  bandRefs.current[i] = el;
                }}
                className="hero-band absolute bottom-28 left-6 right-6 max-w-3xl"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <p className="eyebrow">{b.eyebrow}</p>
                <p className="glow-text mt-5 font-serif text-5xl leading-[1.05] md:text-7xl">
                  {b.line}
                </p>
              </div>
            ))}

            {/* Settle */}
            <div
              ref={settleRef}
              className="hero-band relative max-w-4xl"
              style={{ opacity: 0, pointerEvents: "none" }}
            >
              <p className="eyebrow">Solemn Home · Est. 1962</p>
              <h1 className="glow-text mt-6 text-5xl leading-[1.02] md:text-8xl">
                Honoring every life <em className="text-gold">with grace.</em>
              </h1>
              <p className="mt-8 max-w-xl text-lg font-light opacity-90">
                We walk beside your family through every step, so you can focus on remembering.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href="#contact" className="btn-gold px-8 py-4 text-xs uppercase tracking-[0.25em]">
                  Arrange a Service
                </a>
                <a
                  href="#packages"
                  className="btn-ghost px-8 py-4 text-xs uppercase tracking-[0.25em]"
                >
                  View Packages
                </a>
              </div>
            </div>
          </div>

          <div
            ref={cueRef}
            className="scroll-cue absolute bottom-8 left-1/2 -translate-x-1/2 text-deep-foreground"
          >
            <span className="eyebrow !text-deep-foreground/70">Scroll</span>
            <span className="scroll-cue__line" />
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="ambient relative overflow-hidden py-36 text-center">
        <div className="mx-auto max-w-4xl px-6" data-scroll-reveal>
          <p className="eyebrow">Our Promise</p>
          <p className="mt-10 font-serif text-3xl leading-snug md:text-5xl">
            “In the hardest week of your life, you shouldn't have to carry it alone.{" "}
            <em className="text-gold">So you won't.</em>”
          </p>
          <DrawLine className="mx-auto mt-12 w-48" />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-secondary py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div
            className="flex flex-col justify-between gap-6 md:flex-row md:items-end"
            data-scroll-reveal
          >
            <div>
              <p className="eyebrow">Services</p>
              <h2 className="mt-4 text-5xl md:text-7xl">How we can help</h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              Every family is different. Your traditions, your faith, your wishes. We build the
              service around them.
            </p>
          </div>
          <div className="mt-20 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4">
            {services.map((s, index) => (
              <div
                key={s.t}
                className="service-card group relative bg-secondary p-10"
                data-scroll-reveal
                style={{ "--reveal-delay": `${index * 110}ms` } as CSSProperties}
              >
                <span className="font-serif text-3xl italic text-gold">{s.n}</span>
                <h3 className="mt-10 text-3xl">{s.t}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                <span className="service-card__rule" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grounds */}
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-36 md:grid-cols-2">
        <div className="image-frame relative" data-scroll-reveal>
          <img
            src={garden}
            alt="Misty memorial garden path with white roses"
            loading="lazy"
            width={1024}
            height={1280}
            className="aspect-4/5 w-full object-cover"
          />
        </div>
        <div data-scroll-reveal style={{ "--reveal-delay": "150ms" } as CSSProperties}>
          <p className="eyebrow">Our Grounds</p>
          <h2 className="mt-4 text-5xl md:text-6xl">A quiet place to gather</h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Our chapel seats 250 and opens onto a private memorial garden. There's a family lounge,
            reception rooms and plenty of parking, so everyone who comes can stay as long as they
            need.
          </p>
          <dl className="mt-12 grid grid-cols-3 gap-6 border-t pt-8">
            {[
              ["60+", "Years serving"],
              ["12k", "Families cared for"],
              ["24/7", "Always available"],
            ].map(([a, b]) => (
              <div key={b}>
                <dt className="font-serif text-5xl text-primary">{a}</dt>
                <dd className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                  {b}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-deep relative overflow-hidden py-32 text-deep-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center" data-scroll-reveal>
            <p className="eyebrow">What happens next</p>
            <h2 className="mt-4 text-5xl md:text-6xl">Three steps. We take the weight.</h2>
          </div>
          <ol className="steps relative mt-20 grid gap-14 md:grid-cols-3">
            {steps.map((s, i) => (
              <li
                key={s.t}
                className="relative text-center"
                data-scroll-reveal
                style={{ "--reveal-delay": `${i * 160}ms` } as CSSProperties}
              >
                <span className="step-dot mx-auto flex h-14 w-14 items-center justify-center rounded-full font-serif text-2xl text-gold">
                  {i + 1}
                </span>
                <h3 className="mt-8 text-3xl">{s.t}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed opacity-70">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center" data-scroll-reveal>
            <p className="eyebrow">Honest Pricing</p>
            <h2 className="mt-4 text-5xl md:text-7xl">Service packages</h2>
            <p className="mx-auto mt-6 max-w-lg text-muted-foreground">
              Written prices, up front. No pressure, no surprises.
            </p>
          </div>
          <div className="mt-20 grid gap-6 lg:grid-cols-3">
            {packages.map((p, i) => (
              <div
                key={p.t}
                className={`package-card flex flex-col p-10 ${p.featured ? "is-featured" : ""}`}
                data-scroll-reveal
                style={{ "--reveal-delay": `${i * 120}ms` } as CSSProperties}
              >
                {p.featured ? (
                  <span className="eyebrow mb-4">Most chosen</span>
                ) : (
                  <span className="eyebrow mb-4 opacity-0">.</span>
                )}
                <h3 className="text-4xl">{p.t}</h3>
                <p className="mt-4 font-serif text-6xl text-gold">
                  <span className="align-top text-2xl">$</span>
                  {p.p}
                </p>
                <ul className="mt-8 flex-1 space-y-3 text-sm opacity-80">
                  {p.f.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <span className="h-px w-4 bg-gold" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`mt-10 py-4 text-center text-xs uppercase tracking-[0.25em] ${p.featured ? "btn-gold" : "btn-outline"}`}
                >
                  Enquire
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tributes: interactive candle moment */}
      <section id="tributes" className="bg-secondary py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center" data-scroll-reveal>
            <p className="eyebrow">Recent Obituaries</p>
            <h2 className="mt-4 text-5xl md:text-7xl">In loving memory</h2>
            <p className="mx-auto mt-6 max-w-md text-muted-foreground">
              Light a candle to let a family know you're thinking of them.
            </p>
          </div>
          <ul className="mt-16 divide-y border-y">
            {tributes.map((t, i) => {
              const on = !!lit[t.name];
              return (
                <li
                  key={t.name}
                  className="flex flex-col justify-between gap-4 py-8 sm:flex-row sm:items-center"
                  data-scroll-reveal
                  style={{ "--reveal-delay": `${i * 100}ms` } as CSSProperties}
                >
                  <div>
                    <span className="block font-serif text-3xl md:text-4xl">{t.name}</span>
                    <span className="mt-1 block text-sm tracking-widest text-muted-foreground">
                      {t.years}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLit((s) => ({ ...s, [t.name]: !s[t.name] }))}
                    className={`candle-btn flex items-center gap-4 self-start sm:self-auto ${on ? "is-lit" : ""}`}
                    aria-pressed={on}
                  >
                    <span className="candle" aria-hidden="true">
                      <span className="candle__flame" />
                    </span>
                    <span className="text-left text-xs uppercase tracking-[0.2em]">
                      {on ? "Candle lit" : "Light a candle"}
                      <span className="block text-muted-foreground normal-case tracking-normal">
                        {t.candles + (on ? 1 : 0)} candles
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <figure className="mt-28 text-center" data-scroll-reveal>
            <blockquote className="font-serif text-2xl italic leading-relaxed md:text-4xl">
              “They treated our mother as if she were their own. Every detail was right, and we
              never felt alone.”
            </blockquote>
            <figcaption className="eyebrow mt-8">The Hayes Family</figcaption>
          </figure>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 py-32">
        <div className="text-center" data-scroll-reveal>
          <p className="eyebrow">Questions families ask</p>
          <h2 className="mt-4 text-5xl md:text-6xl">You can ask us anything</h2>
        </div>
        <div className="mt-14 divide-y border-y" data-scroll-reveal>
          {faqs.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-7 text-left"
                  aria-expanded={open}
                >
                  <span className="font-serif text-2xl md:text-3xl">{f.q}</span>
                  <span className={`faq-plus ${open ? "is-open" : ""}`} aria-hidden="true" />
                </button>
                <div className={`faq-body ${open ? "is-open" : ""}`}>
                  <p className="pb-7 pr-12 leading-relaxed text-muted-foreground">{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-deep relative overflow-hidden py-32 text-deep-foreground">
        <div className="contact-glow" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2">
          <div data-scroll-reveal>
            <p className="eyebrow">We're Here For You</p>
            <h2 className="mt-4 text-5xl md:text-7xl">Speak with a director</h2>
            <p className="mt-6 opacity-70">
              If someone has just died, call us now. A director will answer, at any hour.
            </p>
            <a
              href={`tel:${PHONE}`}
              className="glow-text mt-10 block font-serif text-5xl text-gold transition-opacity hover:opacity-80"
            >
              {PHONE}
            </a>
            <div className="mt-12 space-y-1 text-sm opacity-60">
              <p>123 Portfolio Avenue</p>
              <p>Demo City, ST 00000</p>
              <p>hello@example.com</p>
            </div>
          </div>
          {sent ? (
            <div className="glass flex items-center justify-center p-12 text-center">
              <div>
                <span className="candle is-static mx-auto mb-8" aria-hidden="true">
                  <span className="candle__flame" />
                </span>
                <h3 className="text-4xl">Thank you</h3>
                <p className="mt-4 opacity-70">A member of our family will be in touch shortly.</p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="glass space-y-7 p-10"
              data-scroll-reveal
              style={{ "--reveal-delay": "150ms" } as CSSProperties}
            >
              {[
                ["Full name", "text"],
                ["Email", "email"],
                ["Phone", "tel"],
              ].map(([l, t]) => (
                <label key={l} className="field block">
                  <span className="text-xs uppercase tracking-widest opacity-60">{l}</span>
                  <input required type={t} />
                </label>
              ))}
              <label className="field block">
                <span className="text-xs uppercase tracking-widest opacity-60">
                  How can we help?
                </span>
                <textarea rows={4} />
              </label>
              <button className="btn-gold w-full py-4 text-xs uppercase tracking-[0.25em]">
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      <footer
        ref={footerRef}
        className="bg-deep border-t border-deep-foreground/10 py-12 text-deep-foreground"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-4 px-6 text-sm opacity-60 md:grid-cols-3">
          <span className="flex items-center justify-center gap-3 font-serif text-xl md:justify-self-start">
            <span className="nav-flame" aria-hidden="true" />
            Solemn Home
          </span>
          <span className="text-center">
            Developed by{" "}
            <a
              href="https://ampdirect.online"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:opacity-80"
            >
              AMP Direct
            </a>
          </span>
          <span className="text-center md:justify-self-end">
            © 2026 Solemn Home. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
