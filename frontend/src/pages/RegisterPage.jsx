import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const BENEFITS = [
    { icon: '💼', text: 'Access 100+ curated opportunities' },
    { icon: '🔔', text: 'Get notified before deadlines' },
    { icon: '🔖', text: 'Save and track your favorites' },
    { icon: '🎓', text: 'Tailored to your department' },
];

const DEPARTMENTS = [
    { value: '1', label: 'Computer Science' },
    { value: '2', label: 'Business Administration' },
    { value: '3', label: 'Electrical Engineering' },
    { value: '4', label: 'Media Studies' },
    { value: '5', label: 'Mathematics' },
    { value: '6', label: 'Psychology' },
];

export default function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ user_name: '', email: '', password: '', confirm: '', dept_id: '' });
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (form.password !== form.confirm) {
            setError('Passwords do not match.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: form.user_name,
                    email: form.email,
                    password: form.password,
                    dept_id: form.dept_id,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Registration failed.');
                setLoading(false);
                return;
            }
            setSuccess(data.message || 'Account created! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch {
            setError('Could not connect to the server. Please try again.');
            setLoading(false);
        }
    };

    const passwordStrength = (() => {
        const p = form.password;
        if (!p) return null;
        if (p.length < 6) return { label: 'Too short', color: '#ef4444', width: '25%' };
        if (p.length < 8) return { label: 'Weak',      color: '#f97316', width: '45%' };
        if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: 'Strong', color: '#059669', width: '100%' };
        return { label: 'Fair', color: '#f59e0b', width: '68%' };
    })();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f4f0' }}>

            {/* ── Left panel (branding) ── */}
            <div className="hidden lg:flex" style={{
                width: 420, flexShrink: 0,
                background: 'linear-gradient(160deg, #1a2540 0%, #2d3d6e 60%, #1e3a5f 100%)',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '44px 44px 40px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(245,158,11,0.07)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -60, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(79,70,229,0.10)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 52 }}>
                        <div style={{
                            width: 38, height: 38,
                            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                            borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, boxShadow: '0 2px 10px rgba(245,158,11,0.4)',
                        }}>🎓</div>
                        <div>
                            <div style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}>
                                Campus Opportunities
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: 2 }}>
                                NUST Portal
                            </div>
                        </div>
                    </Link>

                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.75rem', fontWeight: 700,
                        color: '#ffffff', lineHeight: 1.25, marginBottom: 12,
                    }}>
                        Join your campus<br />opportunity network
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: 36 }}>
                        Create a free account and get access to every opportunity available at NUST, all in one place.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {BENEFITS.map(b => (
                            <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: 9,
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 16, flexShrink: 0,
                                }}>{b.icon}</div>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>{b.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom quote */}
                <div style={{
                    position: 'relative', zIndex: 1,
                    borderTop: '1px solid rgba(255,255,255,0.10)',
                    paddingTop: 24,
                }}>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', lineHeight: 1.6, margin: 0 }}>
                        "The platform that connects NUST students with opportunities they deserve."
                    </p>
                </div>
            </div>

            {/* ── Right panel (form) ── */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '40px 24px',
            }}>
                <div style={{
                    background: '#ffffff',
                    borderRadius: 20,
                    boxShadow: '0 4px 32px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
                    padding: '40px 38px',
                    width: '100%',
                    maxWidth: 440,
                    border: '1px solid #e5e7eb',
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '1.65rem', fontWeight: 700,
                            color: '#1a1f36', marginBottom: 6,
                        }}>
                            Create your account
                        </h1>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                            Fill in the details below to get started
                        </p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div style={{
                            background: '#fef2f2', border: '1px solid #fecaca',
                            color: '#dc2626', borderRadius: 10,
                            padding: '11px 14px', fontSize: '0.85rem',
                            marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 8,
                        }}>
                            <span style={{ flexShrink: 0 }}>⚠️</span> {error}
                        </div>
                    )}
                    {success && (
                        <div style={{
                            background: '#f0fdf4', border: '1px solid #bbf7d0',
                            color: '#15803d', borderRadius: 10,
                            padding: '11px 14px', fontSize: '0.85rem',
                            marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 8,
                        }}>
                            <span style={{ flexShrink: 0 }}>✅</span> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {/* Username */}
                        <FormField label="Username">
                            <input
                                type="text" name="user_name"
                                value={form.user_name} onChange={handleChange}
                                required placeholder="e.g. zainab_hashmi"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                            />
                        </FormField>

                        {/* Email */}
                        <FormField label="University Email">
                            <input
                                type="email" name="email"
                                value={form.email} onChange={handleChange}
                                required placeholder="example@gmail.com"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                            />
                        </FormField>

                        {/* Department */}
                        <FormField label="Department">
                            <select
                                name="dept_id" value={form.dept_id}
                                onChange={handleChange} required
                                style={{ ...inputStyle, cursor: 'pointer', color: form.dept_id ? '#1a1f36' : '#9ca3af' }}
                                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                            >
                                <option value="" disabled>Select your department</option>
                                {DEPARTMENTS.map(d => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </FormField>

                        {/* Password */}
                        <FormField label="Password">
                            <input
                                type="password" name="password"
                                value={form.password} onChange={handleChange}
                                required placeholder="Min. 6 characters"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                            />
                            {passwordStrength && (
                                <div style={{ marginTop: 7 }}>
                                    <div style={{ height: 3, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', width: passwordStrength.width,
                                            background: passwordStrength.color,
                                            borderRadius: 99,
                                            transition: 'width 0.3s ease, background 0.3s ease',
                                        }} />
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: passwordStrength.color, marginTop: 4, fontWeight: 600 }}>
                                        {passwordStrength.label}
                                    </div>
                                </div>
                            )}
                        </FormField>

                        {/* Confirm Password */}
                        <FormField label="Confirm Password">
                            <input
                                type="password" name="confirm"
                                value={form.confirm} onChange={handleChange}
                                required placeholder="Re-enter your password"
                                style={{
                                    ...inputStyle,
                                    borderColor: form.confirm && form.confirm !== form.password ? '#ef4444' : '#d1d5db',
                                }}
                                onFocus={e => e.target.style.borderColor = form.confirm !== form.password ? '#ef4444' : '#4f46e5'}
                                onBlur={e => e.target.style.borderColor = form.confirm && form.confirm !== form.password ? '#ef4444' : '#d1d5db'}
                            />
                            {form.confirm && form.confirm !== form.password && (
                                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>Passwords do not match</p>
                            )}
                        </FormField>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !!success}
                            style={{
                                width: '100%',
                                background: loading || success ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #4338ca)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 10,
                                padding: '12px',
                                fontSize: '0.93rem',
                                fontWeight: 700,
                                cursor: loading || success ? 'not-allowed' : 'pointer',
                                fontFamily: "'DM Sans', sans-serif",
                                letterSpacing: '0.01em',
                                marginTop: 4,
                                boxShadow: loading || success ? 'none' : '0 4px 14px rgba(79,70,229,0.35)',
                            }}
                        >
                            {loading ? 'Creating account...' : success ? 'Account created!' : 'Create Account'}
                        </button>
                    </form>

                    <div style={{
                        textAlign: 'center', marginTop: 22,
                        paddingTop: 20, borderTop: '1px solid #f3f4f6',
                        fontSize: '0.86rem', color: '#9ca3af',
                    }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FormField({ label, children }) {
    return (
        <div>
            <label style={{
                display: 'block', fontSize: '0.83rem',
                fontWeight: 600, color: '#374151', marginBottom: 6,
            }}>
                {label}
            </label>
            {children}
        </div>
    );
}

const inputStyle = {
    width: '100%',
    border: '1.5px solid #d1d5db',
    borderRadius: 9,
    padding: '10px 14px',
    fontSize: '0.9rem',
    color: '#1a1f36',
    background: '#fafafa',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
};
