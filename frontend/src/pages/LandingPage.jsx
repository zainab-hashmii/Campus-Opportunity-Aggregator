import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ── Slideshow data ──────────────────────────────────────────────────────────
const SLIDES = [
    {
        image:   'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80',
        badge:   'World-Class Universities',
        label:   'Stanford University, USA',
        tagline: 'Research fellowships, exchange programs & summer schools at Stanford, MIT & Caltech — open to NUST students.',
    },
    {
        image:   'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=1920&q=80',
        badge:   'Internships at Tech Giants',
        label:   'Google · Microsoft · Meta',
        tagline: 'Google, Microsoft, Meta & 20+ world-leading tech companies actively recruiting NUST students right now.',
    },
    {
        image:   'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80',
        badge:   'Prestigious Scholarships',
        label:   'University of Oxford, UK',
        tagline: 'Fully-funded Oxford, Cambridge & TU Munich seats — exclusively for Pakistan\'s brightest students.',
    },
    {
        image:   'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
        badge:   'Ivy League Opportunities',
        label:   'Harvard University, USA',
        tagline: 'Harvard summer schools, research attachments & Ivy League leadership programs — apply before seats run out.',
    },
    {
        image:   'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1920&q=80',
        badge:   'Corporate & Industry Exposure',
        label:   'Amazon · McKinsey · Careem',
        tagline: 'Fortune 500 companies & top local employers recruiting NUST talent — all in one verified listing.',
    },
    {
        image:   'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80',
        badge:   'Hackathons & Competitions',
        label:   'Build · Compete · Win',
        tagline: 'Win up to PKR 500,000 in prizes — and the portfolio, network, and career momentum to match.',
    },
];

const SLIDE_DURATION = 4500; // ms

// ── Scroll-visibility hook ──────────────────────────────────────────────────
function useVisible(threshold = 0.15) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

// ── Animated counter ────────────────────────────────────────────────────────
function Counter({ target, suffix = '', visible }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!visible) return;
        const steps = 60;
        const inc   = target / steps;
        let cur     = 0;
        const timer = setInterval(() => {
            cur += inc;
            if (cur >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(cur));
        }, 1800 / steps);
        return () => clearInterval(timer);
    }, [visible, target]);
    return <>{count}{suffix}</>;
}

// ── Static data ─────────────────────────────────────────────────────────────
// IDs match backend/config/constants.js exactly
const CATEGORIES = [
    { id: 1, icon: '💼', name: 'Internships',       desc: 'Industry exposure and professional growth at top companies',   color: '#4f46e5', bg: '#eef2ff' },
    { id: 2, icon: '🎓', name: 'Scholarships',      desc: 'Financial support, fellowships, and merit-based awards',       color: '#059669', bg: '#ecfdf5' },
    { id: 3, icon: '💡', name: 'Hackathons',        desc: 'Compete, innovate, and build real-world solutions in 48 hrs',  color: '#d97706', bg: '#fffbeb' },
    { id: 4, icon: '🔬', name: 'Research',          desc: 'Collaborate with faculty on cutting-edge academic projects',   color: '#7c3aed', bg: '#f5f3ff' },
    { id: 5, icon: '📚', name: 'Courses',           desc: 'Bootcamps and certifications to sharpen your skill set',       color: '#dc2626', bg: '#fef2f2' },
    { id: 6, icon: '🌐', name: 'Exchange Programs', desc: 'Study abroad experiences and global exposure initiatives',     color: '#0891b2', bg: '#f0f9ff' },
    { id: 7, icon: '🏆', name: 'Competitions',      desc: 'Local and international contests with prizes and recognition', color: '#b45309', bg: '#fef3c7' },
    { id: 8, icon: '🛠️', name: 'Workshops',        desc: 'Hands-on sessions to build practical, in-demand skills',       color: '#0f766e', bg: '#f0fdfa' },
];

const STATS = [
    { value: 100, suffix: '+', label: 'Active Opportunities' },
    { value: 6,   suffix: '',  label: 'Departments' },
    { value: 8,   suffix: '',  label: 'Opportunity Types' },
    { value: 500, suffix: '+', label: 'Students Enrolled' },
];

