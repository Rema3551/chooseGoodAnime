
import React, { useState, useRef, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    pointerWithin,
    rectIntersection,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    useDroppable,
    useDraggable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import html2canvas from 'html2canvas';
import { Search, Download, Sparkles, Trash2, Plus } from 'lucide-react';
import { searchAnime, getAnimeRecommendations, getAnimeById, getTopAnime } from '../services/api';

// --- Components ---

const SortableItem = ({ id, anime, compact = false }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none' // Important for dnd-kit on mobile/touch
    };

    if (compact) {
        // Small square for Tier Rows
        return (
            <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="tier-item">
                <img src={anime.images.jpg.large_image_url} alt={anime.title}
                    draggable={false} // Disable native drag
                />
            </div>
        );
    }

    // Bank Item
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bank-item">
            <div style={{ position: 'relative', width: '100px', height: '140px' }}>
                <img src={anime.images.jpg.large_image_url} alt={anime.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                    draggable={false}
                />
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, width: '100%',
                    background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '10px',
                    padding: '2px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                    {anime.title}
                </div>
            </div>
        </div>
    );
};

const DraggableRecommendation = ({ anime, addToBank }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `rec-${anime.mal_id}`,
        data: anime,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        cursor: 'grabbing',
    } : { cursor: 'grab' };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}
            className="recommendation-card"
            onClick={() => addToBank(anime)}
        >
            <div style={{ position: 'relative', width: '160px' }}>
                <img src={anime.images.jpg.large_image_url} alt={anime.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '0.5rem', pointerEvents: 'none' }} />
                <div style={{
                    position: 'absolute', top: 5, right: 5,
                    background: 'var(--accent-primary)', borderRadius: '50%',
                    width: '24px', height: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                    <Plus size={16} color="white" />
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', pointerEvents: 'none' }}>{anime.title}</h4>
            </div>
        </div>
    );
};

