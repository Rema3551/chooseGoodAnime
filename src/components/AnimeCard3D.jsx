import React, { useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { getLocalizedGenre } from '../data/genre_translations';
import WatchlistButton from './WatchlistButton';

const AnimeCard3D = ({ anime, onClick, gridColumns, lang = 'fr', isFavorite, onToggleWatchlist }) => {
    const cardRef = useRef(null);
    const [transformStyle, setTransformStyle] = useState('');
    const [glowStyle, setGlowStyle] = useState('');

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10 deg
        const rotateY = ((x - centerX) / centerX) * 10;

        setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`);

        // Glow effect calculation
        const glowX = (x / rect.width) * 100;
        const glowY = (y / rect.height) * 100;
        setGlowStyle(`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.2), transparent 80%)`);
    };

    const handleMouseLeave = () => {
        setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
        setGlowStyle('');
    };

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                transform: transformStyle || 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                transition: 'transform 0.1s ease-out',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden', // Essential for glow containment
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                willChange: 'transform'
            }}
        >
            {/* Holographic Glow Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: glowStyle,
                zIndex: 2,
                pointerEvents: 'none',
                mixBlendMode: 'overlay'
            }} />

            <div style={{ aspectRatio: '2/3', background: '#333', position: 'relative', zIndex: 1 }}>
                <img
                    src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                    alt={anime.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                />

                {/* Watchlist Heart Button */}
                <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                    <WatchlistButton
                        isFavorite={isFavorite}
                        onToggle={(e) => {
                            if (e) e.stopPropagation();
                            onToggleWatchlist(anime);
                        }}
                    />
                </div>

                <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px', // Moved to left to avoid conflict with Heart
                    background: 'rgba(0,0,0,0.8)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: '#fff',
                    backdropFilter: 'blur(4px)'
                }}>
                    <Star size={12} fill="#ffc107" color="#ffc107" />
                    {anime.score || 'N/A'}
                </div>
            </div>
            <div style={{ padding: 'var(--spacing-sm)', flexGrow: 1, display: 'flex', flexDirection: 'column', zIndex: 1, background: 'var(--bg-card)' }}>
                <h3 style={{
                    fontSize: gridColumns >= 6 ? '0.8rem' : '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: '4px',
                    color: 'var(--text-primary)'
                }} title={anime.title_english || anime.title}>
                    {lang === 'fr'
                        ? (anime.titles?.find(t => t.type === 'French')?.title || anime.title)
                        : (anime.title_english || anime.title)
                    }
                </h3>
                <div className="tags flex gap-sm" style={{ marginTop: 'auto', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {anime.genres.slice(0, 2).map(g => getLocalizedGenre(g.name, lang)).join(', ')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>• {anime.year || 'Unknown'}</span>
                </div>
            </div>
        </div>
    );
};

export default AnimeCard3D;
