import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, RotateCw, Play, X } from 'lucide-react';

const SurpriseReveal = ({ anime, onBack, onSpinAgain, t }) => {
    // We kept it simple: render immediately.
    // Use motion for simple entrance effects that don't block visibility if they fail.

    if (!anime) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 10000, // Very high Z-Index
            background: 'radial-gradient(circle at center, #2a2a40 0%, #1a1a2e 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>

            {/* Background Image Blurred - Standard IMG for reliability */}
            <img
                src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'blur(20px) brightness(0.5)',
                    zIndex: -1,
                    opacity: 0.3
                }}
                alt="background"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '24px',
                    padding: '30px',
                    maxWidth: '900px',
                    width: '90%',
                    maxHeight: '90vh', // Prevent overflow on small screens
                    overflowY: 'auto', // Scroll if needed
                    display: 'grid',
                    gridTemplateColumns: 'minmax(200px, 300px) 1fr', // Responsive grid
                    gap: '30px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    position: 'relative'
                }}
            >
                {/* Image */}
                <img
                    src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || 'https://placehold.co/300x450?text=No+Image'}
                    alt={anime.title}
                    style={{ width: '100%', height: 'auto', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', objectFit: 'cover' }}
                />

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        {anime.title_english || anime.title}
                    </h1>

                    <div className="flex gap-sm" style={{ marginBottom: '20px', flexWrap: 'wrap' }}>
                        {anime.genres?.slice(0, 3).map(g => (
                            <span key={g.mal_id} style={{
                                background: 'rgba(255,255,255,0.2)',
                                padding: '4px 12px',
                                borderRadius: '100px',
                                fontSize: '0.9rem',
                                color: 'white',
                                marginBottom: '4px'
                            }}>
                                {g.name}
                            </span>
                        ))}
                        <span style={{ color: '#ffc107', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px' }}>
                            <Star size={16} fill="#ffc107" /> {anime.score || 'N/A'}
                        </span>
                    </div>

                    <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.6', marginBottom: '30px', maxHeight: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {anime.synopsis?.substring(0, 300)}...
                    </p>

                    {/* Actions */}
                    <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                        <button
                            onClick={onBack}
                            style={{
                                background: 'white',
                                color: 'black',
                                padding: '12px 24px',
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                border: 'none',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 15px rgba(255,255,255,0.3)'
                            }}
                        >
                            <Play size={20} fill="black" />
                            Voir la fiche
                        </button>

                        <button
                            onClick={onSpinAgain}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                border: '1px solid rgba(255,255,255,0.3)',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <RotateCw size={20} />
                            Encore !
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Explicit Close Button */}
            <button
                onClick={onBack}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '25px',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(5px)',
                    zIndex: 10001
                }}
            >
                <X size={28} />
            </button>
        </div>
    );
};

export default SurpriseReveal;
