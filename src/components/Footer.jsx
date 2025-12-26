import React from 'react';
import { MessageCircle, Heart, Github } from 'lucide-react';

const Footer = ({ lang }) => {
    return (
        <footer style={{
            marginTop: 'auto',
            padding: '40px 20px',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            position: 'relative',
            zIndex: 10
        }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

                {/* Brand / Logo Small */}
                <div style={{ opacity: 0.8, fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                    CHOOSE GOOD ANIME
                </div>

                {/* Social Links */}
                <div style={{ display: 'flex', gap: '20px' }}>
                    <a
                        href="https://discord.gg/your-invite-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: '#5865F2', // Discord Blurple
                            color: 'white',
                            borderRadius: '8px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 15px rgba(88, 101, 242, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <MessageCircle size={20} />
                        {lang === 'fr' ? 'Rejoindre le Discord' : 'Join Discord'}
                    </a>
                </div>

                {/* Copyright / Credits */}
                <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginTop: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <p>
                        {lang === 'fr' ? 'Fait avec' : 'Made with'} <Heart size={14} color="#ef4444" fill="#ef4444" style={{ display: 'inline', verticalAlign: 'middle' }} /> {lang === 'fr' ? 'par la communauté' : 'by the community'}
                    </p>
                    <p style={{ opacity: 0.5 }}>
                        &copy; {new Date().getFullYear()} ChooseGoodAnime. Data provided by Jikan (MyAnimeList) & AniList.
                    </p>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
