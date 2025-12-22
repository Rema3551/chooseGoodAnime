import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Heart, Loader2, Grid, LayoutGrid, Columns, Palette, Moon, Sun } from 'lucide-react';

import { getTopAnime, searchAnime, getAnimeGenres, searchAniList, getAnimeRecommendations } from './services/api';
import AnimeDetails from './components/AnimeDetails';
import SurpriseReveal from './components/SurpriseReveal';
import MultiSelect from './components/MultiSelect';
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
        vibeSearchPlaceholder: "Recherche par ambiance (ex: personnage surpuissant donjon...)"
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
    const [selectedStatus, setSelectedStatus] = useState('');
    const [minScore, setMinScore] = useState('');
    const [vfOnly, setVfOnly] = useState(false);

    // View States
    const [selectedAnime, setSelectedAnime] = useState(null);
    const [surpriseMode, setSurpriseMode] = useState(false);
    const [searchMode, setSearchMode] = useState('title'); // 'title', 'vibe', 'similar'

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
    const [gridColumns, setGridColumns] = useState(5); // Default 5

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
    }, [animes, loading, isFetchingMore, hasNextPage]); // Re-attach when list changes

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
            // Don't clear animes immediately if we want smooth transition? 
            // Better to clear to avoid confusion.
            // setAnimes([]); 
        }

        // Reset selection to show results (only on new search)
        if (isNewSearch) setSelectedAnime(null);

        try {
            let newAnimes = [];
            let hasNext = false;

            if (searchQuery.trim() !== '') {
                if (searchMode === 'vibe') {
                    // MODE: VIBE SEARCH
                    const results = await searchAniList(searchQuery, nextPage);
                    newAnimes = results.data || [];
                    hasNext = results.pagination?.has_next_page || false;
                } else if (searchMode === 'similar') {
                    // MODE: SIMILAR SEARCH
                    // 1. Find the anime ID first (Standard Search)
                    const searchRes = await searchAnime(searchQuery);
                    const candidates = searchRes.data || [];
                    if (candidates.length > 0) {
                        const targetId = candidates[0].mal_id;
                        console.log(`Finding similar to: ${candidates[0].title} (${targetId})`);
                        // 2. Get Recommendations
                        const recs = await getAnimeRecommendations(targetId);
                        newAnimes = recs;
                        hasNext = false; // Recommendations endpoint is not paginated usually
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
            <header style={{
                borderBottom: '1px solid var(--border-color)',
                padding: 'var(--spacing-sm) 0',
                position: 'sticky',
                top: 0,
                backgroundColor: 'var(--bg-secondary)', // Use bg-secondary for header
                zIndex: 10
            }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '20px' }}>
                    <div className="logo flex items-center gap-sm">
                        <h1
                            onClick={() => setSelectedAnime(null)}
                            style={{ fontSize: '1.5rem', background: 'linear-gradient(to right, var(--accent-primary), var(--text-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            ChooseGoodAnime
                        </h1>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full">
                        {/* Search Mode Tabs */}
                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={() => { setSearchMode('title'); setSearchQuery(''); }}
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: '16px',
                                    fontSize: '0.8rem',
                                    background: searchMode === 'title' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                    color: searchMode === 'title' ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: 'bold'
                                }}
                            >
                                🔍 {t.searchPlaceholder}
                            </button>
                            <button
                                onClick={() => { setSearchMode('vibe'); setSearchQuery(''); }}
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: '16px',
                                    fontSize: '0.8rem',
                                    background: searchMode === 'vibe' ? 'linear-gradient(45deg, #FF6B6B, #FF8E53)' : 'var(--bg-secondary)',
                                    color: searchMode === 'vibe' ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: 'bold'
                                }}
                            >
                                ✨ {lang === 'fr' ? 'Par Ambiance' : 'By Vibe'}
                            </button>
                            <button
                                onClick={() => { setSearchMode('similar'); setSearchQuery(''); }}
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: '16px',
                                    fontSize: '0.8rem',
                                    background: searchMode === 'similar' ? 'var(--accent-primary)' : 'var(--bg-secondary)', // Different color?
                                    color: searchMode === 'similar' ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: 'bold'
                                }}
                            >
                                👯 {lang === 'fr' ? 'Similaire à...' : 'Similar to...'}
                            </button>
                        </div>

                        <form onSubmit={handleSearch} className="search-bar" style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'var(--bg-secondary)',
                            padding: '10px 20px',
                            borderRadius: 'var(--radius-lg)',
                            width: '100%',
                            maxWidth: '600px', // Increased max-width for prominence
                            border: searchMode === 'vibe' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            <Search size={20} color="var(--text-secondary)" />
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
                                    fontSize: '1rem'
                                }}
                            />
                        </form>
                    </div>

                    <div className="user-actions flex items-center gap-md" style={{ justifyContent: 'flex-end' }}>
                        {/* Day/Night Toggle */}
                        <button
                            onClick={() => setCurrentTheme(currentTheme === 'theme-midnight' ? 'theme-daylight' : 'theme-midnight')}
                            style={{
                                color: 'var(--text-primary)',
                                padding: '8px',
                                background: 'var(--bg-card)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--border-color)'
                            }}
                            title={currentTheme === 'theme-midnight' ? "Switch to Day Mode" : "Passer en Mode Nuit"}
                        >
                            {currentTheme === 'theme-midnight' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button style={{ color: 'var(--text-primary)' }} onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
                            {lang === 'fr' ? '🇺🇸 EN' : '🇫🇷 FR'}
                        </button>
                        <button style={{ color: 'var(--text-primary)' }}>{t.connect}</button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container layout-grid" style={{ paddingTop: '2rem' }}>

                {selectedAnime ? (
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
                        />
                    </div>
                ) : (
                    <>
                        {/* Sidebar Filters */}
                        <aside className="filters sidebar-panel">
                            <div style={{
                                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #8b5cf6 100%)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '1.5rem',
                                boxShadow: 'var(--glow-shadow)'
                            }}>
                                <button
                                    onClick={(e) => { e.preventDefault(); handleSurpriseMe(); }}
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
                            <div className="flex items-center gap-sm" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
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





                        </aside>

                        {/* Results Grid */}
                        <section className="results">
                            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <h2>
                                    {searchQuery ?
                                        (searchMode === 'similar' ? `${lang === 'fr' ? 'Animes similaires à' : 'Anime similar to'} "${searchQuery}"` :
                                            searchMode === 'vibe' ? `${lang === 'fr' ? 'Ambiance' : 'Vibe'} "${searchQuery}"` :
                                                `${t.searchResults} "${searchQuery}"`)
                                        : t.popularResults}
                                </h2>

                                <div className="flex items-center gap-sm">
                                    {/* Grid Controls */}
                                    <div className="flex bg-secondary rounded-lg p-1" style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '4px' }}>
                                        {[2, 4, 6, 8].map(cols => (
                                            <button
                                                key={cols}
                                                onClick={() => setGridColumns(cols)}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    background: gridColumns === cols ? 'var(--accent-primary)' : 'transparent',
                                                    color: gridColumns === cols ? 'white' : 'var(--text-secondary)',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.8rem'
                                                }}
                                                title={`${cols} columns`}
                                            >
                                                {cols}
                                            </button>
                                        ))}
                                    </div>

                                    {loading && <Loader2 className="animate-spin" size={24} />}
                                </div>
                            </div>

                            {loading && !isFetchingMore && animes.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>{t.loading}</div>
                            ) : (
                                <>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`, // Dynamic columns
                                        gap: 'var(--spacing-md)'
                                    }}>
                                        {animes.map(anime => (
                                            <div key={anime.mal_id}
                                                onClick={() => setSelectedAnime(anime)}
                                                className="anime-card" style={{
                                                    background: 'var(--bg-card)',
                                                    borderRadius: 'var(--radius-md)',
                                                    overflow: 'hidden',
                                                    transition: 'transform 0.2s',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}>
                                                <div style={{ aspectRatio: '2/3', background: '#333', position: 'relative' }}>
                                                    <img
                                                        src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                                                        alt={anime.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        loading="lazy"
                                                    />
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '8px',
                                                        right: '8px',
                                                        background: 'rgba(0,0,0,0.8)',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold',
                                                        color: '#fff'
                                                    }}>
                                                        <Star size={12} fill="#ffc107" color="#ffc107" />
                                                        {anime.score || 'N/A'}
                                                    </div>
                                                </div>
                                                <div style={{ padding: 'var(--spacing-sm)', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <h3 style={{ fontSize: gridColumns >= 6 ? '0.8rem' : '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '4px' }} title={anime.title_english || anime.title}>
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
                )}

            </main>
        </div>
    );
}

export default App;
