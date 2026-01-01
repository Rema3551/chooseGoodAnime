import React, { useState, useEffect } from 'react';
import { Search, FlaskConical, Filter, Star, Heart, Loader2, Grid, LayoutGrid, Columns, Palette, Moon, Sun, ZoomIn, ZoomOut, Tag, Sparkles } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

import { getTopAnime, searchAnime, getAnimeGenres, searchAniList, getAnimeRecommendations, getAniListHighResImage } from './services/api';
import AnimeDetails from './components/AnimeDetails';
import AnimeCard3D from './components/AnimeCard3D';
import HeroBanner from './components/HeroBanner';
import SurpriseReveal from './components/SurpriseReveal';
import MultiSelect from './components/MultiSelect';
import TierListMaker from './components/TierListMaker';
import AnimeMixer from './components/AnimeMixer';
import Footer from './components/Footer';
import { VF_GOLDEN_LIST, VF_PRODUCERS } from './data/golden_list_vf';
import { getLocalizedGenre } from './data/genre_translations';

// Translations
const translations = {
    fr: {
        searchPlaceholder: "Rechercher un anime...",
        filters: "Filtres",
        platform: "Plateforme",
        allPlatforms: "Toutes",
        year: "Année",
        allYears: "Toutes les années",
        status: "Statut",
        allStatus: "Tous",
        statusAiring: "En cours de diffusion",
        statusComplete: "Terminé",
        statusUpcoming: "À venir",
        minScore: "Note Min.",
        genres: "Genres",
        apply: "Appliquer les filtres",
        popularResults: "Animes Populaires",
        searchResults: "Résultats pour",
        loading: "Chargement...",
        connect: "Se connecter",
        back: "Retour à la recherche",
        episodes: "Épisodes",
        whereToWatch: "Où regarder ?",
        trailer: "Bande Annonce",
        noStreaming: "Aucune plateforme de streaming officielle trouvée.",
        language: "Langue",
        otherGenres: "autres...",
        trailerSearchTerm: "bande annonce vf",
        searchTrailer: "Rechercher la bande annonce VF sur YouTube",
        availableVF: "Disponible en VF (Hybride)",
        surprise: "🎲 Surprends-moi !",
        format: "Format",
        allFormats: "Tous",
        formatTV: "Série TV",
        formatMovie: "Film",
        vibeSearchPlaceholder: "Recherche par ambiance (ex: personnage surpuissant donjon...)",
        noResults: "Aucun anime trouvé pour cette recherche 😔"
    },
    en: {
        searchPlaceholder: "Search for an anime...",
        filters: "Filters",
        platform: "Platform",
        allPlatforms: "All",
        year: "Year",
        allYears: "All years",
        status: "Status",
        allStatus: "All",
        statusAiring: "Airing",
        statusComplete: "Completed",
        statusUpcoming: "Upcoming",
        minScore: "Min Score",
        genres: "Genres",
        apply: "Apply filters",
        popularResults: "Popular Anime",
        searchResults: "Results for",
        loading: "Loading...",
        connect: "Login",
        back: "Back to search",
        episodes: "Episodes",
        whereToWatch: "Where to watch?",
        trailer: "Trailer",
        noStreaming: "No official streaming platform found.",
        language: "Language",
        otherGenres: "others...",
        trailerSearchTerm: "trailer",
        searchTrailer: "Search for trailer on YouTube",
        availableVF: "Available in VF (Hybrid)",
        surprise: "🎲 Surprise Me!",
        format: "Format",
        allFormats: "All",
        formatTV: "TV Series",
        formatMovie: "Movie",
        vibeSearchPlaceholder: "Search by vibe (e.g. overpowered character dungeon...)"
    }
};

