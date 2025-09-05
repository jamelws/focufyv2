'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaBackward, FaForward, FaPlay, FaPause } from 'react-icons/fa';
import Image from 'next/image';

export default function MusicPlayer({ song, musicSet, songCount, isPlaying, onPlayPause, currentIndex, onNext, onPrev, isNextDisabled, isPrevDisabled }) {
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState("0:00");
  const [durationFormatted, setDurationFormatted] = useState("0:00");
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, song.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setLoading(true);

    const format = (secs) => {
      if (isNaN(secs)) return "0:00";
      const minutes = Math.floor(secs / 60);
      const seconds = Math.floor(secs % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const updateTime = () => {
      const current = audio.currentTime;
      const total = audio.duration;
      setCurrentTimeFormatted(format(current));
      if (total) {
          setDurationFormatted(format(total));
      }
      setProgress(total ? (current / total) * 100 : 0);
    };

    const handleReady = () => {
      setLoading(false);
      updateTime();
    };

    audio.addEventListener("loadedmetadata", handleReady);
    audio.addEventListener("canplaythrough", handleReady);
    audio.addEventListener("timeupdate", updateTime);
    audio.load(); // Forzar la carga de la nueva canción

    return () => {
      audio.removeEventListener("loadedmetadata", handleReady);
      audio.removeEventListener("canplaythrough", handleReady);
      audio.removeEventListener("timeupdate", updateTime);
    };
  }, [song.id]);
  useEffect(() => {
    setMounted(true);
  }, []);

  // 👇 evita errores de hidratación
  if (!mounted) return null;
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.counter}>{musicSet.name}</h3>
        <span style={styles.counter}>Canción {currentIndex + 1} de {songCount}</span>
      </div>

      <div style={styles.imageWrapper}>
        <Image
          src={`/api/song-image?id=${song.id}`}
          alt={song.title || "Song cover"}
          width={180}
          height={208}
          style={styles.image}
          priority
          unoptimized
        />
      </div>

      <div style={styles.info}>
        <h6 style={styles.songName}>{song.title || "Título no disponible"}</h6>
        <p style={styles.artist}>{musicSet.user.name || 'Artista desconocido'}</p>
      </div>

      <div style={styles.progressContainer}>
        <div
          style={{ ...styles.progressBar, ...(isPlaying ? styles.glowEffect : {}) }}
        >
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
        <div style={styles.timeRow}>
          <span>{currentTimeFormatted}</span>
          <span>{durationFormatted}</span>
        </div>
      </div>
      
      {loading && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div className="spinner-border text-light" role="status" />
          <div style={{ fontSize: 12, marginTop: 5 }}>Cargando audio...</div>
        </div>
      )}

      {!loading && (
        <div style={styles.controls}>
          {/* <button
            style={styles.controlBtn}
            onClick={onPrev}
            disabled={isPrevDisabled}
          >
            <FaBackward />
          </button> */}

          <button
            onClick={onPlayPause}
            style={styles.playBtn}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          {/* <button
            style={styles.controlBtn}
            onClick={onNext}
            disabled={isNextDisabled}
          >
            <FaForward />
          </button> */}
        </div>
      )}

      <audio
        ref={audioRef}
        src={`/api/song-audio?id=${song.id}`}
        preload="metadata"
      />
    </div>
  );
}

// (Los estilos permanecen iguales)
const styles = {
  card: {
    width: 300,
    height: 630,
    background: 'linear-gradient(145deg, #1e1e2f, #292940)',
    color: 'white',
    borderRadius: 20,
    padding: 20,
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 4px 20px rgba(233, 174, 238, 1)',
  },
  glowEffect: {
    boxShadow: '0 0 10px 2px white',
    transition: 'box-shadow 0.1s ease-in-out',
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 12,
    color: '#aaa',
  },
  counter: {
    fontWeight: 'bold',
    marginTop: '10px',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: '1/1',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 25,
    marginTop: 25,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  info: {
    textAlign: 'center',
  },
  songName: {
    fontSize: 12,
    margin: '0 0 4px 0',
    height: 50
  },
  artist: {
    fontSize: 13,
    color: '#ccc',
    marginBottom:'20px'
  },
  progressContainer: {
    fontWeight: 'normal'
  },
  progressBar: {
    height: 10,
    backgroundColor: '#444',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    cursor: 'pointer',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(0deg, rgba(233, 174, 238, 1) 0%, rgba(179, 179, 232, 1) 100%)',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  timeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    color: '#bbb',
    marginTop: 20,
  },
  controls: {
    marginTop: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlBtn: {
    backgroundColor: '#333',
    border: 'none',
    color: '#bbb',
    fontSize: 18,
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'flex',           // ✅ flex container
    alignItems: 'center',      // ✅ centra vertical
    justifyContent: 'center'   // ✅ centra horizontal
  },
  playBtn: {
    background: 'linear-gradient(126deg, rgba(174, 163, 227, 1) 0%, rgba(223, 149, 230, 1) 100%)',
    border: 'none',
    color: 'white',
    fontSize: 20,
    width: 55,
    height: 55,
    borderRadius: '50%',
    cursor: 'pointer',

    display: 'flex',           // ✅ flex container
    alignItems: 'center',      // ✅ centra vertical
    justifyContent: 'center'   // ✅ centra horizontal
  },
};