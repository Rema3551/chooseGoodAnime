import React, { useState, useEffect } from 'react';
import { Search, FlaskConical, Plus, Sparkles, X, ArrowRight } from 'lucide-react';
import { searchAnime } from '../services/api';
import { mixAnimes } from '../services/MixerService';
import AnimeCard3D from './AnimeCard3D';

const MixerInput = ({ label, selectedAnime, onSelect, placeholder }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searching, setSearching] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 2 && !selectedAnime) {
                setSearching(true);
                try {
                    const res = await searchAnime(query);
                    setSuggestions(res.data ? res.data.slice(0, 5) : []);
                    setDropdownOpen(true);
                } catch (err) {
                    console.error(err);
                } finally {
                    setSearching(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query, selectedAnime]);

    const handleSelect = (anime) => {
        onSelect(anime);
        setQuery('');
        setSuggestions([]);
        setDropdownOpen(false);
    };

    const clearSelection = () => {
        onSelect(null);
        setQuery('');
    };

    return (
        <div className="mixer-input-container" style={{ position: 'relative', flex: 1 }}>
            <h3 style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>{label}</h3>

            {selectedAnime ? (
                <div className="selected-anime-card" style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--accent-primary)',
                    borderRadius: '12px',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    position: 'relative',
                    animation: 'fadeIn 0.3s'
                }}>
                    <img
                        src={selectedAnime.images.jpg.image_url}
                        alt={selectedAnime.title}
                        style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{selectedAnime.title}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{selectedAnime.year || 'Unknown'}</div>
                    </div>
                    <button
                        onClick={clearSelection}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div style={{ position: 'relative' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '12px',
                        transition: 'border-color 0.2s'
                    }}>
                        <Search size={18} color="var(--text-secondary)" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={placeholder}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                marginLeft: '10px',
                                width: '100%',
                                outline: 'none'
                            }}
                            onFocus={() => { if (suggestions.length > 0) setDropdownOpen(true); }}
                        />
                    </div>

                    {dropdownOpen && suggestions.length > 0 && (
                        <div className="mixer-dropdown" style={{
                            position: 'absolute',
                            top: '110%',
                            left: 0,
                            right: 0,
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            zIndex: 100,
                            maxHeight: '300px',
                            overflowY: 'auto',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}>
                            {suggestions.map(anime => (
                                <div
                                    key={anime.mal_id}
                                    onClick={() => handleSelect(anime)}
                                    style={{
                                        padding: '10px',
                                        display: 'flex',
                                        gap: '10px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <img src={anime.images.jpg.image_url} alt="" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{anime.title}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{anime.year}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const AnimeMixer = ({ t, lang, onBack }) => {
    const [animeA, setAnimeA] = useState(null);
    const [animeB, setAnimeB] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mixed, setMixed] = useState(false);

    const handleMix = async () => {
        if (!animeA || !animeB) return;
        setLoading(true);
        setMixed(false);
        setResults([]);

        try {
            const res = await mixAnimes(animeA, animeB);
            setResults(res.data || []);
            setMixed(true);
        } catch (error) {
            console.error(error);
            alert(lang === 'fr' ? "Une erreur est survenue lors de la fusion !" : "Something went wrong while mixing!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="anime-mixer-container" style={{ padding: '2rem 0', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    background: 'linear-gradient(to right, #ec4899, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem'
                }}>
                    <FlaskConical size={48} color="#ec4899" />
                    Anime Alchemy
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    {lang === 'fr'
                        ? "Fusionnez deux animes pour découvrir votre prochaine pépite."
                        : "Merge two animes to discover your next gem."}
                </p>
                <button
                    onClick={onBack}
                    style={{
                        marginTop: '1rem',
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}>
                    {lang === 'fr' ? '← Retour' : '← Back'}
                </button>
            </div>

            {/* Mixer Inputs */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                background: 'rgba(30, 41, 59, 0.5)',
                padding: '2rem',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                flexDirection: 'row',
                flexWrap: 'wrap'
            }}>
                <MixerInput
                    label={lang === 'fr' ? "Ingrédient A" : "Ingredient A"}
                    placeholder={lang === 'fr' ? "Rechercher (ex: Naruto)..." : "Search (e.g. Naruto)..."}
                    selectedAnime={animeA}
                    onSelect={setAnimeA}
                />

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-secondary)',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: '2px dashed var(--border-color)'
                }}>
                    <Plus size={24} color="var(--text-secondary)" />
                </div>

                <MixerInput
                    label={lang === 'fr' ? "Ingrédient B" : "Ingredient B"}
                    placeholder={lang === 'fr' ? "Rechercher (ex: Death Note)..." : "Search (e.g. Death Note)..."}
                    selectedAnime={animeB}
                    onSelect={setAnimeB}
                />
            </div>

            {/* Mix Button */}
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <button
                    disabled={!animeA || !animeB || loading}
                    onClick={handleMix}
                    style={{
                        background: (!animeA || !animeB) ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '16px 48px',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        borderRadius: '50px',
                        cursor: (!animeA || !animeB) ? 'not-allowed' : 'pointer',
                        opacity: (!animeA || !animeB) ? 0.5 : 1,
                        transform: loading ? 'scale(0.95)' : 'scale(1)',
                        transition: 'all 0.3s',
                        boxShadow: (!animeA || !animeB) ? 'none' : '0 10px 30px rgba(236, 72, 153, 0.4)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    {loading ? (
                        <>
                            <FlaskConical className="animate-spin" />
                            {lang === 'fr' ? "Fusion en cours..." : "Mixing..."}
                        </>
                    ) : (
                        <>
                            <Sparkles />
                            {lang === 'fr' ? "FUSIONNER !" : "FUSION!"}
                        </>
                    )}
                </button>
            </div>

            {/* Results */}
            {mixed && (
                <div style={{ marginTop: '4rem', animation: 'slideUp 0.5s ease-out' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
                        {lang === 'fr' ? "Résultats de la Fusion" : "Fusion Results"}
                    </h2>

                    {results.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                            {lang === 'fr'
                                ? "Mince ! Cette combinaison est trop instable (aucun résultat trouvé)."
                                : "Darn! That combination is too unstable (no results found)."}
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '2rem'
                        }}>
                            {results.map((anime) => (
                                <div key={anime.mal_id} style={{ position: 'relative' }}>
                                    <AnimeCard3D anime={anime} onClick={() => { }} />
                                    {anime.mixReason && (
                                        <div style={{
                                            marginTop: '10px',
                                            background: 'var(--bg-secondary)',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            fontSize: '0.8rem',
                                            color: '#fbbf24', // Amber/Gold for "Discovery"
                                            display: 'flex',
                                            alignItems: 'start',
                                            gap: '6px'
                                        }}>
                                            <Sparkles size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                                            <span>{anime.mixReason.replace('Shares characteristics:', lang === 'fr' ? 'Points communs :' : 'Matches:')}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnimeMixer;