function App() {
    const [lang, setLang] = useState('fr'); // 'fr' or 'en'
    const t = translations[lang];

    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [descriptionQuery, setDescriptionQuery] = useState(''); // New "Vibe" search state
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);

    // Advanced Filters State
    const [selectedPlatforms, setSelectedPlatforms] = useState([]); // Array of platform IDs (string)
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedType, setSelectedType] = useState(''); // 'tv', 'movie'
    const [detectedTags, setDetectedTags] = useState({ tags: [], genres: [] }); // For Vibe detection feedback
    const [selectedStatus, setSelectedStatus] = useState('');
    const [minScore, setMinScore] = useState('');
    const [vfOnly, setVfOnly] = useState(false);

    // View States
    const [selectedAnime, setSelectedAnime] = useState(null);
    const [featuredAnime, setFeaturedAnime] = useState(null);
    const [featuredBannerUrl, setFeaturedBannerUrl] = useState(null);
    const [surpriseMode, setSurpriseMode] = useState(false);
    const [tierListMode, setTierListMode] = useState(false); // New Tier List Mode
    const [mixerMode, setMixerMode] = useState(false); // Anime Mixer Mode
    const [searchMode, setSearchMode] = useState('title'); // 'title', 'vibe', 'similar'

    // Watchlist State
    const [watchlist, setWatchlist] = useState(() => {
        try {
            const saved = localStorage.getItem('anime_watchlist');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse watchlist", e);
            return [];
        }
    });

    const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);

    // Persist Watchlist
    useEffect(() => {
        localStorage.setItem('anime_watchlist', JSON.stringify(watchlist));
    }, [watchlist]);

    const toggleWatchlist = (anime) => {
        setWatchlist(prev => {
            const exists = prev.some(a => a.mal_id === anime.mal_id);
            if (exists) {
                return prev.filter(a => a.mal_id !== anime.mal_id);
            } else {
                return [...prev, anime];
            }
        });
    };

    const isInWatchlist = (mal_id) => {
        return watchlist.some(a => a.mal_id === mal_id);
    };

    const MAIN_GENRES = [
        "Action", "Adventure", "Comedy", "Drama", "Fantasy",
        "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life",
        "Sports", "Supernatural", "Suspense", "Award Winning"
    ];
    const [currentTheme, setCurrentTheme] = useState('theme-midnight');

    const THEMES = [
        { id: 'theme-midnight', name: 'Midnight', icon: '🌙' },
        { id: 'theme-daylight', name: 'Daylight', icon: '☀️' },
        { id: 'theme-cyberpunk', name: 'Cyberpunk', icon: '🤖' },
        { id: 'theme-zen', name: 'Zen', icon: '🎋' },
        { id: 'theme-pop', name: 'Pop', icon: '🍭' }
    ];

    // Pagination & Layout State
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    // Responsive Grid Columns
    const getInitialGridColumns = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth < 640) return 2; // Mobile (2 small columns usually better than 1 giant one for posters)
            if (window.innerWidth < 768) return 3; // Tablet Portrait
            if (window.innerWidth < 1024) return 4; // Tablet Landscape
            return 5; // Desktop
        }
        return 5;
    };

    const [gridColumns, setGridColumns] = useState(getInitialGridColumns);
    const [showMobileFilters, setShowMobileFilters] = useState(false); // Mobile Sidebar State

    // Handle Resize for Grid
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) setGridColumns(2);
            else if (width < 768) setGridColumns(3);
            else if (width < 1024) setGridColumns(4);
            else setGridColumns(5);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Infinite Scroll Observer
    const [bottomRef, bottomInView] = useState(null); // Ref for bottom element
    // Actually, let's use a callback ref or simple useEffect with ref. 
    // Simplified observer logic below.

    // Platforms (Grouped IDs from Jikan/MAL)
    const PLATFORMS = [
        {
            id: '1977',
            name: 'Netflix',
            ids: ['1977']
        },
        {
            id: 'crunchyroll',

            name: 'Crunchyroll (+Funimation)',
            ids: ['1784', '1468', '102', '2770'] // Crunchyroll, Crunchyroll LLC, Funimation, Panimation
        },
        {
            id: 'disney',
            name: 'Disney+',
            ids: ['417', '1789', '2771'] // Disney Platform, Walt Disney Japan, Disney Animation China
        },
        {
            id: '3021',
            name: 'Amazon Prime',
            ids: ['3021']
        },
        {
            id: '17',
            name: 'Aniplex (ADN/Wakanim)',
            ids: ['17', '493'] // Aniplex, Aniplex of America (Often generic licensors for ADN titles)
        }
    ];

    // Years (Last 20 years)
    const currentYear = new Date().getFullYear();
    const YEARS = Array.from({ length: 20 }, (_, i) => currentYear - i);

    // Initial Load (Genres only)
    useEffect(() => {
        const loadGenres = async () => {
            try {
                const genresData = await getAnimeGenres();
                setGenres(genresData || []);
            } catch (error) {
                console.error("Failed to load genres", error);
            }
        };
        loadGenres();
    }, []);

    // Helper to check if any filter is active
    const hasActiveFilters = () => {
        return searchQuery.trim() !== '' ||
            // descriptionQuery no longer needed separately, we use searchQuery + searchMode
            selectedGenres.length > 0 ||
            selectedPlatforms.length > 0 ||
            selectedYear !== '' ||
            selectedStatus !== '' ||
            selectedType !== '' ||
            (minScore !== '' && minScore !== '0');
    };

    // Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading && !isFetchingMore && hasNextPage) {
                    handleLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        const target = document.getElementById('scroll-sentinel');
        if (target) observer.observe(target);

        return () => {
            if (target) observer.unobserve(target);
        };
    }, [animes, loading, isFetchingMore, hasNextPage, tierListMode, selectedAnime]); // Re-attach when list changes or view changes

    const handleLoadMore = () => {
        setIsFetchingMore(true);
        handleSearch(null, page + 1);
    };

    const handleSearch = async (e, nextPage = 1) => {
        if (e) e.preventDefault();

        const isNewSearch = nextPage === 1;
        if (isNewSearch) {
            setLoading(true);
            setPage(1);
            setHasNextPage(true);
            setDetectedTags({ tags: [], genres: [] });
        }

        if (isNewSearch) setSelectedAnime(null);

        try {
            let newAnimes = [];
            let hasNext = false;

            if (searchQuery.trim() !== '') {
                if (searchMode === 'vibe') {
                    // MODE: VIBE SEARCH (AniList Tags)
                    // Pass the raw query description to our smarter parser
                    const results = await searchAniList(searchQuery, nextPage);
                    newAnimes = results.data || [];
                    hasNext = results.pagination?.has_next_page || false;

                    if (nextPage === 1 && results.meta) {
                        setDetectedTags({
                            tags: results.meta.recognizedTags || [],
                            genres: results.meta.recognizedGenres || []
                        });
                    }
                } else if (searchMode === 'similar') {
                    // MODE: SIMILAR SEARCH
                    // 1. Find the anime ID first (Standard Search)
                    const searchRes = await searchAnime(searchQuery);
                    const candidates = searchRes.data || [];
                    if (candidates.length > 0) {
                        const targetId = candidates[0].mal_id;

                        // 2. Get Recommendations
                        const recs = await getAnimeRecommendations(targetId);

                        if (recs && recs.length > 0) {
                            newAnimes = recs;
                            hasNext = false;
                        } else {
                            // Fallback: Use Vibe Search with genres
                            console.log("No direct recommendations, falling back to Vibe Search...");

                            // Aggregate all metadata: Genres, Themes, Demographics
                            const metadata = [
                                ...(candidates[0].genres || []),
                                ...(candidates[0].themes || []),
                                ...(candidates[0].demographics || [])
                            ];

                            const searchMeta = metadata.map(g => g.name).join(' ');

                            if (searchMeta) {
                                // Add a "mixReason" or similar property to indicate this is a fallback?
                                // For now, just fetch.
                                const vibeRes = await searchAniList(searchMeta, nextPage);

                                // Filter out the target anime itself
                                newAnimes = (vibeRes.data || []).filter(a => a.mal_id !== targetId);
                                hasNext = vibeRes.data?.pagination?.has_next_page || false;

                                // Optional: Notify user (could be done via a toast or UI state, 
                                // but for now keeping it simple as requested)
                            } else {
                                newAnimes = [];
                            }
                        }
                    } else {
                        newAnimes = [];
                    }
                } else {
                    // MODE: TITLE SEARCH (Standard)
                    // Aggregate all IDs from selected platforms
                    let allProducerIds = [];
                    selectedPlatforms.forEach(pId => {
                        const platformObj = PLATFORMS.find(p => p.id === pId);
                        if (platformObj) {
                            allProducerIds = [...allProducerIds, ...platformObj.ids];
                        }
                    });

                    const filters = {
                        genres: selectedGenres,
                        producers: allProducerIds,
                        start_date: selectedYear,
                        status: selectedStatus,
                        type: selectedType,
                        min_score: minScore,
                        page: nextPage // Pass page
                    };

                    const results = await searchAnime(searchQuery, filters);
                    newAnimes = results.data || [];
                    hasNext = results.pagination?.has_next_page || false;
                }
            } else if (!hasActiveFilters()) {
                // ... Top Anime logic ...
                const results = await getTopAnime(nextPage);
                newAnimes = results.data || [];
                hasNext = results.pagination?.has_next_page || (newAnimes.length > 0);
            } else {
                // Active filters without search query (effectively Mode Title Standard)
                let allProducerIds = [];
                selectedPlatforms.forEach(pId => {
                    const platformObj = PLATFORMS.find(p => p.id === pId);
                    if (platformObj) {
                        allProducerIds = [...allProducerIds, ...platformObj.ids];
                    }
                });

                const filters = {
                    genres: selectedGenres,
                    producers: allProducerIds,
                    start_date: selectedYear,
                    status: selectedStatus,
                    type: selectedType,
                    min_score: minScore,
                    page: nextPage // Pass page
                };

                const results = await searchAnime(searchQuery, filters);
                newAnimes = results.data || [];
                hasNext = results.pagination?.has_next_page || false;
            }

            if (vfOnly) {
                // Filter client side for VF logic
                // NOTE: This breaks pagination if all items on page X are filtered out.
                // Infinite scroll might get stuck.
                // Accepted limitation for now? Or auto-fetch next?
                // For simplicity: just filter.
                newAnimes = newAnimes.filter(a =>
                    (Array.isArray(VF_GOLDEN_LIST) && VF_GOLDEN_LIST.includes(a.mal_id)) ||
                    (a.producers && Array.isArray(a.producers) && a.producers.some(p => p && p.mal_id && Array.isArray(VF_PRODUCERS) && VF_PRODUCERS.includes(p.mal_id)))
                );
            }

            if (isNewSearch) {
                setAnimes(newAnimes);

                // Set Featured Anime only when on Home (Top Anime) and no active search/filters
                if (!hasActiveFilters() && newAnimes.length > 0) {
                    // Randomize from the first batch
                    const randomFeatured = newAnimes[Math.floor(Math.random() * newAnimes.length)];
                    setFeaturedAnime(randomFeatured);
                } else if (searchQuery || hasActiveFilters()) {
                    setFeaturedAnime(null); // Clear featured when searching
                }
            } else {
                // Append unique items (deduplicate by MAL ID just in case)
                setAnimes(prev => {
                    const existingIds = new Set(prev.map(a => a.mal_id));
                    const uniqueNew = newAnimes.filter(a => !existingIds.has(a.mal_id));
                    return [...prev, ...uniqueNew];
                });
            }

            setPage(nextPage);
            setHasNextPage(hasNext);

        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    // Fallback: Ensure Featured Anime is set if we have results on Home
    useEffect(() => {
        const isHome = !searchQuery.trim() &&
            selectedGenres.length === 0 &&
            selectedPlatforms.length === 0 &&
            !selectedYear &&
            !selectedStatus &&
            !selectedType &&
            (!minScore || minScore === '0') &&
            !vfOnly;

        if (!loading && animes && animes.length > 0 && !featuredAnime && isHome && !selectedAnime) {
            const randomFeatured = animes[Math.floor(Math.random() * animes.length)];
            setFeaturedAnime(randomFeatured);
        }
    }, [loading, animes, featuredAnime, searchQuery, selectedGenres, selectedPlatforms, selectedYear, selectedStatus, selectedType, minScore, vfOnly, selectedAnime]);

    // Auto-apply filters with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(null, 1);
        }, 500);

        return () => clearTimeout(timeoutId);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, searchMode, selectedPlatforms, selectedYear, selectedStatus, selectedType, minScore, selectedGenres, vfOnly]);

    const togglePlatform = (platformId) => {
        setSelectedPlatforms(prev =>
            prev.includes(platformId)
                ? prev.filter(id => id !== platformId)
                : [...prev, platformId]
        );
    };

    const handleSurpriseMe = async () => {
        setLoading(true);
        try {
            // 1. Build filters just like search
            let allProducerIds = [];
            selectedPlatforms.forEach(pId => {
                const platformObj = PLATFORMS.find(p => p.id === pId);
                if (platformObj) {
                    allProducerIds = [...allProducerIds, ...platformObj.ids];
                }
            });

            const filters = {
                genres: selectedGenres,
                producers: allProducerIds,
                start_date: selectedYear,
                status: selectedStatus,
                type: selectedType,
                min_score: minScore
            };

            // 2. Get random page (first fetch to know total pages)
            const initialResult = await searchAnime(searchQuery, filters);

            let randomAnime = null;

            if (!initialResult.pagination || initialResult.pagination.last_visible_page <= 1) {
                // If only 1 page, pick from results directly
                let candidates = initialResult.data || [];
                if (vfOnly) {
                    candidates = candidates.filter(a =>
                        VF_GOLDEN_LIST.includes(a.mal_id) ||
                        a.producers.some(p => VF_PRODUCERS.includes(p.mal_id))
                    );
                }

                if (candidates.length > 0) {
                    randomAnime = candidates[Math.floor(Math.random() * candidates.length)];
                }
            } else {
                // Fetch random page
                const totalPages = initialResult.pagination.last_visible_page;
                const maxPage = Math.min(totalPages, 50);
                const randomPage = Math.floor(Math.random() * maxPage) + 1;

                const randomPageResult = await searchAnime(searchQuery, { ...filters, page: randomPage });

                let candidates = randomPageResult.data || [];
                if (vfOnly) {
                    candidates = candidates.filter(a =>
                        VF_GOLDEN_LIST.includes(a.mal_id) ||
                        a.producers.some(p => VF_PRODUCERS.includes(p.mal_id))
                    );
                }

                if (candidates.length > 0) {
                    randomAnime = candidates[Math.floor(Math.random() * candidates.length)];
                }
            }

            if (randomAnime) {
                setSelectedAnime(randomAnime);
                setSurpriseMode(true); // Activate Surprise Mode
            } else {
                alert(lang === 'fr' ? "Aucun anime trouvé avec ces critères ! Essayez d'élargir votre recherche." : "No anime found! Try broadening your filters.");
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleGenre = (genreId) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        );
    };

    // Render Surprise Mode
    if (surpriseMode && selectedAnime) {
        return (
            <SurpriseReveal
                anime={selectedAnime}
                onBack={() => setSurpriseMode(false)} // Go to details view (selectedAnime stays set)
                onSpinAgain={() => handleSurpriseMe()}
                t={t}
            />
        );
    }





    return (
        <div className={`app-container ${currentTheme}`} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', transition: 'background 0.3s, color 0.3s' }}>



            {/* Header */}
            {/* Header */}
            <header style={{
                padding: '1rem 0', // Increased padding slightly for breathability
                position: 'sticky',
                top: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.85)', // Modern Glassmorphism
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                zIndex: 50
            }}>
                <div className="container header-grid">
                    {/* Logo Section */}
                    <div className="logo flex items-center gap-sm">
                        <div
                            onClick={() => { setSelectedAnime(null); setTierListMode(false); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                position: 'relative' // For absolute glow if needed, but we use filter here
                            }}
                        >
                            {/* Glow Effect Layer behind (optional) or just Drop Shadow */}
                            <img
                                src={`/logo.png?v=${Date.now()}`}
                                alt="ChooseGoodAnime Logo"
                                style={{
                                    height: '180px',
                                    width: 'auto',
                                    // Strong colored glow to make it POP against the dark glass
                                    filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.6)) drop-shadow(0 0 40px rgba(168, 85, 247, 0.4))',
                                    transition: 'filter 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.filter = 'drop-shadow(0 0 30px rgba(99, 102, 241, 0.8)) drop-shadow(0 0 50px rgba(168, 85, 247, 0.6))'}
                                onMouseLeave={(e) => e.currentTarget.style.filter = 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.6)) drop-shadow(0 0 40px rgba(168, 85, 247, 0.4))'}
                            />
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="flex flex-col items-center justify-center w-full" style={{ position: 'relative' }}>

                        {/* Search Input Container */}
                        <div style={{
                            width: '100%',
                            maxWidth: '550px',
                            position: 'relative'
                        }}>
                            {/* Tabs integrated on top-left of search bar for "Folder" look or Pills */}
                            <div className="flex gap-2" style={{
                                position: 'absolute',
                                top: '-28px',
                                left: '10px',
                                zIndex: 1
                            }}>
                                <button
                                    onClick={() => { setSearchMode('title'); setSearchQuery(''); }}
                                    style={{
                                        padding: '4px 12px',
                                        borderTopLeftRadius: '8px',
                                        borderTopRightRadius: '8px',
                                        fontSize: '0.75rem',
                                        background: searchMode === 'title' ? 'var(--bg-secondary)' : 'transparent',
                                        color: searchMode === 'title' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        borderBottom: searchMode === 'title' ? '2px solid var(--accent-primary)' : 'none',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        opacity: searchMode === 'title' ? 1 : 0.7
                                    }}
                                >
                                    🔍 {t.searchPlaceholder}
                                </button>
                                <button
                                    onClick={() => { setSearchMode('vibe'); setSearchQuery(''); }}
                                    style={{
                                        padding: '4px 12px',
                                        borderTopLeftRadius: '8px',
                                        borderTopRightRadius: '8px',
                                        fontSize: '0.75rem',
                                        background: searchMode === 'vibe' ? 'var(--bg-secondary)' : 'transparent',
                                        color: searchMode === 'vibe' ? '#FF6B6B' : 'var(--text-secondary)',
                                        borderBottom: searchMode === 'vibe' ? '2px solid #FF6B6B' : 'none',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        opacity: searchMode === 'vibe' ? 1 : 0.7
                                    }}
                                >
                                    ✨ {lang === 'fr' ? 'Ambiance' : 'Vibe'}
                                </button>
                                <button
                                    onClick={() => { setSearchMode('similar'); setSearchQuery(''); }}
                                    style={{
                                        padding: '4px 12px',
                                        borderTopLeftRadius: '8px',
                                        borderTopRightRadius: '8px',
                                        fontSize: '0.75rem',
                                        background: searchMode === 'similar' ? 'var(--bg-secondary)' : 'transparent',
                                        color: searchMode === 'similar' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        borderBottom: searchMode === 'similar' ? '2px solid var(--accent-primary)' : 'none',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        opacity: searchMode === 'similar' ? 1 : 0.7
                                    }}
                                >
                                    👯 {lang === 'fr' ? 'Similaire' : 'Similar'}
                                </button>
                            </div>

                            <form onSubmit={handleSearch} className="search-bar" style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'var(--bg-secondary)',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                border: `1px solid ${searchMode === 'vibe' ? '#FF6B6B' : 'var(--border-color)'}`,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease'
                            }}>
                                <Search size={20} color={searchMode === 'vibe' ? '#FF6B6B' : "var(--text-secondary)"} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={
                                        searchMode === 'title' ? t.searchPlaceholder :
                                            searchMode === 'vibe' ? t.vibeSearchPlaceholder :
                                                lang === 'fr' ? "Entrez un titre d'anime (ex: Naruto)..." : "Enter anime title..."
                                    }
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-primary)',
                                        marginLeft: '12px',
                                        width: '100%',
                                        outline: 'none',
                                        fontSize: '1rem',
                                        fontWeight: '500'
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* User Actions Section */}
                    <div className="user-actions flex items-center gap-md" style={{ justifyContent: 'flex-end' }}>

                        <div style={{ height: '24px', width: '1px', background: 'var(--border-color)', margin: '0 8px' }}></div>

                        {/* Day/Night Toggle */}
                        <button
                            onClick={() => setCurrentTheme(currentTheme === 'theme-midnight' ? 'theme-daylight' : 'theme-midnight')}
                            style={{
                                color: 'var(--text-secondary)',
                                padding: '8px',
                                background: 'transparent',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid transparent', // preset for hover
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            title={currentTheme === 'theme-midnight' ? "Switch to Day Mode" : "Passer en Mode Nuit"}
                        >
                            {currentTheme === 'theme-midnight' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button
                            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                            style={{
                                color: 'var(--text-primary)',
                                fontWeight: 'bold',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            {lang === 'fr' ? '🇺🇸 EN' : '🇫🇷 FR'}
                        </button>

                        <button style={{
                            background: 'var(--text-primary)',
                            color: 'var(--bg-primary)',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                            onClick={() => { setTierListMode(true); setMixerMode(false); }}
                        >
                            {lang === 'fr' ? '🏆 Tier List' : '🏆 Tier List Maker'}
                        </button>

                        <button style={{
                            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginLeft: '8px',
                            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)'
                        }}
                            onClick={() => { setMixerMode(true); setTierListMode(false); setSelectedAnime(null); }}
                        >
                            {lang === 'fr' ? '🧪 Mixer' : '🧪 Mixer'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Detected Tags Feedback */}
            {(detectedTags.genres.length > 0 || detectedTags.tags.length > 0) && (
                <div className="flex flex-wrap justify-center gap-2 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <span className="text-sm text-gray-400 self-center mr-2">Ambiance détectée :</span>
                    {detectedTags.genres.map(g => (
                        <span key={`g-${g}`} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium border border-purple-500/30 flex items-center gap-1">
                            <Sparkles size={10} /> {g}
                        </span>
                    ))}
                    {detectedTags.tags.map(t => (
                        <span key={`t-${t}`} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30 flex items-center gap-1">
                            <Tag size={10} /> {t}
                        </span>
                    ))}
                </div>
            )}

            {/* Mobile Filter Toggle (Floating Button) - Visible only on small screens */}
            <button
                className="md:hidden"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 100,
                    background: 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)',
                    cursor: 'pointer'
                }}
            >
                {showMobileFilters ? <div style={{ fontSize: '1.5rem' }}>✕</div> : <Filter size={24} />}
            </button>

            {/* Main Content */}
            <main className="container layout-grid" style={{ paddingTop: '2rem', position: 'relative' }}>

                {tierListMode ? (
                    <div style={{ gridColumn: '1 / -1', minHeight: '80vh' }}>
                        <TierListMaker t={t} lang={lang} />
                    </div>
                ) : mixerMode ? (
                    <div style={{ gridColumn: '1 / -1', minHeight: '80vh' }}>
                        <AnimeMixer t={t} lang={lang} onBack={() => setMixerMode(false)} />
                    </div>
                ) : selectedAnime ? (
                    <div style={{ gridColumn: '1 / -1', minHeight: '80vh' }}>
                        <AnimeDetails
                            anime={selectedAnime}
                            onBack={() => setSelectedAnime(null)}
                            t={t}
                            lang={lang}
                            isVF={
                                (Array.isArray(VF_GOLDEN_LIST) && VF_GOLDEN_LIST.includes(selectedAnime.mal_id)) ||
                                (selectedAnime.producers && Array.isArray(selectedAnime.producers) && selectedAnime.producers.some(p => p && p.mal_id && Array.isArray(VF_PRODUCERS) && VF_PRODUCERS.includes(p.mal_id)))
                            }
                            isFavorite={isInWatchlist(selectedAnime.mal_id)}
                            onToggleWatchlist={toggleWatchlist}
                        />
                    </div>
                ) : (
                    <>

                        {/* Sidebar Filters */}
                        <aside
                            className={`filters sidebar-panel ${showMobileFilters ? 'show-mobile' : ''}`}
                        >
                            <div className="md:hidden flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                                <h3 className="text-lg font-bold">Filtres</h3>
                                <button onClick={() => setShowMobileFilters(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>✕</button>
                            </div>

                            <div style={{
                                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #8b5cf6 100%)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '1.5rem',
                                boxShadow: 'var(--glow-shadow)'
                            }}>
                                <button
                                    onClick={(e) => { e.preventDefault(); handleSurpriseMe(); setShowMobileFilters(false); }}
                                    style={{
                                        width: '100%',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Star size={18} fill="white" />
                                    {t.surprise}
                                </button>
                            </div>

                            {/* Filter Header */}
                            <div className="flex items-center gap-sm desktop-only" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                <Filter size={20} color="var(--accent-primary)" />
                                <h3>{t.filters}</h3>
                            </div>

                            {/* Platform Filter */}
                            <div className="filter-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>{t.platform}</h4>
                                <MultiSelect
                                    options={PLATFORMS.map(p => ({ id: p.id, name: p.name }))}
                                    selectedValues={selectedPlatforms}
                                    onChange={togglePlatform}
                                    placeholder={lang === 'fr' ? "Toutes les plateformes" : "All Platforms"}
                                />
                            </div>

                            <div className="filter-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>{t.genres}</h4>
                                <MultiSelect
                                    options={genres
                                        .filter(g => MAIN_GENRES.includes(g.name))
                                        .map(g => ({
                                            id: g.mal_id,
                                            name: getLocalizedGenre(g.name, lang)
                                        }))
                                        .sort((a, b) => a.name.localeCompare(b.name))}
                                    selectedValues={selectedGenres}
                                    onChange={toggleGenre}
                                    placeholder={lang === 'fr' ? "Tous les genres" : "All Genres"}
                                />
                            </div>



                            {/* Type/Format Filter (New) */}
                            <div className="filter-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>{t.format}</h4>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    style={{ width: '100%', padding: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                                >
                                    <option value="">{t.allFormats}</option>
                                    <option value="tv">{t.formatTV}</option>
                                    <option value="movie">{t.formatMovie}</option>
                                    <option value="ova">OVA</option>
                                    <option value="special">Special</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="filter-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>{t.status}</h4>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    style={{ width: '100%', padding: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                                >
                                    <option value="">{t.allStatus}</option>
                                    <option value="airing">{t.statusAiring}</option>
                                    <option value="complete">{t.statusComplete}</option>
                                    <option value="upcoming">{t.statusUpcoming}</option>
                                </select>
                            </div>

                            {/* VF Filter */}
                            <div className="filter-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label className="flex items-center gap-sm" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                                    <input
                                        type="checkbox"
                                        checked={vfOnly}
                                        onChange={(e) => setVfOnly(e.target.checked)}
                                        style={{ accentColor: 'var(--accent-primary)' }}
                                    />
                                    {t.availableVF}
                                </label>
                            </div>

                            {/* Min Score Filter */}
                            <div className="filter-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>{t.minScore} ({minScore ? minScore : '0'})</h4>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="1"
                                    value={minScore || 0}
                                    onChange={(e) => setMinScore(e.target.value)}
                                    style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                                />
                            </div>

                            {/* Apply Button (Mobile Only shortcut) */}
                            <div className="md:hidden mt-4 pt-4 border-t border-gray-700">
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Fermer
                                </button>
                            </div>

                        </aside>

                        {/* Results Grid */}
                        <section className="results">
                            {/* Hero Banner (In-Content) */}
                            {!loading && featuredAnime && !selectedAnime && (
                                <HeroBanner
                                    anime={featuredAnime}
                                    bannerUrl={featuredBannerUrl}
                                    onClick={() => setSelectedAnime(featuredAnime)}
                                    lang={lang}
                                />
                            )}

                            <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <h2 style={{ fontSize: '1.25rem' }}>
                                    {searchQuery ?
                                        (searchMode === 'similar' ? `${lang === 'fr' ? 'Animes similaires à' : 'Anime similar to'} "${searchQuery}"` :
                                            searchMode === 'vibe' ? `${lang === 'fr' ? 'Ambiance' : 'Vibe'} "${searchQuery}"` :
                                                `${t.searchResults} "${searchQuery}"`)
                                        : t.popularResults}
                                </h2>

                                <div className="flex items-center gap-sm">
                                    {/* Watchlist Toggle */}
                                    <button
                                        onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${showWatchlistOnly ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/5 text-slate-400'}`}
                                        style={{
                                            marginRight: '12px',
                                            background: showWatchlistOnly ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                                            color: showWatchlistOnly ? '#f87171' : 'var(--text-secondary)',
                                            border: showWatchlistOnly ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
                                            borderRadius: '8px',
                                            padding: '6px 12px'
                                        }}
                                        title={showWatchlistOnly ? "Voir tout" : "Voir mes favoris"}
                                    >
                                        <Heart size={20} className={showWatchlistOnly ? "fill-current" : ""} />
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem', display: window.innerWidth < 640 ? 'none' : 'inline' }}>
                                            {showWatchlistOnly ? (lang === 'fr' ? 'Favoris' : 'Favorites') : (lang === 'fr' ? 'Favoris' : 'Favorites')}
                                        </span>
                                    </button>

                                    {loading && <Loader2 className="animate-spin" size={24} style={{ marginRight: '8px' }} />}

                                    {/* Grid Controls (Hidden on small mobile if needed, but useful) */}
                                    <div className="flex bg-secondary rounded-lg p-1 gap-1" style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '4px', display: 'flex', alignItems: 'center' }}>
                                        <button
                                            onClick={() => setGridColumns(prev => Math.max(1, prev - 1))} // Allows going down to 1
                                            disabled={gridColumns <= 1}
                                            style={{
                                                padding: '6px',
                                                borderRadius: '6px',
                                                background: 'transparent',
                                                color: gridColumns <= 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                                                border: 'none',
                                                cursor: gridColumns <= 1 ? 'default' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                            title="Plus grand (Zoom In)"
                                        >
                                            <ZoomIn size={20} />
                                        </button>
                                        <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 4px' }}></div>
                                        <button
                                            onClick={() => setGridColumns(prev => Math.min(8, prev + 1))}
                                            disabled={gridColumns >= 8}
                                            style={{
                                                padding: '6px',
                                                borderRadius: '6px',
                                                background: 'transparent',
                                                color: gridColumns >= 8 ? 'var(--text-muted)' : 'var(--text-secondary)',
                                                border: 'none',
                                                cursor: gridColumns >= 8 ? 'default' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                            title="Plus petit (Zoom Out)"
                                        >
                                            <ZoomOut size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {loading && !isFetchingMore && animes.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>{t.loading}</div>
                            ) : animes.length === 0 ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '60px 20px',
                                    color: 'var(--text-secondary)',
                                    textAlign: 'center'
                                }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{t.noResults}</h3>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Essayez d'autres mots-clés ou vérifiez l'orthographe.</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                                        gap: 'var(--spacing-md)'
                                    }}>
                                        {(showWatchlistOnly ? watchlist : animes).map((anime, index) => (
                                            <AnimeCard3D
                                                key={`${anime.mal_id}-${index}`}
                                                anime={anime}
                                                onClick={() => setSelectedAnime(anime)}
                                                gridColumns={gridColumns}
                                                lang={lang}
                                                isFavorite={isInWatchlist(anime.mal_id)}
                                                onToggleWatchlist={toggleWatchlist}
                                            />
                                        ))}
                                    </div>


                                    {/* Infinite Scroll Sentinel */}
                                    <div id="scroll-sentinel" style={{ height: '40px', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        {isFetchingMore && <Loader2 className="animate-spin" size={24} color="var(--accent-primary)" />}
                                        {!hasNextPage && animes.length > 0 && (
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fin des résultats</span>
                                        )}
                                    </div>
                                </>
                            )}
                        </section>
                    </>
                )
                }

            </main>
            <Footer lang={lang} />
            <Analytics />
        </div>
    );
}

export default App;
