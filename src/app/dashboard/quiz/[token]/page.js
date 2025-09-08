"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Button, TextField, CircularProgress, Alert } from '@mui/material';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams(); // Hook para obtener parámetros de la URL
  const { token } = params;

  const [share, setShare] = useState(null);
  const [score, setScore] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchQuizData = async () => {
      try {
        const res = await fetch(`/api/quiz/${token}`);
        if (!res.ok) {
          throw new Error('No se pudo cargar la canción. El enlace puede ser inválido o haber expirado.');
        }
        const data = await res.json();
        setShare(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [token]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/respuestas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareTokenId: share.id,
          songId: share.song.id,
          respuestas: [
            { preguntaId: 1, contenido: score },
            { preguntaId: 2, contenido: comments },
          ],
        }),
      });

      if (res.ok) {
        router.push('/listener/my-music');
      } else {
        setError('Error al guardar las respuestas. Inténtalo de nuevo.');
      }
    } catch (err) {
      setError('Error de conexión. Revisa tu red e inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  if (!share) {
    return <Alert severity="warning" sx={{ m: 3 }}>No se encontraron datos para este enlace.</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Evaluar Canción</Typography>
      <Typography variant="h6">{share.song.nombre}</Typography>
      <Typography variant="subtitle1">
        Artista: {share.song.user.nombre}
      </Typography>

      {share.song.url && (
        <audio controls style={{ marginTop: '1rem', width: '100%' }}>
          <source src={share.song.url} type="audio/mpeg" />
          Tu navegador no soporta audio HTML5.
        </audio>
      )}

      <Box mt={3}>
        <TextField
          label="Puntaje (1-10)"
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Comentarios"
          multiline
          rows={4}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Enviando...' : 'Enviar Evaluación'}
        </Button>
      </Box>
    </Box>
  );
}