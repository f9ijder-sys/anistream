import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ASHDI_ANIME } from '@/lib/ashdi';

const AshdiPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const anime = ASHDI_ANIME.find(a => a.id === Number(id));

  if (!anime) {
    return (
      <div style={{ padding: '2rem', color: '#fff', textAlign: 'center' }}>
        <p>Аніме не знайдено</p>
        <Link to="/" style={{ color: '#e50914' }}>← На головну</Link>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0a0f', 
      color: '#fff',
      padding: '1rem'
    }}>
      <Link to="/" style={{ 
        color: '#aaa', 
        textDecoration: 'none', 
        fontSize: '0.9rem',
        display: 'inline-block',
        marginBottom: '1rem'
      }}>← На головну</Link>

      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>
        {anime.titleUa}
      </h1>
      <p style={{ color: '#aaa', marginBottom: '1rem' }}>
        {anime.title} • {anime.year} • 🇺🇦 Українська озвучка
      </p>

      {/* Player */}
      <div style={{
        width: '100%',
        maxWidth: '960px',
        aspectRatio: '16/9',
        background: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '1.5rem'
      }}>
        <iframe
          src={anime.embedUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          scrolling="no"
          style={{ display: 'block', border: 'none' }}
          title={anime.titleUa}
          allow="autoplay; fullscreen"
        />
      </div>

      {/* Info */}
      <div style={{ maxWidth: '960px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          flexWrap: 'wrap',
          marginBottom: '1rem' 
        }}>
          {anime.genres.map(g => (
            <span key={g} style={{
              background: '#333',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              color: '#ccc'
            }}>{g}</span>
          ))}
        </div>
        <p style={{ color: '#ccc', lineHeight: 1.6 }}>{anime.description}</p>
      </div>
    </div>
  );
};

export default AshdiPage;