const TierRow = ({ tier, items }) => {
    const { setNodeRef } = useDroppable({
        id: tier.id,
    });

    return (
        <div className="tier-row">
            {/* Header Label */}
            <div className="tier-label" style={{ background: tier.color }}>
                {tier.label}
            </div>

            {/* Droppable Area */}
            <div ref={setNodeRef} className="tier-content">
                <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                    {items.map(item => (
                        <SortableItem key={item.id} id={item.id} anime={item.data} compact />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

// --- Main Component ---

const BankDroppable = ({ items, removeFromList }) => {
    const { setNodeRef } = useDroppable({
        id: 'bank',
    });

    const bankItems = items.filter(i => i.tier === 'bank');

    return (
        <div ref={setNodeRef} style={{
            minHeight: '300px',
            border: '2px dashed var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'var(--bg-card)'
        }}>
            <SortableContext items={bankItems.map(i => i.id)} strategy={rectSortingStrategy}>
                {bankItems.map(item => (
                    <div key={item.id} style={{ position: 'relative' }}>
                        <SortableItem id={item.id} anime={item.data} />
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // prevent drag start?
                                removeFromList(item.id);
                            }}
                            onPointerDown={e => e.stopPropagation()} // Vital for dnd-kit to not pickup drag on button
                            style={{
                                position: 'absolute', top: -8, right: -8,
                                background: 'var(--error)',
                                borderRadius: '50%', width: '24px', height: '24px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid var(--bg-card)', cursor: 'pointer', zIndex: 10,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}
                        >
                            <Trash2 size={14} color="white" />
                        </button>
                    </div>
                ))}
            </SortableContext>
            {bankItems.length === 0 && (
                <div style={{ width: '100%', height: '100%', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', opacity: 0.5 }}>
                    <Search size={48} />
                    <span>Bank is empty. Search for anime above!</span>
                </div>
            )}
        </div>
    );
};

const TIERS = [
    { id: 'S', label: 'S', color: '#ff7f7f' },
    { id: 'A', label: 'A', color: '#ffbf7f' },
    { id: 'B', label: 'B', color: '#ffdf7f' },
    { id: 'C', label: 'C', color: '#ffff7f' },
    { id: 'D', label: 'D', color: '#bfff7f' } // Actually usually green is top, but standard Tiermaker is Red->Green. S is Red.
];

export default function TierListMaker({ t, lang }) {
    // State items: { id: 'mal_id', tier: 'S'|'A'|...|'bank', data: fullAnimeObject }
    const [items, setItems] = useState([]);

    // Bank Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Recommendations
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [currentTopAnimePage, setCurrentTopAnimePage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Initial Population
    // Initial Population
    useEffect(() => {
        const initializeBank = async () => {
            if (items.length > 0) return;

            setInitializing(true);
            try {
                // Fetch top anime by popularity
                const topAnimeData = await getTopAnime(1, 'bypopularity');
                if (topAnimeData && topAnimeData.data) {
                    const top20 = topAnimeData.data.slice(0, 20);

                    const newItems = top20.map(anime => ({
                        id: String(anime.mal_id),
                        tier: 'bank',
                        data: anime
                    }));

                    setItems(prev => [...prev, ...newItems]);
                    setCurrentTopAnimePage(2); // Next page for future
                }
            } catch (err) {
                console.error("Failed to initialize bank with top anime", err);
            } finally {
                setInitializing(false);
            }
        };

        initializeBank();
    }, []); // Run once on mount

    // Auto-refill Bank
    useEffect(() => {
        const checkAndRefillBank = async () => {
            const bankCount = items.filter(i => i.tier === 'bank').length;

            if (bankCount < 5 && !isLoadingMore && !initializing) {
                setIsLoadingMore(true);


                try {
                    const topAnimeData = await getTopAnime(currentTopAnimePage, 'bypopularity');
                    if (topAnimeData && topAnimeData.data) {
                        const newRawItems = topAnimeData.data;

                        // Filter duplicates
                        const uniqueNewItems = newRawItems.filter(anime =>
                            !items.some(existing => existing.id === String(anime.mal_id))
                        );

                        const formattedItems = uniqueNewItems.map(anime => ({
                            id: String(anime.mal_id),
                            tier: 'bank',
                            data: anime
                        }));

                        if (formattedItems.length > 0) {
                            setItems(prev => [...prev, ...formattedItems]);
                            setCurrentTopAnimePage(prev => prev + 1);
                        } else {
                            // Loop protection if page returned only duplicates? try next page
                            setCurrentTopAnimePage(prev => prev + 1);
                        }
                    }
                } catch (err) {
                    console.error("Error auto-refilling bank", err);
                } finally {
                    setIsLoadingMore(false);
                }
            }
        };

        const timeout = setTimeout(checkAndRefillBank, 1000); // 1s Debounce check to let state settle
        return () => clearTimeout(timeout);

    }, [items, currentTopAnimePage, isLoadingMore, initializing]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drags
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await searchAnime(searchQuery, { limit: 5 });
            setSearchResults(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const addToBank = (anime) => {
        if (items.some(i => i.id === String(anime.mal_id))) return; // No duplicates
        setItems(prev => [...prev, { id: String(anime.mal_id), tier: 'bank', data: anime }]);
        setSearchResults([]); // Clear search
        setSearchQuery('');
    };

    const removeFromList = (id) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    // Drag Logic
    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        // Find container item is hovering over
        const activeId = active.id;
        const overId = over.id;

        // If hovering over a tier container directly (we need droppable containers for empty rows)
        // Implementation cheat: We treat the "TierRow" SortableContext as the container. 
        // But dnd-kit sortable expects items.
        // We will do a simpler approach: "items" state holds the truth.
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;



        // Determine destination tier
        // If "over" is a Tier ID (S, A, B...) or 'bank', move to that tier
        let newTier = null;
        if (TIERS.some(t => t.id === overId) || overId === 'bank') {
            newTier = overId;
        } else {
            // Over another item? Find its tier
            const overItem = items.find(i => i.id === overId);
            if (overItem) newTier = overItem.tier;
        }

        if (newTier) {
            setItems(prevItems => {
                const updated = [...prevItems];

                // Check if it's a new recommendation being dragged
                if (String(activeId).startsWith('rec-')) {
                    // It's a recommendation!
                    const recData = active.data.current; // access data passed to useDraggable

                    // Check if already exists (sanity check)
                    if (!updated.some(i => i.id === String(recData.mal_id))) {
                        updated.push({
                            id: String(recData.mal_id),
                            tier: newTier,
                            data: recData
                        });
                        // Optional: could remove from recommendations list here if we passed setRecommendations
                    }
                    return updated;
                }

                // Existing item logic
                const existingIndex = updated.findIndex(i => i.id === activeId);
                if (existingIndex !== -1) {
                    updated[existingIndex] = { ...updated[existingIndex], tier: newTier };
                }
                return updated;
            });
        }
    };

    // NOTE: dnd-kit with multiple containers needs more complex setup than single list. 
    // We need to implement `onDragOver` to handle moving between containers properly for sortable.
    // Simplifying: We will make just dropping onto the specific Tier Zone strict for now, or just use `DragOverlay`.
    // Actually, let's use the standard "Multiple Containers" logic is best.

    // REFACTORING FOR MULTIPLE CONTAINERS SIMPLICITY:
    // We will separate items by tier in render, but state is one big list.


    // Recommendations Logic
    const getRecommendations = async () => {
        // 1. Get S and A tier anime
        const topAnime = items.filter(i => ['S', 'A'].includes(i.tier));

        // Silent return if not enough data, instead of alert
        if (topAnime.length === 0) {
            setRecommendations([]); // clear recs if no top tiers
            return;
        }

        setLoadingRecs(true);
        try {
            // Aggregate similar anime from API
            // We pick random 3 from top tiers to avoid spamming API (rate limit)
            const seed = topAnime.sort(() => 0.5 - Math.random()).slice(0, 3);
            let candidates = [];

            for (const anime of seed) {
                const recs = await getAnimeRecommendations(anime.id);
                // recs returns [{ entry: {mal_id, title...} }]
                candidates = [...candidates, ...recs];
                // Tiny delay
                await new Promise(r => setTimeout(r, 200));
            }

            // Count occurrences (weighted recommendation)
            const counts = {};
            candidates.forEach(c => {
                // Check if already in tier list
                if (items.some(i => i.id === String(c.mal_id))) return;

                const id = c.mal_id;
                if (!counts[id]) counts[id] = { ...c, score: 0 };
                counts[id].score++;
            });

            // Sort by score
            const sorted = Object.values(counts).sort((a, b) => b.score - a.score).slice(0, 5);
            setRecommendations(sorted);

        } catch (e) {
            console.error(e);
        } finally {
            setLoadingRecs(false);
        }
    };

    // Auto-Recommend Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            getRecommendations();
        }, 1500); // 1.5s debounce

        return () => clearTimeout(timer);
    }, [items]); // Re-run when items change

    const exportImage = () => {
        const element = document.getElementById('tier-list-container');
        html2canvas(element, {
            backgroundColor: '#0f172a',
            useCORS: true,
            allowTaint: true,
            scale: 2 // Better quality
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'my-anime-tier-list.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    };

    return (
        <div style={{ padding: '1rem', paddingTop: 0, maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tier List Maker</h1>
                <div className="flex gap-2">
                    <button onClick={exportImage} className="button-secondary flex items-center gap-2">
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            {/* Main Workspace */}
            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragOver={(event) => {
                    const { active, over } = event;
                    if (!over) return;
                    // Real-time drag over logic to move items between lists locally before commit?
                    // For simplicity in this non-library-expert mode:
                    // We just use dragEnd to commit. 
                }}
                onDragEnd={handleDragEnd}
            >
                <div className="tier-list-grid" style={{}}>

                    {/* Tiers Column */}
                    <div id="tier-list-container" style={{ padding: '24px', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                        {TIERS.map(tier => (
                            <TierRow
                                key={tier.id}
                                tier={tier}
                                items={items.filter(i => i.tier === tier.id)}
                            />
                        ))}
                    </div>

                    {/* Bank Column */}
                    <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', height: 'fit-content' }}>
                        <h3 className="font-bold mb-4">Anime Bank</h3>

                        {/* Search */}
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Add anime..."
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        paddingRight: '40px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.95rem',
                                        transition: 'border-color 0.2s',
                                        outline: 'none'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                                <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            </div>
                            <button type="submit" style={{
                                padding: '0 16px',
                                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)'
                            }}>
                                <Plus size={20} color="white" />
                            </button>
                        </form>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div style={{
                                marginBottom: '1rem',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                padding: '8px',
                                borderRadius: '8px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                marginTop: '-0.5rem',
                                position: 'relative',
                                zIndex: 50,
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                            }}>
                                {searchResults.map(anime => (
                                    <div key={anime.mal_id}
                                        onClick={() => addToBank(anime)}
                                        className="search-result-item"
                                        style={{
                                            display: 'flex',
                                            gap: '12px',
                                            padding: '8px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--border-color)',
                                            alignItems: 'center',
                                            transition: 'background 0.2s',
                                            borderRadius: '4px'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <img src={anime.images.jpg.small_image_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{anime.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Unranked Items (Droppable) */}
                        <BankDroppable items={items} removeFromList={removeFromList} />

                    </div>
                </div>

                <DragOverlay>
                    {/* Render ghost item when dragging */}
                    <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}></div>
                </DragOverlay>
            </DndContext>

            {/* Recommendations Modal/Section */}
            {recommendations.length > 0 && (
                <div style={{ marginTop: '3rem', animation: 'fadeIn 0.5s' }}>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Sparkles color="#FFD700" /> Recommended for You
                    </h2>
                    <div className="recommendations-scroll">
                        {recommendations.map(rec => (
                            <DraggableRecommendation key={rec.mal_id} anime={rec} addToBank={addToBank} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
