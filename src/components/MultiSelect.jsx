
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const MultiSelect = ({ label, options, selectedValues, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Toggle logic
    const handleToggle = (id) => {
        onChange(id);
    };

    // Display text logic
    const getDisplayText = () => {
        if (selectedValues.length === 0) return placeholder;
        if (selectedValues.length === 1) {
            const item = options.find(o => o.id === selectedValues[0]);
            return item ? item.name : placeholder;
        }
        return `${selectedValues.length} sélectionné(s)`;
    };

    return (
        <div className="multi-select" ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
            {/* Trigger Button (Looks like Select) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '10px',
                    background: 'var(--bg-secondary)',
                    color: selectedValues.length > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.9rem',
                    boxShadow: isOpen ? '0 0 0 2px var(--accent-primary)' : 'none',
                    transition: 'all 0.2s'
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getDisplayText()}
                </span>
                <ChevronDown size={16} />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '120%', /* Space below trigger */
                    left: 0,
                    right: 0,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    padding: '0.5rem'
                }}>
                    {options.map(option => {
                        const isSelected = selectedValues.includes(option.id);
                        return (
                            <div
                                key={option.id}
                                onClick={() => handleToggle(option.id)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                                    marginBottom: '2px',
                                    fontSize: '0.9rem'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    border: isSelected ? 'none' : '2px solid var(--text-secondary)',
                                    background: isSelected ? 'var(--accent-primary)' : 'transparent',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {isSelected && <Check size={12} color="white" />}
                                </div>
                                <span style={{ fontWeight: isSelected ? '600' : '400' }}>{option.name}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
