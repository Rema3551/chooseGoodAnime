import React from 'react';
import { Play, Info, Star } from 'lucide-react';
import { getLocalizedGenre } from '../data/genre_translations';

const HeroBanner = ({ anime, onClick, lang = 'fr' }) => {
    if (!anime) return null;

    const title = lang === 'fr'
        ? (anime.titles?.find(t => t.type === 'French')?.title || anime.title)
        : (anime.title_english || anime.title);

    const synopsis = lang === 'fr'
        ? "Découvrez cette œuvre incontournable qui captive les fans du monde entier." // Placeholder as we don't have FR synopsis in Jikan lite response often
        : anime.synopsis;

    // Determine best available fallback immediately (Trailer > Large Cover)
    const fallbackImage = anime.trailer?.images?.maximum_image_url ||
        anime.trailer?.images?.large_image_url ||
        anime.images?.webp?.large_image_url ||
        anime.images?.jpg?.large_image_url ||
        anime.images?.jpg?.image_url;

    // State for the final banner to display
    // Start as null to show solid color (loading state) instead of low-quality image
    const [bannerImage, setBannerImage] = React.useState(null);

    React.useEffect(() => {
        let isMounted = true;
        setBannerImage(null); // Reset to loading state on anime change

        const fetchBestBanner = async () => {
            if (anime?.title) {
                // Try to find a High-Res Banner from AniList
                const highRes = await import('../services/api').then(mod => mod.getAniListHighResImage(anime.title));

                if (isMounted) {
                    if (highRes) {
                        setBannerImage(highRes);
                    } else {
                        // If no high-res exists, fall back to the best available standard image
                        setBannerImage(fallbackImage);
                    }
                }
            } else if (isMounted) {
                setBannerImage(fallbackImage);
            }
        };

        fetchBestBanner();
        return () => { isMounted = false; };
    }, [anime, fallbackImage]);

    return (
        <div style={{
            position: 'relative',
            width: '98%',
            maxWidth: '1100px',
            height: '300px',
            minHeight: '250px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            margin: '0 auto var(--spacing-md)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            background: '#1e293b',
            display: 'flex',
            alignItems: 'flex-end'
        }}>
            {/* Main Banner Layer (Fade In) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: bannerImage ? `url(${bannerImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                filter: 'brightness(0.7)',
                zIndex: 1,
                opacity: bannerImage ? 1 : 0,
                transition: 'opacity 0.7s ease-in-out'
            }} />

            {/* Gradient Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to top, var(--bg-primary) 10%, transparent 80%)',
                zIndex: 3
            }} />

            {/* Featured Badge - Top Right */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 4,
                padding: '6px 16px',
                background: 'linear-gradient(135deg, var(--accent-primary), #a78bfa)', // Primary Purple Gradient
                backdropFilter: 'blur(4px)',
                color: 'white',
                borderRadius: '30px',
                fontSize: '0.75rem',
                fontWeight: '800',
                boxShadow: '0 4px 15px var(--glow-shadow)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                {lang === 'fr' ? 'À la une' : 'Featured'}
            </div>

            {/* Content Content du container */}
            <div style={{
                position: 'relative',
                zIndex: 3,
                padding: 'var(--spacing-lg)',
                maxWidth: '800px',
                width: '100%',
                animation: 'fadeInUp 0.8s ease-out'
            }}>



                <h1 style={{
                    fontSize: '2.5rem', // Reduced from 3.5rem to prevent cutoff
                    fontWeight: '900',
                    lineHeight: '1.2',
                    marginBottom: 'var(--spacing-xs)', // Tighter spacing
                    color: '#fff',
                    textShadow: '0 4px 10px rgba(0,0,0,0.5)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2, // Limit title to 2 lines max
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {title}
                </h1>

                <p style={{
                    fontSize: '1rem', // Slightly smaller text
                    color: '#e2e8f0',
                    marginBottom: 'var(--spacing-md)',
                    maxWidth: '600px',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2, // Reduce to 2 lines to save vertical space
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                }}>
                    {anime.synopsis || synopsis}
                </p>

                <div className="flex items-center gap-md">
                    <button
                        onClick={onClick}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px', // Slightly smaller buttons
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            boxShadow: '0 4px 15px var(--glow-shadow)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Info size={20} />
                        {lang === 'fr' ? 'Voir Détails' : 'View Details'}
                    </button>

                    {anime.trailer?.url && (
                        <a
                            href={anime.trailer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.2)',
                                padding: '10px 20px', // Slightly smaller buttons
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <Play size={20} fill="white" />
                            {lang === 'fr' ? 'Bande Annonce' : 'Watch Trailer'}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;