const STEPS = [
    { num: '01', icon: '🔍', title: 'Browse & Filter',  desc: 'Explore curated opportunities filtered by your department, category, mode, and preferences.' },
    { num: '02', icon: '🔖', title: 'Save & Track',     desc: 'Bookmark listings and receive timely notifications before application deadlines close.' },
    { num: '03', icon: '✉️', title: 'Apply with Ease', desc: 'Submit your application directly through the platform and track it in one place.' },
];

// ── Main component ──────────────────────────────────────────────────────────
export default function LandingPage() {
    // Slideshow state
    const [slide, setSlide]           = useState(0);
    const [textVisible, setTextVisible] = useState(true);
    const timerRef = useRef(null);

    function resetTimer() {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(
            () => setSlide(s => (s + 1) % SLIDES.length),
            SLIDE_DURATION
        );
    }

    useEffect(() => {
        resetTimer();
        return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Briefly hide text so it fades in with each slide change
    useEffect(() => {
        setTextVisible(false);
        const t = setTimeout(() => setTextVisible(true), 500);
        return () => clearTimeout(t);
    }, [slide]);

    function goTo(i)  { setSlide(i); resetTimer(); }

    // Scroll-section hooks
    const [statsRef,  statsVisible]  = useVisible(0.2);
    const [catRef,    catVisible]    = useVisible(0.1);
    const [stepsRef,  stepsVisible]  = useVisible(0.1);
    const [ctaRef,    ctaVisible]    = useVisible(0.2);

    return (
        <div style={{ overflowX: 'hidden' }}>

            {/* ═══════════════════════════ HERO SLIDESHOW ═══════════════════════════ */}
            <section style={{
                position: 'relative',
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
            }}>
                {/* ── Background image layers (cross-fade) ── */}
                {SLIDES.map((s, i) => (
                    <div key={i} style={{
                        position: 'absolute', inset: 0,
                        backgroundImage:    `url(${s.image})`,
                        backgroundSize:     'cover',
                        backgroundPosition: 'center',
                        opacity:    i === slide ? 1 : 0,
                        transition: 'opacity 1.3s ease-in-out',
                        zIndex: 0,
                    }} />
                ))}

                {/* ── Dark gradient overlay ── */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(105deg, rgba(15,14,43,0.96) 0%, rgba(30,27,75,0.86) 55%, rgba(49,46,129,0.60) 100%)',
                    zIndex: 1,
                }} />

                {/* ── Subtle grid overlay ── */}
                <div className="hero-grid" style={{ zIndex: 2 }} />

                {/* ── Floating ambient shapes ── */}
                <div className="hero-shape hero-shape-1" style={{ zIndex: 2 }} />
                <div className="hero-shape hero-shape-2" style={{ zIndex: 2 }} />
                <div className="hero-shape hero-shape-3" style={{ zIndex: 2 }} />

                {/* ── HERO CONTENT ── */}
                <div className="max-w-7xl mx-auto px-6 w-full" style={{
                    position: 'relative', zIndex: 3,
                    paddingTop: 56, paddingBottom: 100,
                }}>
                    <div style={{ maxWidth: 680 }}>

                        {/* Animated badge — changes per slide */}
                        <div style={{
                            opacity: textVisible ? 1 : 0,
                            transform: textVisible ? 'translateY(0)' : 'translateY(10px)',
                            transition: 'opacity 0.55s ease, transform 0.55s ease',
                        }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'rgba(167,139,250,0.15)',
                                border: '1px solid rgba(167,139,250,0.32)',
                                borderRadius: 100, padding: '6px 16px',
                                marginBottom: 14,
                            }}>
                                <span className="pulse-dot" style={{
                                    width: 7, height: 7, borderRadius: '50%',
                                    background: '#a78bfa', display: 'block', flexShrink: 0,
                                }} />
                                <span style={{
                                    fontSize: '0.72rem', color: '#a78bfa',
                                    fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase',
                                }}>
                                    {SLIDES[slide].badge}
                                </span>
                            </div>
                            <div style={{
                                fontSize: '0.88rem', color: 'rgba(245,158,11,0.90)',
                                fontWeight: 700, letterSpacing: '0.04em',
                                marginBottom: 20,
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                <span style={{ color: '#fbbf24', fontSize: '1rem' }}>🏛</span>
                                {SLIDES[slide].label}
                            </div>
                        </div>

                        {/* Static headline */}
                        <h1 className="fade-up fade-up-delay-1" style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 'clamp(2.3rem, 5.2vw, 4.1rem)',
                            fontWeight: 800,
                            color: '#ffffff',
                            lineHeight: 1.12,
                            marginBottom: 20,
                            letterSpacing: '-0.02em',
                        }}>
                            Your All-in-One Hub<br />
                            <span style={{
                                background: 'linear-gradient(90deg, #a78bfa 0%, #fbbf24 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                for Campus Opportunities
                            </span>
                        </h1>

                        {/* Static subtitle */}
                        <p className="fade-up fade-up-delay-2" style={{
                            color: 'rgba(255,255,255,0.57)',
                            fontSize: '1.02rem', lineHeight: 1.78,
                            maxWidth: 520, marginBottom: 10,
                        }}>
                            100+ verified internships, scholarships, hackathons & research positions —
                            updated regularly and curated exclusively for NUST's most driven students.
                        </p>

                        {/* Dynamic tagline — changes per slide */}
                        <p style={{
                            color: 'rgba(196,181,253,0.85)',
                            fontSize: '0.92rem', fontWeight: 500,
                            marginBottom: 34, fontStyle: 'italic',
                            opacity: textVisible ? 1 : 0,
                            transition: 'opacity 0.55s ease 0.1s',
                        }}>
                            {SLIDES[slide].tagline}
                        </p>

                        {/* CTAs */}
                        <div className="fade-up fade-up-delay-3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 44 }}>
                            <Link to="/opportunities" style={{
                                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                color: '#fff', padding: '13px 32px', borderRadius: 12,
                                fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
                                boxShadow: '0 4px 20px rgba(124,58,237,0.50)', display: 'inline-block',
                                letterSpacing: '0.01em',
                            }}>
                                Explore Opportunities →
                            </Link>
                            <Link to="/register" style={{
                                background: 'rgba(255,255,255,0.09)', color: '#fff',
                                padding: '13px 32px', borderRadius: 12,
                                fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
                                border: '1px solid rgba(167,139,250,0.30)',
                                backdropFilter: 'blur(10px)', display: 'inline-block',
                            }}>
                                Create Free Account
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="fade-up fade-up-delay-4" style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
                            {['100+ Opportunities', 'Free to Join', 'NUST Exclusive'].map(badge => (
                                <div key={badge} style={{
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem',
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <circle cx="7" cy="7" r="7" fill="rgba(167,139,250,0.20)" />
                                        <path d="M4 7l2 2 4-4" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {badge}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── NAVIGATION DOTS ── */}
                <div style={{
                    position: 'absolute', bottom: 44,
                    left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    zIndex: 10,
                }}>
                    {SLIDES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            style={{
                                width:  i === slide ? 32 : 8,
                                height: 8,
                                borderRadius: 4,
                                background: i === slide
                                    ? 'linear-gradient(90deg, #a78bfa, #7c3aed)'
                                    : 'rgba(255,255,255,0.28)',
                                border: 'none', cursor: 'pointer', padding: 0,
                                transition: 'all 0.35s ease',
                                flexShrink: 0,
                                boxShadow: i === slide ? '0 0 10px rgba(167,139,250,0.5)' : 'none',
                            }}
                        />
                    ))}
                </div>

                {/* ── SCROLL INDICATOR ── */}
                <div className="scroll-indicator" style={{ zIndex: 10 }}>
                    <div className="scroll-dot" />
                </div>

                {/* ── SLIDE COUNTER (top-right) ── */}
                <div style={{
                    position: 'absolute', top: 24, right: 24,
                    zIndex: 10, color: 'rgba(255,255,255,0.35)',
                    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em',
                }}>
                    {String(slide + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
                </div>

                {/* ── PROGRESS BAR ── */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: 2, background: 'rgba(255,255,255,0.10)', zIndex: 10,
                }}>
                    <div
                        key={slide}
                        style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #7c3aed, #a78bfa, #fbbf24)',
                            animation: `slideProgress ${SLIDE_DURATION}ms linear forwards`,
                        }}
                    />
                </div>
            </section>

            {/* ═══════════════════════════ STATS ═══════════════════════════ */}
            <section ref={statsRef} style={{
                background: 'linear-gradient(135deg, #0f0e2b 0%, #1e1b4b 100%)',
                borderBottom: '1px solid rgba(167,139,250,0.15)',
            }}>
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32 }}>
                        {STATS.map((stat, i) => (
                            <div key={stat.label} style={{
                                textAlign: 'center',
                                opacity:   statsVisible ? 1 : 0,
                                transform: statsVisible ? 'translateY(0)' : 'translateY(20px)',
                                transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
                            }}>
                                <div style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '2.9rem', fontWeight: 800,
                                    background: 'linear-gradient(135deg, #a78bfa, #fbbf24)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    lineHeight: 1,
                                }}>
                                    <Counter target={stat.value} suffix={stat.suffix} visible={statsVisible} />
                                </div>
                                <div style={{ color: 'rgba(196,181,253,0.70)', fontSize: '0.83rem', marginTop: 10, fontWeight: 500 }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ CATEGORIES ═══════════════════════════ */}
            <section ref={catRef} style={{ background: '#f5f3ff', padding: '84px 0' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <SectionHeader
                        eyebrow="What We Offer"
                        title="Opportunities Across All Fields"
                        body="From technical internships to international exchange programs, we aggregate every opportunity available to NUST students."
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
                        {CATEGORIES.map((cat, i) => (
                            <CategoryCard key={cat.name} cat={cat} visible={catVisible} delay={i * 0.08} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ HOW IT WORKS ═══════════════════════════ */}
            <section ref={stepsRef} style={{ background: '#ffffff', padding: '84px 0' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <SectionHeader
                        eyebrow="Simple Process"
                        title="How It Works"
                        body="Getting started takes less than two minutes. Three simple steps to unlock your campus opportunities."
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 36 }}>
                        {STEPS.map((step, i) => (
                            <div key={step.num} style={{
                                opacity:   stepsVisible ? 1 : 0,
                                transform: stepsVisible ? 'translateY(0)' : 'translateY(28px)',
                                transition: `opacity 0.55s ease ${i * 0.15}s, transform 0.55s ease ${i * 0.15}s`,
                            }}>
                                <div style={{
                                    fontSize: '0.7rem', fontWeight: 700, color: '#7c3aed',
                                    letterSpacing: '0.08em', marginBottom: 14, textTransform: 'uppercase',
                                }}>
                                    Step {step.num}
                                </div>
                                <div style={{
                                    width: 62, height: 62, borderRadius: 16,
                                    background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 28, marginBottom: 20,
                                    boxShadow: '0 8px 24px rgba(109,40,217,0.30)',
                                }}>
                                    {step.icon}
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: '1.07rem', color: '#1a1035', marginBottom: 9 }}>
                                    {step.title}
                                </h3>
                                <p style={{ fontSize: '0.87rem', color: '#6b7280', lineHeight: 1.68 }}>
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ CTA BANNER ═══════════════════════════ */}
            <section ref={ctaRef} style={{
                background: 'linear-gradient(135deg, #0f0e2b 0%, #1e1b4b 50%, #312e81 100%)',
                padding: '90px 24px', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -100, right: -100, width: 380, height: 380, borderRadius: '50%', background: 'rgba(167,139,250,0.07)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -80, left: '18%', width: 260, height: 260, borderRadius: '50%', background: 'rgba(245,158,11,0.06)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '40%', right: '25%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(124,58,237,0.08)', pointerEvents: 'none' }} />
                <div className="max-w-3xl mx-auto text-center" style={{
                    position: 'relative', zIndex: 1,
                    opacity: ctaVisible ? 1 : 0,
                    transform: ctaVisible ? 'translateY(0)' : 'translateY(22px)',
                    transition: 'opacity 0.6s ease, transform 0.6s ease',
                }}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                        fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginBottom: 16,
                    }}>
                        Start Discovering<br />
                        <span style={{
                            background: 'linear-gradient(90deg, #a78bfa, #fbbf24)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>Your Next Opportunity</span>
                    </h2>
                    <p style={{
                        color: 'rgba(196,181,253,0.70)', fontSize: '0.98rem',
                        lineHeight: 1.7, maxWidth: 440, margin: '0 auto 42px',
                    }}>
                        Join hundreds of NUST students already leveraging campus opportunities to accelerate their academic and professional journey.
                    </p>
                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" style={{
                            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            color: '#ffffff', padding: '14px 36px', borderRadius: 12,
                            fontWeight: 700, fontSize: '0.96rem', textDecoration: 'none',
                            boxShadow: '0 4px 22px rgba(124,58,237,0.50)', display: 'inline-block',
                        }}>
                            Create Free Account
                        </Link>
                        <Link to="/opportunities" style={{
                            background: 'transparent', color: 'rgba(196,181,253,0.85)',
                            padding: '14px 36px', borderRadius: 12,
                            fontWeight: 600, fontSize: '0.96rem', textDecoration: 'none',
                            border: '1px solid rgba(167,139,250,0.28)', display: 'inline-block',
                        }}>
                            Browse Without Signing Up
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ FOOTER ═══════════════════════════ */}
            <footer style={{
                background: '#09091f',
                padding: '28px 24px', textAlign: 'center',
                borderTop: '1px solid rgba(167,139,250,0.10)',
            }}>
                <p style={{ color: 'rgba(196,181,253,0.30)', fontSize: '0.8rem', margin: 0 }}>
                    © 2025 Campus Opportunity Aggregator &nbsp;·&nbsp; NUST &nbsp;·&nbsp; All rights reserved
                </p>
            </footer>
        </div>
    );
}

// ── Sub-components ──────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, body }) {
    return (
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <p style={{
                fontSize: '0.72rem', letterSpacing: '0.13em',
                textTransform: 'uppercase', color: '#7c3aed',
                fontWeight: 700, marginBottom: 10,
            }}>{eyebrow}</p>
            <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.7rem, 3vw, 2.4rem)',
                fontWeight: 800, color: '#1a1035', marginBottom: 14,
            }}>{title}</h2>
            <p style={{
                color: '#6b7280', fontSize: '0.96rem',
                maxWidth: 490, margin: '0 auto', lineHeight: 1.68,
            }}>{body}</p>
        </div>
    );
}

