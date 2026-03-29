import { useEffect, useRef, useState, useCallback } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import confetti from "canvas-confetti";
import { MarbleBackground } from "./MarbleBackground.jsx";
import { KnightScene } from "./KnightScene.jsx";
import { MagneticButton } from "./MagneticButton.jsx";
import { CustomCursor } from "./CustomCursor.jsx";
import { ScrollProgress } from "./ScrollProgress.jsx";
import { T } from "../lib/tokens.js";

gsap.registerPlugin(ScrollTrigger);

const TICKER = [
  "Forgot the group chat birthday",
  "Said 'on my way' for 40 minutes",
  "Left on read for 6 days",
  "Double-booked the one person who remembers",
  "Liked the ex's post from 2019",
  "Promised to call back tomorrow (last month)",
];

const ALIBI_CARDS = [
  {
    title: "Missed birthday",
    alibi:
      "A courier mis-routed your gift through a regional blackout — you were on hold with their disaster line for 4 hours. You have screenshots. The cake is en route.",
  },
  {
    title: "Forgotten anniversary",
    alibi:
      "You were covering a colleague's on-call rotation after a hospitalisation — you couldn't say why because of HR. Flowers + handwritten note already dispatched.",
  },
  {
    title: "Ghosted plans",
    alibi:
      "Your phone bricked during a firmware update the night before; recovery took until Monday. You're sending dinner for two to their door tonight.",
  },
];

const GIFTS = [
  { name: "Artisan apology chocolate", hint: "Handwritten card included" },
  { name: "Same-day flowers", hint: "No generic bouquets" },
  { name: "Concert tickets (their taste)", hint: "Not yours" },
  { name: "Spa recovery voucher", hint: "Guilt-absorbing" },
  { name: "Rare vinyl / book", hint: "Proves you listen" },
];

