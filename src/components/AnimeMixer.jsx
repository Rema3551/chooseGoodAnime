import React, { useState, useEffect, useRef } from 'react';
import { Search, FlaskConical, Plus, Sparkles, X, ArrowRight, Zap } from 'lucide-react';
import { searchAnime } from '../services/api';
import { mixAnimes } from '../services/MixerService';
import AnimeCard3D from './AnimeCard3D';

// --- Premium Mixer Slot Component ---
const MixerSlot = ({ selectedAnime, onSelect, placeholder, icon: Icon }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searching, setSearching] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 2 && !selectedAnime) {
                setSearching(true);
                try {
                    const res = await searchAnime(query);
                    setSuggestions(res.data ? res.data.slice(0, 5) : []);
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

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setSuggestions([]);
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (anime) => {
        onSelect(anime);
        setQuery('');
        setSuggestions([]);
    };

    const clearSelection = () => {
        onSelect(null);
        setQuery('');
    };

    return (
        <div
            ref={wrapperRef}
            className={`mixer-slot ${selectedAnime ? 'filled' : 'empty'} ${isFocused ? 'focused' : ''}`}
            style={{
                flex: 1,
                minWidth: '280px',
                position: 'relative',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}
        >
            {/* Search Input Area (Now Above the Card) */}
            {!selectedAnime && (
                <div style={{ position: 'relative', width: '100%', zIndex: 10 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(30, 41, 59, 0.6)',
                        border: isFocused ? '1px solid #a78bfa' : '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        transition: 'all 0.3s ease',
                        boxShadow: isFocused ? '0 0 15px rgba(167, 139, 250, 0.1)' : 'none'
                    }}>
                        <Search size={18} color={isFocused ? "#a78bfa" : "var(--text-secondary)"} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            placeholder={placeholder}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                fontSize: '1rem',
                                width: '100%',
                                outline: 'none',
                                marginLeft: '12px',
                                fontWeight: '500'
                            }}
                        />
                        {searching && <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid #a78bfa', borderTopColor: 'transparent', borderRadius: '50%' }} />}
                    </div>

                    {/* Suggestions Dropdown */}
                    {suggestions.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '110%',
                            left: 0,
                            right: 0,
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            zIndex: 20,
                            maxHeight: '300px',
                            overflowY: 'auto',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            animation: 'fadeIn 0.2s'
                        }}>
                            {suggestions.map(anime => (
                                <div
                                    key={anime.mal_id}
                                    onClick={() => handleSelect(anime)}
                                    className="suggestion-item"
                                    style={{
                                        padding: '12px',
                                        display: 'flex',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <img src={anime.images.jpg.image_url} alt="" style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px' }} />
                                    <div style={{ textAlign: 'left', flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'white' }}>{anime.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{anime.year || 'Unknown'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* The Card Slot (Visual Only or Filled) */}
            <div style={{
                height: '420px', // Slightly taller for better proportion
                background: selectedAnime
                    ? `url(${selectedAnime.images.jpg.large_image_url}) center/cover no-repeat`
                    : 'rgba(15, 23, 42, 0.3)',
                borderRadius: '16px',
                border: selectedAnime
                    ? '2px solid #8b5cf6'
                    : '2px dashed var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: selectedAnime ? 'flex-end' : 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: selectedAnime ? '0 15px 40px rgba(139, 92, 246, 0.25)' : 'inset 0 0 40px rgba(0,0,0,0.2)',
                opacity: selectedAnime ? 1 : 0.7 // Dim empty state slightly
            }}>
                {/* Overlay for text readability when filled */}
                {selectedAnime && (
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '60%',
                        background: 'linear-gradient(to top, rgba(2, 6, 23, 0.95) 0%, rgba(2, 6, 23, 0.6) 60%, transparent 100%)',
                        pointerEvents: 'none'
                    }} />
                )}

                {selectedAnime ? (
                    // FILLED STATE
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        padding: '24px',
                        zIndex: 2,
                        animation: 'fadeInUp 0.4s ease'
                    }}>
                        <h3 style={{
                            fontSize: '1.4rem',
                            lineHeight: '1.2',
                            marginBottom: '6px',
                            textShadow: '0 4px 8px rgba(0,0,0,0.8)',
                            fontWeight: '800'
                        }}>
                            {selectedAnime.title}
                        </h3>
                        <p style={{ color: '#cbd5e1', fontSize: '0.95rem', fontWeight: '500' }}>
                            {selectedAnime.year || 'Unknown Year'}
                        </p>

                        <button
                            onClick={clearSelection}
                            title="Remove"
                            style={{
                                position: 'absolute',
                                top: '-340px', // Positioned at top right of CARD
                                right: '0px',
                                background: 'rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white',
                                transition: 'all 0.2s',
                                transform: 'translateY(10px)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                                e.currentTarget.style.transform = 'translateY(10px) scale(1.1)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
                                e.currentTarget.style.transform = 'translateY(10px) scale(1)';
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    // EMPTY STATE (Placeholder Graphic)
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.3
                    }}>
                        <Icon size={64} color="white" strokeWidth={1} />
                        <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'white', letterSpacing: '2px', textTransform: 'uppercase' }}>Empty Slot</div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Mixer Component ---
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
        <div className="anime-mixer-container" style={{ padding: '2rem 0', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>

            {/* Header Area */}
            <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                    zIndex: -1,
                    pointerEvents: 'none'
                }} />

                <h1 style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: '900',
                    background: 'linear-gradient(to right, #f472b6, #a78bfa)', // Pink to Purple
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    textShadow: '0 0 30px rgba(167, 139, 250, 0.3)'
                }}>
                    <FlaskConical size={48} color="#f472b6" style={{ filter: 'drop-shadow(0 0 10px rgba(244, 114, 182, 0.6))' }} />
                    Anime Alchemy
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                    {lang === 'fr'
                        ? "Le laboratoire expérimental. Fusionnez deux univers pour en créer un nouveau."
                        : "The experimental lab. Merge two universes to create a new one."}
                </p>
                <button
                    onClick={onBack}
                    style={{
                        marginTop: '1.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--text-secondary)',
                        padding: '8px 20px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                    {lang === 'fr' ? '← Retour au QG' : '← Back to HQ'}
                </button>
            </div>

            {/* The Lab (Slots) */}
            <div className="mixer-interface" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2rem',
                flexWrap: 'wrap',
                marginBottom: '3rem',
                perspective: '1000px'
            }}>
                <MixerSlot
                    placeholder={lang === 'fr' ? "Nom de l'anime (ex: Naruto)..." : "Anime Name (e.g. Naruto)..."}
                    selectedAnime={animeA}
                    onSelect={setAnimeA}
                    icon={Sparkles}
                />

                {/* Connector / Plus Operator */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 10px',
                    position: 'relative'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                        border: '2px solid rgba(139, 92, 246, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.3), inset 0 0 10px rgba(0,0,0,0.5)',
                        zIndex: 2
                    }}>
                        <Plus size={32} color="#a78bfa" />
                    </div>
                </div>

                <MixerSlot
                    placeholder={lang === 'fr' ? "Nom de l'anime (ex: Death Note)..." : "Anime Name (e.g. Death Note)..."}
                    selectedAnime={animeB}
                    onSelect={setAnimeB}
                    icon={FlaskConical}
                />
            </div>

            {/* FUSION BUTTON */}
            <div style={{ textAlign: 'center', position: 'relative', height: '100px' }}>
                <button
                    disabled={!animeA || !animeB || loading}
                    onClick={handleMix}
                    style={{
                        position: 'relative',
                        background: (!animeA || !animeB)
                            ? 'var(--bg-secondary)'
                            : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '18px 60px',
                        fontSize: '1.2rem',
                        fontWeight: '800',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        borderRadius: '50px',
                        cursor: (!animeA || !animeB) ? 'not-allowed' : 'pointer',
                        opacity: (!animeA || !animeB) ? 0.5 : 1,
                        transform: loading ? 'scale(0.95)' : 'scale(1)',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        boxShadow: (!animeA || !animeB)
                            ? 'none'
                            : '0 0 40px rgba(236, 72, 153, 0.5), 0 0 10px rgba(139, 92, 246, 0.5)',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={e => {
                        if (animeA && animeB && !loading) {
                            e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 0 60px rgba(236, 72, 153, 0.7)';
                        }
                    }}
                    onMouseLeave={e => {
                        if (animeA && animeB && !loading) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 0 40px rgba(236, 72, 153, 0.5)';
                        }
                    }}
                >
                    {loading ? (
                        <>
                            <FlaskConical className="animate-spin" style={{ marginRight: '10px' }} />
                            {lang === 'fr' ? "SYNTHÈSE EN COURS..." : "SYNTHESIZING..."}
                        </>
                    ) : (
                        <>
                            <Zap style={{ marginRight: '10px' }} fill="white" />
                            {lang === 'fr' ? "ACTIVER LA FUSION" : "ACTIVATE FUSION"}
                        </>
                    )}

                    {/* Glossy effect */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '50%',
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
                        pointerEvents: 'none'
                    }} />
                </button>
            </div>

            {/* Results */}
            {mixed && (
                <div style={{ marginTop: '4rem', animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '3rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{ height: '1px', width: '50px', background: 'var(--border-color)' }}></div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {lang === 'fr' ? "Résultats de l'Expérience" : "Experiment Results"}
                        </h2>
                        <div style={{ height: '1px', width: '50px', background: 'var(--border-color)' }}></div>
                    </div>

                    {results.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            color: 'var(--text-secondary)',
                            padding: '3rem',
                            background: 'rgba(30, 41, 59, 0.3)',
                            borderRadius: '16px',
                            border: '1px dashed var(--border-color)'
                        }}>
                            <FlaskConical size={40} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <p>{lang === 'fr'
                                ? "Mince ! Cette combinaison est chimiquement instable (aucun résultat)."
                                : "Darn! That combination is chemically unstable (no results found)."}</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: '2rem',
                            padding: '0 1rem'
                        }}>
                            {results.map((anime, index) => (
                                <div key={anime.mal_id} style={{
                                    position: 'relative',
                                    animation: `fadeInUp 0.5s ease backwards ${index * 0.1}s`
                                }}>
                                    <AnimeCard3D anime={anime} onClick={() => { }} />
                                    {anime.mixReason && (
                                        <div style={{
                                            marginTop: '12px',
                                            background: 'rgba(251, 191, 36, 0.1)', // Amber tint
                                            border: '1px solid rgba(251, 191, 36, 0.3)',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            fontSize: '0.8rem',
                                            color: '#fbbf24',
                                            display: 'flex',
                                            alignItems: 'start',
                                            gap: '8px',
                                            lineHeight: '1.4'
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