function CategoryCard({ cat, visible, delay }) {
    const [hovered, setHovered] = useState(false);
    const navigate = useNavigate();

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/opportunities?category_id=${cat.id}`)}
            onKeyDown={e => e.key === 'Enter' && navigate(`/opportunities?category_id=${cat.id}`)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: '#ffffff',
                border: `1px solid ${hovered ? cat.color : '#e5e7eb'}`,
                borderRadius: 16, padding: '28px 24px', cursor: 'pointer',
                opacity:   visible ? 1 : 0,
                transform: visible ? (hovered ? 'translateY(-6px)' : 'translateY(0)') : 'translateY(26px)',
                transition: `opacity 0.5s ease ${delay}s, transform 0.25s ease, border-color 0.2s, box-shadow 0.25s`,
                boxShadow: hovered ? `0 12px 36px rgba(0,0,0,0.12), 0 0 0 1px ${cat.color}22` : '0 1px 4px rgba(0,0,0,0.04)',
                textDecoration: 'none',
                userSelect: 'none',
            }}
        >
            <div style={{
                width: 50, height: 50, borderRadius: 12,
                background: hovered ? cat.bg : '#f9fafb',
                border: `1px solid ${hovered ? cat.color + '40' : '#e5e7eb'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 16, transition: 'background 0.2s, border-color 0.2s',
            }}>
                {cat.icon}
            </div>
            <h3 style={{
                fontWeight: 700, fontSize: '0.97rem',
                color: hovered ? cat.color : '#1a1f36',
                marginBottom: 7, transition: 'color 0.2s',
            }}>
                {cat.name}
                <span style={{
                    marginLeft: 6, fontSize: '0.75rem', opacity: hovered ? 0.7 : 0,
                    transition: 'opacity 0.2s',
                }}>→</span>
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#6b7280', lineHeight: 1.62, margin: 0 }}>
                {cat.desc}
            </p>
        </div>
    );
}
