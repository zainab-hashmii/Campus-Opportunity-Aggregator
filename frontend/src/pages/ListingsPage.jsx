import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import OpportunityCard from '../components/OpportunityCard';
import FilterBar from '../components/FilterBar';

const CATEGORY_NAMES = {
    '1': 'Internships', '2': 'Scholarships', '3': 'Hackathons',
    '4': 'Research',    '5': 'Courses',       '6': 'Exchange Programs',
    '7': 'Competitions','8': 'Workshops',
};

export default function ListingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const initFilters = {
        category_id: searchParams.get('category_id') || '',
        dept_id:     searchParams.get('dept_id')     || '',
        opp_mode:    searchParams.get('opp_mode')    || '',
        is_paid:     searchParams.get('is_paid')     || '',
    };

    const [opportunities, setOpportunities] = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState(null);
    const [searchTerm,  setSearchTerm]  = useState('');
    const [filters,     setFilters]     = useState(initFilters);
    const filtersRef = useRef(initFilters);

    async function fetchOpportunities(currentFilters) {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (currentFilters.category_id) params.append('category_id', currentFilters.category_id);
            if (currentFilters.dept_id)     params.append('dept_id',     currentFilters.dept_id);
            if (currentFilters.opp_mode)    params.append('opp_mode',    currentFilters.opp_mode);
            if (currentFilters.is_paid !== '') params.append('is_paid',  currentFilters.is_paid);

            const response = await api.get(`/api/search?${params.toString()}`);
            setOpportunities(response.data.data || []);
        } catch (err) {
            setError('Failed to load opportunities. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // On mount, fetch with whatever URL params came in
    useEffect(() => {
        fetchOpportunities(filtersRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleFilterChange(key, value) {
        const newFilters = { ...filtersRef.current, [key]: value };
        filtersRef.current = newFilters;
        setFilters(newFilters);
    }

    function handleSearch() {
        fetchOpportunities(filtersRef.current);
    }

    function clearCategoryFilter() {
        const newFilters = { ...filtersRef.current, category_id: '' };
        filtersRef.current = newFilters;
        setFilters(newFilters);
        setSearchParams({});
        fetchOpportunities(newFilters);
    }

    const today    = new Date();
    const filtered = opportunities.filter(opp => {
        if (new Date(opp.deadline) < today) return false;
        const q = searchTerm.toLowerCase();
        return (
            opp.title.toLowerCase().includes(q) ||
            opp.description.toLowerCase().includes(q) ||
            (opp.organization || '').toLowerCase().includes(q)
        );
    });

    const activeCategory = filters.category_id ? CATEGORY_NAMES[filters.category_id] : null;

    return (
        <div>
            {/* ── Hero Banner ── */}
            <div style={{
                background: 'linear-gradient(135deg, #0f0e2b 0%, #1e1b4b 55%, #312e81 100%)',
                padding: '48px 24px 56px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -60,  right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(167,139,250,0.09)',  pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 170, height: 170, borderRadius: '50%', background: 'rgba(109,40,217,0.12)',  pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 20,   left: -40, width: 130, height: 130, borderRadius: '50%', background: 'rgba(245,158,11,0.06)', pointerEvents: 'none' }} />

                <div className="max-w-7xl mx-auto relative">
                    <div className="fade-up">
                        <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fbbf24', fontWeight: 600, marginBottom: 10 }}>
                            Campus Opportunity Aggregator · NUST
                        </p>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, color: '#ffffff', lineHeight: 1.2, marginBottom: 10 }}>
                            {activeCategory ? (
                                <>{activeCategory} <span style={{ color: '#fbbf24' }}>Opportunities</span></>
                            ) : (
                                <>Find Your Edge — <span style={{ color: '#fbbf24' }}>Browse Every Opportunity</span></>
                            )}
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', maxWidth: 520, lineHeight: 1.6 }}>
                            {activeCategory
                                ? `Showing all ${activeCategory.toLowerCase()} opportunities verified and curated for NUST students.`
                                : 'Internships at Google & Careem, scholarships to Germany & Oxford, hackathons with PKR 500K prizes — all in one place.'
                            }
                        </p>
                    </div>

                    {/* Active category chip + stats */}
                    <div className="fade-up fade-up-delay-1 flex gap-4 mt-6 flex-wrap items-center">
                        {activeCategory && (
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'rgba(245,158,11,0.18)',
                                border: '1px solid rgba(245,158,11,0.35)',
                                borderRadius: 100, padding: '6px 14px',
                            }}>
                                <span style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: 600 }}>
                                    📌 Filtered: {activeCategory}
                                </span>
                                <button
                                    onClick={clearCategoryFilter}
                                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0 }}
                                    title="Clear filter"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {!loading && !error && (
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {[
                                    { label: 'Total', value: opportunities.length },
                                    { label: 'Showing', value: filtered.length },
                                ].map(stat => (
                                    <div key={stat.label} style={{
                                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: 10, padding: '8px 16px', backdropFilter: 'blur(8px)',
                                    }}>
                                        <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1.1rem' }}>{stat.value}</span>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginLeft: 6 }}>{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-6 fade-up fade-up-delay-2">
                    <FilterBar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onSearch={handleSearch}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                    />
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
                    </div>
                )}

                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 12, padding: '14px 18px', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-5xl mb-4">🔍</p>
                        <p style={{ color: '#6b7280', fontSize: '1.1rem', fontWeight: 500 }}>No opportunities found</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: 4 }}>Try adjusting your filters or search term</p>
                    </div>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 fade-up fade-up-delay-3">
                        {filtered.map(opp => (
                            <OpportunityCard key={opp.opp_id} opportunity={opp} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
