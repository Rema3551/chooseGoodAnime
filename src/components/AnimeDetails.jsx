import React, { useEffect, useState } from 'react';
import { ArrowLeft, Star, MonitorPlay, Calendar, ExternalLink } from 'lucide-react';
import { getAnimeStreaming } from '../services/api';

function AnimeDetails({ anime, onBack, t, lang, isVF = false }) {
    const [streamingLinks, setStreamingLinks] = useState([]);

    useEffect(() => {
        if (anime.mal_id) {
            getAnimeStreaming(anime.mal_id).then(setStreamingLinks);
        }
    }, [anime.mal_id]);

    return (
        <div className="anime-details" style={{ animation: 'fadeIn 0.3s ease' }}>
            <button
                onClick={onBack}
                className="flex items-center gap-sm"
                style={{
                    marginBottom: 'var(--spacing-md)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                }}
            >
                <ArrowLeft size={18} />
                {t.back}
            </button>

            <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--spacing-lg)' }}>
                {/* Left Column: Image & Info */}
                <div className="flex-col gap-md">
                    <img
                        src={anime.images.jpg.large_image_url}
                        alt={anime.title}
                        style={{ width: '100%', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                    />

                    <div style={{ background: 'var(--bg-card)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Note</span>
                            <div className="flex items-center gap-xs" style={{ color: '#ffc107', fontWeight: 'bold' }}>
                                <Star size={16} fill="#ffc107" /> {anime.score || 'N/A'}
                            </div>
                        </div>
                        <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{t.year}</span>
                            <span>{anime.year || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{t.status}</span>
                            <span>{anime.status}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span style={{ color: 'var(--text-secondary)' }}>{t.episodes}</span>
                            <span>{anime.episodes || '?'}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="flex-col gap-lg">
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-xs)' }}>
                            {lang === 'fr'
                                ? (anime.titles?.find(t => t.type === 'French')?.title || anime.title_english || anime.title)
                                : (anime.title_english || anime.title)
                            }
                        </h1>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                            {anime.title}
                        </h2>
                    </div>

                    <div className="flex gap-sm flex-wrap">
                        {anime.genres.map(g => (
                            <span key={g.mal_id} style={{
                                background: 'var(--bg-secondary)',
                                padding: '4px 12px',
                                borderRadius: '100px',
                                fontSize: '0.85rem',
                                color: 'var(--text-accent)'
                            }}>
                                {g.name}
                            </span>
                        ))}
                    </div>

                    <div>
                        <h3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.2rem' }}>Synopsis</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                            {anime.synopsis}
                        </p>
                    </div>

                    {/* Streaming Links */}
                    <div>
                        <h3 className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.2rem' }}>
                            <MonitorPlay size={20} color="var(--accent-primary)" />
                            {t.whereToWatch}
                        </h3>
                        {streamingLinks.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                {streamingLinks
                                    .filter(link => {
                                        const name = link.name.toLowerCase();
                                        // Filter for major platforms only
                                        return name.includes('crunchyroll') ||
                                            name.includes('netflix') ||
                                            name.includes('disney') ||
                                            name.includes('amazon') ||
                                            name.includes('prime') ||
                                            name.includes('adn') ||
                                            name.includes('anime digital network');
                                    })
                                    .map(link => {
                                        // Brand colors
                                        let bg = 'var(--bg-card)';
                                        let border = 'var(--border-color)';
                                        let color = 'var(--text-primary)';
                                        const name = link.name.toLowerCase();

                                        if (name.includes('crunchyroll')) { bg = 'rgba(244, 117, 33, 0.1)'; border = 'rgba(244, 117, 33, 0.3)'; color = '#f47521'; }
                                        else if (name.includes('netflix')) { bg = 'rgba(229, 9, 20, 0.1)'; border = 'rgba(229, 9, 20, 0.3)'; color = '#e50914'; }
                                        else if (name.includes('disney')) { bg = 'rgba(27, 59, 160, 0.1)'; border = 'rgba(59, 130, 246, 0.3)'; color = '#3b82f6'; }
                                        else if (name.includes('amazon') || name.includes('prime')) { bg = 'rgba(0, 168, 225, 0.1)'; border = 'rgba(0, 168, 225, 0.3)'; color = '#00a8e1'; }

                                        return (
                                            <a
                                                key={link.url}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    background: bg,
                                                    borderColor: border,
                                                    color: color,
                                                    padding: '6px 16px', // Compact padding
                                                    borderRadius: '20px', // Pill shape
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    borderWidth: '1px',
                                                    borderStyle: 'solid',
                                                    transition: 'all 0.2s',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    textDecoration: 'none'
                                                }}
                                                className="streaming-link-compact"
                                            >
                                                {link.name} <ExternalLink size={12} style={{ opacity: 0.5 }} />
                                            </a>
                                        );
                                    })}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>{t.noStreaming}</p>
                        )}

                        {/* VF Availability Indicator */}
                        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            {isVF ? (
                                <div className="flex items-center gap-sm">
                                    <div style={{ background: '#22c55e', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>VF</div>
                                    <span style={{ color: '#22c55e', fontWeight: '600' }}>VF Disponible</span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>(Doublage français confirmé)</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-sm">
                                    <div style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}>VOSTFR</div>
                                    <span style={{ color: 'var(--text-secondary)' }}>VF non confirmée</span>
                                    {/* Optional: Keep a manual check link if not confirmed */}
                                    <a
                                        href={`https://www.google.com/search?q=${encodeURIComponent(anime.title + ' streaming vf')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'underline', marginLeft: 'auto' }}
                                    >
                                        Vérifier manuellement
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trailer */}
                    <div>
                        <h3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.2rem' }}>{t.trailer}</h3>
                        {anime.trailer?.embed_url ? (
                            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', marginBottom: 'var(--spacing-sm)' }}>
                                <iframe
                                    src={anime.trailer.embed_url}
                                    title="Trailer"
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <div style={{
                                width: '100%',
                                padding: '40px',
                                background: 'var(--bg-card)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '8px',
                                marginBottom: 'var(--spacing-sm)',
                                color: 'var(--text-secondary)',
                                border: '1px dashed var(--border-color)'
                            }}>
                                <MonitorPlay size={32} opacity={0.5} />
                                <p style={{ fontSize: '0.9rem' }}>Pas de bande-annonce officielle.</p>
                            </div>
                        )}
                        <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(anime.title + ' ' + (t.trailerSearchTerm || 'trailer'))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.9rem',
                                color: 'var(--accent-primary)',
                                textDecoration: 'none',
                                marginTop: '8px'
                            }}
                        >
                            <ExternalLink size={14} />
                            {t.searchTrailer || "Chercher une autre version sur YouTube"}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnimeDetails;
