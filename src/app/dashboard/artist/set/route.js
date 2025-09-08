"use client"
import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import Image from "next/image";

export default function MusicSetPage({ set }) {
  const [currentAudio, setCurrentAudio] = useState(null);

  const playSong = (songId) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    const audio = new Audio(`/api/song-audio?id=${songId}`);
    audio.play();
    setCurrentAudio(audio);
  };

  return (
    <Box>
      <Typography variant="h4" mb={2}>{set.name}</Typography>
      <Box mb={3}>
        <Image width={200} height={200}
          src={`/api/set-image?id=${set.id}`}
          alt={set.name}
          style={{ width: 200, height: 200, objectFit: "cover", borderRadius: 8 }}
        />
      </Box>
      {set.songs.length === 0 ? (
        <Typography>No hay canciones en este set.</Typography>
      ) : (
        set.songs.map(song => (
          <Box key={song.id} mb={2} p={2} border={1} borderColor="#ddd" borderRadius={2}>
            <Typography variant="h6">{song.title}</Typography>
            <Button variant="contained" sx={{ mr: 1 }} onClick={() => playSong(song.id)}>
              ▶ Play
            </Button>
            <Button variant="outlined" onClick={() => {
              if (currentAudio) {
                currentAudio.pause();
                setCurrentAudio(null);
              }
            }}>
              ⏹ Stop
            </Button>
          </Box>
        ))
      )}
    </Box>
  );
}
