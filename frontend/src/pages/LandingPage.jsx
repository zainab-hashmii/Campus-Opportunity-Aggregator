import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ── Slideshow data ──────────────────────────────────────────────────────────
const SLIDES = [
    {
        image:   'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
        badge:   'Internships & Industry Experience',
        tagline: 'Google, Microsoft, Careem & 20+ top employers — actively recruiting NUST students right now.',
    },
    {
        image:   'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1920&q=80',
        badge:   'Hackathons & Competitions',
        tagline: 'Win up to PKR 500,000 in prizes — and the portfolio, skills, and network to match.',
    },
    {
        image:   'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80',
        badge:   'Scholarships & Fellowships',
        tagline: 'Fully-funded seats at TU Munich, Kyoto & Oxford — waiting for Pakistan\'s most driven students.',
    },
    {
        image:   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=80',
        badge:   'Career Fairs & Networking',
        tagline: 'Skip the cold emails. Meet hiring managers from 50+ companies — at a single verified listing.',
    },
    {
        image:   'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
        badge:   'Research & Innovation',
        tagline: 'Get paid to publish. Join NUST labs, UNESCO grants & international research teams.',
    },
    {
        image:   'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1920&q=80',
        badge:   'Exchange Programs & Study Abroad',
        tagline: 'One semester in Germany, Japan, or Korea — with a scholarship that covers everything.',
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
    function prev()   { goTo((slide - 1 + SLIDES.length) % SLIDES.length); }
    function next()   { goTo((slide + 1) % SLIDES.length); }

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
                    background: 'linear-gradient(105deg, rgba(17,27,52,0.94) 0%, rgba(20,32,64,0.82) 55%, rgba(20,32,64,0.55) 100%)',
                    zIndex: 1,
                }} />

                {/* ── Subtle grid overlay ── */}
                <div className="hero-grid" style={{ zIndex: 2 }} />

                {/* ── Floating ambient shapes ── */}
                <div className="hero-shape hero-shape-1" style={{ zIndex: 2 }} />
                <div className="hero-shape hero-shape-2" style={{ zIndex: 2 }} />
                <div className="hero-shape hero-shape-3" style={{ zIndex: 2 }} />

                {/* ── LEFT ARROW ── */}
                <button
                    onClick={prev}
                    aria-label="Previous slide"
                    style={{
                        position: 'absolute', left: 20, top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        width: 46, height: 46, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.10)',
                        border: '1px solid rgba(255,255,255,0.22)',
                        color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(8px)',
                        fontSize: '1.3rem', fontWeight: 300,
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.20)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
                >
                    ‹
                </button>

                {/* ── RIGHT ARROW ── */}
                <button
                    onClick={next}
                    aria-label="Next slide"
                    style={{
                        position: 'absolute', right: 20, top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        width: 46, height: 46, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.10)',
                        border: '1px solid rgba(255,255,255,0.22)',
                        color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(8px)',
                        fontSize: '1.3rem', fontWeight: 300,
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.20)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
                >
                    ›
                </button>

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
                                background: 'rgba(245,158,11,0.14)',
                                border: '1px solid rgba(245,158,11,0.30)',
                                borderRadius: 100, padding: '6px 16px',
                                marginBottom: 28,
                            }}>
                                <span className="pulse-dot" style={{
                                    width: 7, height: 7, borderRadius: '50%',
                                    background: '#fbbf24', display: 'block', flexShrink: 0,
                                }} />
                                <span style={{
                                    fontSize: '0.72rem', color: '#fbbf24',
                                    fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase',
                                }}>
                                    {SLIDES[slide].badge}
                                </span>
                            </div>
                        </div>

                        {/* Static headline */}
                        <h1 className="fade-up fade-up-delay-1" style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 'clamp(2.2rem, 5vw, 3.9rem)',
                            fontWeight: 700,
                            color: '#ffffff',
                            lineHeight: 1.14,
                            marginBottom: 20,
                            letterSpacing: '-0.01em',
                        }}>
                            Your All-in-One Hub<br />
                            <span style={{
                                background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
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
                            color: 'rgba(251,191,36,0.75)',
                            fontSize: '0.88rem', fontWeight: 500,
                            marginBottom: 34, fontStyle: 'italic',
                            opacity: textVisible ? 1 : 0,
                            transition: 'opacity 0.55s ease 0.1s',
                        }}>
                            {SLIDES[slide].tagline}
                        </p>

                        {/* CTAs */}
                        <div className="fade-up fade-up-delay-3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 44 }}>
                            <Link to="/opportunities" style={{
                                background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                                color: '#fff', padding: '13px 30px', borderRadius: 10,
                                fontWeight: 700, fontSize: '0.93rem', textDecoration: 'none',
                                boxShadow: '0 4px 18px rgba(79,70,229,0.42)', display: 'inline-block',
                            }}>
                                Explore Opportunities →
                            </Link>
                            <Link to="/register" style={{
                                background: 'rgba(255,255,255,0.09)', color: '#fff',
                                padding: '13px 30px', borderRadius: 10,
                                fontWeight: 600, fontSize: '0.93rem', textDecoration: 'none',
                                border: '1px solid rgba(255,255,255,0.20)',
                                backdropFilter: 'blur(8px)', display: 'inline-block',
                            }}>
                                Create Free Account
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="fade-up fade-up-delay-4" style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
                            {['100+ Opportunities', 'Free to Join', 'NUST Exclusive'].map(badge => (
                                <div key={badge} style={{
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    color: 'rgba(255,255,255,0.42)', fontSize: '0.8rem',
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <circle cx="7" cy="7" r="7" fill="rgba(251,191,36,0.18)" />
                                        <path d="M4 7l2 2 4-4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                                width:  i === slide ? 28 : 8,
                                height: 8,
                                borderRadius: 4,
                                background: i === slide ? '#fbbf24' : 'rgba(255,255,255,0.30)',
                                border: 'none', cursor: 'pointer', padding: 0,
                                transition: 'all 0.35s ease',
                                flexShrink: 0,
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
                            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                            animation: `slideProgress ${SLIDE_DURATION}ms linear forwards`,
                        }}
                    />
                </div>
            </section>

            {/* ═══════════════════════════ STATS ═══════════════════════════ */}
            <section ref={statsRef} style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
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
                                    fontSize: '2.7rem', fontWeight: 700, color: '#1e2a4a', lineHeight: 1,
                                }}>
                                    <Counter target={stat.value} suffix={stat.suffix} visible={statsVisible} />
                                </div>
                                <div style={{ color: '#9ca3af', fontSize: '0.82rem', marginTop: 9, fontWeight: 500 }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ CATEGORIES ═══════════════════════════ */}
            <section ref={catRef} style={{ background: '#f9fafb', padding: '84px 0' }}>
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
                                    fontSize: '0.7rem', fontWeight: 700, color: '#fbbf24',
                                    letterSpacing: '0.08em', marginBottom: 14, textTransform: 'uppercase',
                                }}>
                                    Step {step.num}
                                </div>
                                <div style={{
                                    width: 58, height: 58, borderRadius: 15,
                                    background: 'linear-gradient(135deg, #1e2a4a, #2d3d6e)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 28, marginBottom: 20,
                                    boxShadow: '0 6px 20px rgba(30,42,74,0.22)',
                                }}>
                                    {step.icon}
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1f36', marginBottom: 9 }}>
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
                background: 'linear-gradient(135deg, #1a2540 0%, #2d3d6e 100%)',
                padding: '80px 24px', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -90, right: -90, width: 320, height: 320, borderRadius: '50%', background: 'rgba(245,158,11,0.06)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -70, left: '18%', width: 220, height: 220, borderRadius: '50%', background: 'rgba(79,70,229,0.09)', pointerEvents: 'none' }} />
                <div className="max-w-3xl mx-auto text-center" style={{
                    position: 'relative', zIndex: 1,
                    opacity: ctaVisible ? 1 : 0,
                    transform: ctaVisible ? 'translateY(0)' : 'translateY(22px)',
                    transition: 'opacity 0.6s ease, transform 0.6s ease',
                }}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)',
                        fontWeight: 700, color: '#ffffff', lineHeight: 1.22, marginBottom: 16,
                    }}>
                        Start Discovering<br />
                        <span style={{ color: '#fbbf24' }}>Your Next Opportunity</span>
                    </h2>
                    <p style={{
                        color: 'rgba(255,255,255,0.52)', fontSize: '0.98rem',
                        lineHeight: 1.7, maxWidth: 440, margin: '0 auto 38px',
                    }}>
                        Join hundreds of NUST students already leveraging campus opportunities to accelerate their academic and professional journey.
                    </p>
                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" style={{
                            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                            color: '#1e2a4a', padding: '14px 34px', borderRadius: 10,
                            fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
                            boxShadow: '0 4px 18px rgba(245,158,11,0.38)', display: 'inline-block',
                        }}>
                            Create Free Account
                        </Link>
                        <Link to="/opportunities" style={{
                            background: 'transparent', color: 'rgba(255,255,255,0.78)',
                            padding: '14px 34px', borderRadius: 10,
                            fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
                            border: '1px solid rgba(255,255,255,0.22)', display: 'inline-block',
                        }}>
                            Browse Without Signing Up
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ FOOTER ═══════════════════════════ */}
            <footer style={{ background: '#111827', padding: '26px 24px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.8rem', margin: 0 }}>
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
                textTransform: 'uppercase', color: '#f59e0b',
                fontWeight: 600, marginBottom: 10,
            }}>{eyebrow}</p>
            <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.6rem, 3vw, 2.3rem)',
                fontWeight: 700, color: '#1e2a4a', marginBottom: 13,
            }}>{title}</h2>
            <p style={{
                color: '#6b7280', fontSize: '0.95rem',
                maxWidth: 490, margin: '0 auto', lineHeight: 1.65,
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
