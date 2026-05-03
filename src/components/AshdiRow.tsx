import React from 'react';
import { Link } from 'react-router-dom';
import { ASHDI_ANIME } from '@/lib/ashdi';

const AshdiRow: React.FC = () => {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ 
        fontSize: '1.4rem', 
        fontWeight: 700, 
        marginBottom: '1rem',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        🇺🇦 Українська озвучка
      </h2>
      <div style={{
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        scrollbarWidth: 'thin',
        scrollbarColor: '#555 transparent'
      }}>
        {ASHDI_ANIME.map(anime => (
          <Link
            key={anime.id}
            to={`/ashdi/${anime.id}`}
            style={{ textDecoration: 'none', flexShrink: 0 }}
          >
            <div
              style={{
                width: '140px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={anime.posterUrl}
                  alt={anime.title}
                  style={{
                    width: '140px',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    display: 'block'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/140x200/1a1a2e/ffffff?text=Anime';
                  }}
                />
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  left: '6px',
                  background: 'rgba(0,0,0,0.75)',
                  borderRadius: '4px',
                  padding: '2px 5px',
                  fontSize: '0.7rem',
                  color: '#fff'
                }}>🇺🇦 УКР</span>
              </div>
              <p style={{
                color: '#fff',
                fontSize: '0.8rem',
                marginTop: '0.4rem',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{anime.titleUa}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default AshdiRow;