export function MarketingHome({
  onSummonKnight,
  onDemo,
  isAuthenticated = false,
  onLogin = () => {},
  onLogout = () => {},
  userEmail,
}) {
  const wrapRef = useRef(null);
  const heroRef = useRef(null);
  const knightHeroRef = useRef(null);
  const howRef = useRef(null);
  const howTrackRef = useRef(null);
  const examplesRef = useRef(null);
  const ctaRef = useRef(null);
  const pathRef = useRef(null);

  const [navSolid, setNavSolid] = useState(false);
  const [heroKnightHover, setHeroKnightHover] = useState(false);
  const [ctaKnightHover, setCtaKnightHover] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroScroll, setHeroScroll] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [web3On] = useState(true);

  const fireConfetti = useCallback(() => {
    const gold = "#C9A84C";
    const red = "#B8312F";
    confetti({
      particleCount: 90,
      spread: 68,
      origin: { y: 0.65 },
      colors: [gold, red, "#F2E9D8"],
    });
  }, []);

  useEffect(() => {
    document.body.style.cursor = "none";
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.92,
    });

    lenis.on("scroll", ScrollTrigger.update);
    lenis.on("scroll", (instance) => {
      setScrollProgress(instance.progress ?? 0);
    });

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const scrollEl = document.documentElement;
    ScrollTrigger.scrollerProxy(scrollEl, {
      scrollTop(value) {
        if (arguments.length) lenis.scrollTo(value, { immediate: true });
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    let triggers = [];

    const boot = () => {
      const wrap = wrapRef.current;
      const hero = heroRef.current;
      if (wrap) {
        triggers.push(
          ScrollTrigger.create({
            trigger: wrap,
            start: "top -80",
            end: 999999,
            scroller: scrollEl,
            onEnter: () => setNavSolid(true),
            onLeaveBack: () => setNavSolid(false),
          }),
        );
      }
      if (hero) {
        triggers.push(
          ScrollTrigger.create({
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scroller: scrollEl,
            onUpdate: (self) => setHeroScroll(self.progress),
          }),
        );
      }

      const howSection = howRef.current;
      const howTrack = howTrackRef.current;
      if (howSection && howTrack) {
        const getScroll = () =>
          Math.max(0, howTrack.scrollWidth - window.innerWidth);
        gsap.to(howTrack, {
          x: () => -getScroll(),
          ease: "none",
          scrollTrigger: {
            trigger: howSection,
            scroller: scrollEl,
            start: "top top",
            end: () => `+=${getScroll() + window.innerHeight * 0.45}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }

      const cards = gsap.utils.toArray(".alibi-card");
      if (cards.length && examplesRef.current) {
        gsap.from(cards, {
          rotateY: 45,
          opacity: 0,
          y: 40,
          stagger: 0.12,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: examplesRef.current,
            scroller: scrollEl,
            start: "top 75%",
          },
        });
      }

      if (ctaRef.current) {
        const words = ctaRef.current.querySelectorAll(".cta-word");
        if (words.length) {
          gsap.from(words, {
            y: 80,
            opacity: 0,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              scroller: scrollEl,
              start: "top 70%",
              end: "top 20%",
              scrub: 1,
            },
          });
        }
      }

      const path = pathRef.current;
      if (path && wrap) {
        const pathLen = path.getTotalLength();
        path.style.strokeDasharray = `${pathLen}`;
        path.style.strokeDashoffset = `${pathLen}`;
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            scroller: scrollEl,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });
      }

      gsap.from(".hero-knight-wrap", {
        scale: 0.85,
        opacity: 0,
        duration: 1.2,
        ease: "power2.out",
        delay: 0.15,
      });
      gsap.from(".hero-char", {
        y: 36,
        opacity: 0,
        rotateZ: -5,
        stagger: 0.028,
        duration: 0.95,
        ease: "power3.out",
        delay: 0.35,
      });
      gsap.from(".hero-badge", {
        x: 72,
        opacity: 0,
        duration: 0.85,
        ease: "back.out(1.35)",
        delay: 0.55,
      });

      ScrollTrigger.refresh();
    };

    const frame = requestAnimationFrame(boot);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(rafId);
      triggers.forEach((t) => t.kill());
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const headline = "Your knight in shining alibi.";
  const chars = headline.split("");

  return (
    <div ref={wrapRef} style={{ position: "relative", minHeight: "100vh" }}>
      <CustomCursor />
      <ScrollProgress progress={scrollProgress} />

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          background: navSolid ? "rgba(14,12,8,0.88)" : "transparent",
          backdropFilter: navSolid ? "blur(16px)" : "none",
          WebkitBackdropFilter: navSolid ? "blur(16px)" : "none",
          borderBottom: navSolid ? `1px solid ${T.border}` : "1px solid transparent",
          transition: "background 0.35s ease, border-color 0.35s ease",
        }}
      >
        <div
          style={{
            fontFamily: T.fontDisplay,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 22,
            color: T.parchment,
            letterSpacing: "-0.02em",
          }}
        >
          Sir Alibi
        </div>
        <div
          style={{
            display: "none",
            gap: 28,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: T.parchmentDim,
            fontFamily: T.fontBody,
          }}
          className="nav-links"
        >
          <a href="#how" style={{ color: "inherit", textDecoration: "none" }}>
            Ritual
          </a>
          <a href="#examples" style={{ color: "inherit", textDecoration: "none" }}>
            Proof
          </a>
          <a href="#vault" style={{ color: "inherit", textDecoration: "none" }}>
            Vault
          </a>
          <a href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>
            Ransom
          </a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {web3On && (
            <button
              type="button"
              title="Connect to unlock premium alibis"
              onClick={() => setWalletConnected((v) => !v)}
              style={{
                padding: "8px 14px",
                borderRadius: T.radiusSm,
                border: `1px solid ${walletConnected ? T.gold : T.border}`,
                background: walletConnected ? T.goldLight : "transparent",
                color: walletConnected ? T.gold : T.parchmentDim,
                fontSize: 10,
                fontWeight: 600,
                fontFamily: T.fontBody,
                cursor: "pointer",
                maxWidth: 200,
                lineHeight: 1.25,
              }}
            >
              {walletConnected ? "Wallet linked" : "Connect — premium alibis"}
            </button>
          )}
          <MagneticButton primary onClick={onSummonKnight}>
            Summon knight
          </MagneticButton>
        </div>
      </nav>
      <style>{`
        @media (min-width: 900px) {
          .nav-links { display: flex !important; }
        }
      `}</style>

      <svg
        style={{
          position: "fixed",
          left: 24,
          top: "30%",
          width: 80,
          height: "45%",
          zIndex: 5,
          pointerEvents: "none",
          opacity: 0.35,
        }}
        viewBox="0 0 80 400"
      >
        <path
          ref={pathRef}
          d="M40 0 Q 70 80 40 160 Q 10 240 40 320 Q 60 380 40 400"
          stroke={T.gold}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Hero */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          padding: "100px 28px 100px",
          gap: 24,
          overflow: "hidden",
        }}
        className="hero-section"
      >
        <MarbleBackground />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, rgba(14,12,8,0.75) 0%, rgba(14,12,8,0.35) 45%, rgba(14,12,8,0.85) 100%)",
            pointerEvents: "none",
          }}
        />

        <div
          ref={knightHeroRef}
          className="hero-knight-wrap"
          style={{
            position: "relative",
            zIndex: 2,
            height: "min(72vh, 560px)",
            gridColumn: "1",
          }}
          onMouseEnter={() => setHeroKnightHover(true)}
          onMouseLeave={() => setHeroKnightHover(false)}
        >
          <KnightScene
            scrollProgress={heroScroll}
            ctaHover={heroKnightHover}
            variant="hero"
          />
        </div>

        <div style={{ position: "relative", zIndex: 2, paddingRight: 12 }}>
          <div
            style={{
              display: "inline-block",
              marginBottom: 20,
              padding: "8px 16px",
              border: `1px solid ${T.goldBorder}`,
              background: "rgba(201,168,76,0.06)",
              borderRadius: T.radiusFull,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.2em",
              color: T.gold,
              fontFamily: T.fontBody,
            }}
            className="hero-badge"
          >
            2,400 battles fought
          </div>
          <h1
            style={{
              fontFamily: T.fontDisplay,
              fontWeight: 900,
              fontStyle: "italic",
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              lineHeight: 1.05,
              color: T.parchment,
              margin: "0 0 20px",
            }}
          >
            {chars.map((ch, i) => (
              <span
                key={`${i}-${ch}`}
                className="hero-char"
                style={{ display: "inline-block" }}
              >
                {ch === " " ? "\u00a0" : ch}
              </span>
            ))}
          </h1>
          <p
            style={{
              fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)",
              color: T.parchmentDim,
              maxWidth: 420,
              lineHeight: 1.7,
              fontFamily: T.fontBody,
              fontWeight: 400,
              marginBottom: 28,
            }}
          >
            Describe the screw-up. Sir Alibi forges the alibi, ships a real gift
            to the wronged party, and leaves you looking oddly heroic.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <MagneticButton
              primary
              onClick={() => {
                fireConfetti();
                onSummonKnight();
              }}
            >
              Confess your crime
            </MagneticButton>
            <MagneticButton onClick={onDemo}>Run the demo</MagneticButton>
          </div>
        </div>

        <div
          style={{
            gridColumn: "1 / -1",
            position: "relative",
            zIndex: 2,
            marginTop: -32,
            borderTop: `1px solid ${T.border}`,
            paddingTop: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 48,
              animation: "ticker 28s linear infinite",
              whiteSpace: "nowrap",
              fontSize: 13,
              fontFamily: T.fontBody,
              color: T.parchmentFaint,
            }}
          >
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i}>
                <span style={{ color: T.crimson, marginRight: 8 }}>✦</span>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Social proof */}
      <section
        style={{
          padding: "36px 0",
          background: "#1a1610",
          borderBlock: `1px solid ${T.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 56,
            animation: "ticker 40s linear infinite",
            whiteSpace: "nowrap",
            fontFamily: T.fontDisplay,
            fontStyle: "italic",
            fontSize: 18,
            color: T.parchmentDim,
          }}
        >
          {[
            '"I should be in jail. Instead I am loved." — M., London',
            '"The gift arrived before my lie finished loading." — J., NYC',
            '"Chaotic good. My mum thinks I planned everything." — A., Leeds',
            '"I forgot our anniversary. Sir Alibi did not." — R., Berlin',
          ].map((q, i) => (
            <span key={i}>{q}</span>
          ))}
        </div>
      </section>

      {/* How it works — horizontal pin */}
      <section
        id="how"
        ref={howRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          background: T.bg,
          overflow: "hidden",
        }}
      >
        <h2
          style={{
            position: "absolute",
            top: 24,
            left: 28,
            zIndex: 2,
            fontFamily: T.fontDisplay,
            fontStyle: "italic",
            fontSize: 28,
            color: T.parchment,
            margin: 0,
          }}
        >
          How the ritual works
        </h2>
        <div
          ref={howTrackRef}
          style={{
            display: "flex",
            height: "100vh",
            alignItems: "center",
            gap: 0,
            paddingLeft: 28,
            width: "max-content",
          }}
        >
          {[
            {
              title: "Describe your crime",
              body: "Spill it. We don't judge — we optimise.",
              field: true,
            },
            {
              title: "Sir Alibi crafts your alibi",
              body: "Narrative, tone, plausibility — weaponised charm.",
              stream: true,
            },
            {
              title: "Gift ships within hours",
              body: "Real parcel. Real receipt. Real damage control.",
              gift: true,
            },
          ].map((p, idx) => (
            <div
              key={idx}
              style={{
                width: "100vw",
                maxWidth: "min(100vw, 1100px)",
                flexShrink: 0,
                padding: "100px 48px 80px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                borderRight: `1px solid ${T.border}`,
                minHeight: "70vh",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: "0.25em",
                  color: T.gold,
                  fontFamily: T.fontBody,
                  marginBottom: 12,
                }}
              >
                PANEL {idx + 1}
              </span>
              <h3
                style={{
                  fontFamily: T.fontDisplay,
                  fontStyle: "italic",
                  fontSize: 36,
                  color: T.parchment,
                  margin: "0 0 16px",
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: T.parchmentDim,
                  fontFamily: T.fontBody,
                  maxWidth: 420,
                  lineHeight: 1.65,
                }}
              >
                {p.body}
              </p>
              {p.field && (
                <input
                  readOnly
                  defaultValue="I said I'd bring dessert. I brought nothing."
                  style={{
                    marginTop: 24,
                    width: "100%",
                    maxWidth: 480,
                    padding: "14px 16px",
                    background: T.surface2,
                    border: `1px solid ${T.border}`,
                    borderRadius: T.radiusSm,
                    color: T.parchment,
                    fontFamily: T.fontBody,
                    fontSize: 14,
                  }}
                />
              )}
              {p.stream && (
                <div
                  style={{
                    marginTop: 24,
                    padding: 20,
                    background: "#0a0906",
                    border: `1px solid ${T.goldBorder}`,
                    borderRadius: T.radius,
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 12,
                    color: T.parchment,
                    maxWidth: 520,
                    lineHeight: 1.6,
                  }}
                >
                  {">"} generating plausible narrative…
                  <br />
                  {">"} tone: repentant-but-funny
                  <br />
                  {">"} alibi strength: 94%
                </div>
              )}
              {p.gift && (
                <div
                  style={{
                    marginTop: 24,
                    width: 120,
                    height: 120,
                    border: `2px dashed ${T.crimson}`,
                    borderRadius: T.radiusSm,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 42,
                  }}
                >
                  🎁
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      <section
        id="examples"
        ref={examplesRef}
        style={{
          padding: "100px 28px",
          background: `linear-gradient(180deg, ${T.bg} 0%, ${T.burgundy} 55%, ${T.bg} 100%)`,
        }}
      >
        <h2
          style={{
            fontFamily: T.fontDisplay,
            fontStyle: "italic",
            fontSize: 36,
            color: T.parchment,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          Alibis that should not work (but do)
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
            perspective: 1200,
          }}
        >
          {ALIBI_CARDS.map((c) => (
            <div
              key={c.title}
              className="alibi-card"
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusLg,
                padding: 28,
                transformStyle: "preserve-3d",
                boxShadow: T.shadow,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: T.crimson,
                  fontFamily: T.fontBody,
                  marginBottom: 10,
                }}
              >
                CASE FILE
              </div>
              <h3
                style={{
                  fontFamily: T.fontDisplay,
                  fontStyle: "italic",
                  fontSize: 22,
                  color: T.parchment,
                  margin: "0 0 12px",
                }}
              >
                {c.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: T.parchmentDim,
                  fontFamily: T.fontBody,
                  margin: 0,
                }}
              >
                {c.alibi}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Gift vault */}
      <section
        id="vault"
        style={{
          padding: "80px 0",
          background: T.bg,
          borderBlock: `1px solid ${T.border}`,
        }}
      >
        <h2
          style={{
            padding: "0 28px",
            fontFamily: T.fontDisplay,
            fontStyle: "italic",
            fontSize: 28,
            color: T.parchment,
            marginBottom: 28,
          }}
        >
          The gift vault
        </h2>
        <div
          style={{
            display: "flex",
            gap: 20,
            overflowX: "auto",
            padding: "0 28px 12px",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {GIFTS.map((g) => (
            <div
              key={g.name}
              style={{
                flex: "0 0 260px",
                scrollSnapAlign: "start",
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusLg,
                padding: 24,
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = T.shadowMd;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  height: 100,
                  background: `linear-gradient(145deg, ${T.surface2}, #0a0906)`,
                  borderRadius: T.radiusSm,
                  marginBottom: 16,
                  border: `1px solid ${T.border}`,
                }}
              />
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: T.parchment,
                  fontFamily: T.fontBody,
                  marginBottom: 6,
                }}
              >
                {g.name}
              </div>
              <div style={{ fontSize: 12, color: T.parchmentDim }}>{g.hint}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Web3 tier */}
      {web3On && (
        <section
          style={{
            padding: "100px 28px",
            background: "linear-gradient(180deg, #0a0806, #120a0c)",
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <div
            style={{
              maxWidth: 720,
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "6px 14px",
                border: `1px solid ${T.goldBorder}`,
                borderRadius: T.radiusFull,
                fontSize: 10,
                letterSpacing: "0.2em",
                color: T.gold,
                marginBottom: 16,
              }}
            >
              ON-CHAIN PROOF (VISUAL)
            </div>
            <h2
              style={{
                fontFamily: T.fontDisplay,
                fontStyle: "italic",
                fontSize: 34,
                color: T.parchment,
                margin: "0 0 12px",
              }}
            >
              Knight&apos;s Circle
            </h2>
            <p
              style={{
                color: T.parchmentDim,
                fontFamily: T.fontBody,
                fontSize: 15,
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              Mint each alibi as an &quot;proof-of-excuse&quot; NFT. Token-gated:
              unlimited alibis + priority gift routing.
            </p>
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  padding: "20px 24px",
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radius,
                  background: T.surface,
                  minWidth: 200,
                  opacity: walletConnected ? 1 : 0.45,
                }}
              >
                <div style={{ fontSize: 10, color: T.parchmentFaint, marginBottom: 8 }}>
                  STATUS
                </div>
                <div style={{ fontFamily: T.fontBody, color: T.parchment }}>
                  {walletConnected ? "Unlocked — Knight's Circle" : "Locked — connect wallet"}
                </div>
              </div>
            </div>
            <div
              style={{
                textAlign: "left",
                maxWidth: 560,
                margin: "0 auto",
                padding: 16,
                background: "#0a0a0a",
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusSm,
                fontFamily: "ui-monospace, monospace",
                fontSize: 11,
                color: "#8a8a8a",
                lineHeight: 1.6,
              }}
            >
              <div style={{ color: T.gold, marginBottom: 8 }}>Transaction Receipt</div>
              Tx Hash: 0x7f3…9a2e
              <br />
              To: GiftVault.sol — Flowers + Note
              <br />
              Status: Success · Block 18,402,991
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section
        id="pricing"
        style={{
          padding: "100px 28px",
          background: T.bg,
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontFamily: T.fontDisplay,
            fontStyle: "italic",
            fontSize: 36,
            color: T.parchment,
            marginBottom: 48,
          }}
        >
          Choose your rank
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          {[
            {
              name: "Squire",
              price: "Free",
              feats: ["3 alibis / mo", "Standard gifts", "Email support"],
            },
            {
              name: "Knight",
              price: "£12/mo",
              feats: ["Unlimited alibis", "Priority gifts", "SMS nudges"],
              highlight: true,
            },
            {
              name: "Sir",
              price: "£29/mo",
              feats: ["Everything in Knight", "Knight's Circle UI", "Concierge"],
            },
          ].map((tier) => (
            <div
              key={tier.name}
              style={{
                padding: 32,
                borderRadius: T.radiusLg,
                border: `1px solid ${tier.highlight ? T.gold : T.border}`,
                background: tier.highlight
                  ? "linear-gradient(165deg, rgba(201,168,76,0.08), rgba(14,12,8,0.95))"
                  : T.surface,
                boxShadow: tier.highlight ? T.shadowGold : "none",
              }}
            >
              <div
                style={{
                  fontFamily: T.fontDisplay,
                  fontStyle: "italic",
                  fontSize: 26,
                  color: T.parchment,
                  marginBottom: 8,
                }}
              >
                {tier.name}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: T.gold,
                  fontFamily: T.fontBody,
                  marginBottom: 20,
                }}
              >
                {tier.price}
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  color: T.parchmentDim,
                  fontFamily: T.fontBody,
                  fontSize: 14,
                  lineHeight: 1.9,
                }}
              >
                {tier.feats.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div style={{ marginTop: 24 }}>
                <MagneticButton
                  primary={!!tier.highlight}
                  onClick={onSummonKnight}
                >
                  {tier.highlight ? "Start Knight" : "Choose"}
                </MagneticButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA + footer */}
      <section
        ref={ctaRef}
        style={{
          position: "relative",
          minHeight: "90vh",
          padding: "80px 28px 48px",
          background: `radial-gradient(ellipse at 30% 20%, rgba(184,49,47,0.12), transparent 50%), ${T.bg}`,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            alignItems: "center",
            maxWidth: 1100,
            margin: "0 auto",
          }}
          className="cta-grid"
        >
          <div
            style={{ height: 400, position: "relative" }}
            onMouseEnter={() => setCtaKnightHover(true)}
            onMouseLeave={() => setCtaKnightHover(false)}
          >
            <KnightScene
              variant="victory"
              scrollProgress={1}
              ctaHover={ctaKnightHover}
            />
          </div>
          <div>
            <h2
              className="cta-headline"
              style={{
                fontFamily: T.fontDisplay,
                fontStyle: "italic",
                fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                color: T.parchment,
                lineHeight: 1.05,
                margin: "0 0 28px",
              }}
            >
              {"Don't get caught slipping."
                .split(" ")
                .map((w) => (
                  <span
                    key={w}
                    className="cta-word"
                    style={{ display: "block" }}
                  >
                    {w}
                  </span>
                ))}
            </h2>
            <MagneticButton
              primary
              onClick={() => {
                fireConfetti();
                onSummonKnight();
              }}
            >
              Summon Sir Alibi
            </MagneticButton>
          </div>
        </div>

        <footer
          style={{
            marginTop: 80,
            paddingTop: 40,
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 24,
            maxWidth: 1100,
            marginLeft: "auto",
            marginRight: "auto",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: T.fontDisplay,
              fontStyle: "italic",
              fontSize: 22,
              color: T.parchment,
            }}
          >
            Sir Alibi
          </div>
          <div style={{ fontSize: 12, color: T.parchmentDim, fontFamily: T.fontBody }}>
            © {new Date().getFullYear()} Sir Alibi. Not legal advice. Obviously.
          </div>
          {userEmail && (
            <span style={{ fontSize: 12, color: T.parchmentDim }}>{userEmail}</span>
          )}
          <div style={{ display: "flex", gap: 12 }}>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={onLogout}
                style={{
                  background: "none",
                  border: `1px solid ${T.border}`,
                  color: T.parchmentDim,
                  padding: "8px 14px",
                  borderRadius: T.radiusSm,
                  cursor: "pointer",
                  fontFamily: T.fontBody,
                  fontSize: 12,
                }}
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                style={{
                  background: T.goldLight,
                  border: `1px solid ${T.goldBorder}`,
                  color: T.gold,
                  padding: "8px 14px",
                  borderRadius: T.radiusSm,
                  cursor: "pointer",
                  fontFamily: T.fontBody,
                  fontSize: 12,
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </footer>
      </section>
      <style>{`
        @media (max-width: 899px) {
          .hero-section {
            grid-template-columns: 1fr !important;
            padding-top: 88px !important;
          }
          .cta-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
