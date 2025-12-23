import React from 'react';
import { Heart } from 'lucide-react';

const WatchlistButton = ({ isFavorite, onToggle, className = '' }) => {
    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle();
            }}
            className={`
                group relative flex items-center justify-center p-2 rounded-full 
                transition-all duration-300 ease-out
                ${isFavorite
                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white hover:scale-110'
                }
                ${className}
            `}
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
            <Heart
                size={20}
                className={`
                    transition-all duration-300
                    ${isFavorite ? 'scale-110' : 'scale-100'}
                `}
                fill={isFavorite ? "currentColor" : "none"}
                strokeWidth={isFavorite ? 0 : 2}
            />

            {/* Ripple/Glow effect on click could be added here if needed */}
        </button>
    );
};

export default WatchlistButton;
