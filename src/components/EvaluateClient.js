"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Button,
  TextField,
  LinearProgress,
  Slide,
  Divider,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import confetti from "canvas-confetti";

import MultiCard from "@/components/MultiCard";
import RadioCard from "@/components/RadioCard";
import SliderCard from "@/components/SliderCard";
import CheckboxCard from "@/components/CheckboxCard";
import RankingCard from "@/components/RankingCard";
import MusicPlayer from "@/components/MusicPlayer";
import { useSession } from "next-auth/react";

import "@/styles/quiz.css";
import i18n from "@/lib/i18n";

export default function EvaluateClient({ data }) {
  const { data: session } = useSession();
  const [step, setStep] = useState("intro");
  const [responses, setResponses] = useState({});
  const [songIndex, setSongIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [slideIn, setSlideIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [audioPlayingId, setAudioPlayingId] = useState(null);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  const router = useRouter();
  const { t } = useTranslation();

  // 🔴 Error y solicitud de acceso
  const error = data.error || "";
  const [openError, setOpenError] = useState(!!error);
  console.log("data",data);
  useEffect(() => {
    if (data.needRequest) {
      setOpenRequestDialog(true);
    }
  }, [data.needRequest]);

  // ⚡ Mostrar solo error en snackbar
  if (error&& !openRequestDialog) {
    return (
      <Snackbar
        open={openError}
        autoHideDuration={6000}
        onClose={() => setOpenError(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenError(false)} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    );
  }

  // ⚡ Si necesita solicitar acceso → confirm dialog
  if (openRequestDialog) {
    const handleConfirm = async () => {
      try {
        const res = await fetch("/api/sharetokenuser/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenId: data.data.token,
            userId: session.user?.id, // 👈 este id debes enviarlo desde backend al cliente
          }),
        });
        if (!res.ok) throw new Error("Error al enviar solicitud");
        setOpenRequestDialog(false);
        setOpenSuccess(true);
      } catch (err) {
        alert(err.message);
      }
    };

    return (
      <>
        <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)}>
          <DialogTitle>Solicitar acceso</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Quieres solicitar acceso al artista para poder participar en este Focus Group?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRequestDialog(false)} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleConfirm} color="primary" variant="contained">
              Solicitar acceso
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={openSuccess}
          autoHideDuration={6000}
          onClose={() => setOpenSuccess(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" sx={{ width: "100%" }}>
            Solicitud enviada. Espera la aprobación del artista.
          </Alert>
        </Snackbar>
      </>
    );
  }
  
  const musicSet = data.data?.musicSet;
  const songs = musicSet?.songs || [];
  const currentSong = songs[songIndex];
  const questions = currentSong?.songQuestions || [];
  const currentQuestion = questions[questionIndex] || null;

  const songsCount = songs.length;
  const questionsCount = questions.length;

  // 🎉 Confeti
  const fireConfetti = (e) => {
    if (e && typeof e.clientX === "number" && typeof e.clientY === "number") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        },
        colors: ["#ae83e5", "#ffffff", "#f4a261"],
      });
    }
  };

  // Guardar respuestas
  const handleResponseChange = (questionId, value, event) => {
    setResponses((prev) => ({
      ...prev,
      [`${currentSong.id}_${questionId}`]: value,
    }));
    if (event) fireConfetti(event);
  };

  // Componente dinámico para MULTIPLE_CHOICE
  
  const getMultipleChoiceComponent = () => {
    if (!currentQuestion) return null;
    if (currentQuestion.question?.type !== "MULTIPLE_CHOICE") return null;

    const comps = [MultiCard, RadioCard, CheckboxCard, SliderCard];
    const randomIndex = currentQuestion.question.id % comps.length;
    return comps[randomIndex];
  };

  const ComponentMultipleChoice = getMultipleChoiceComponent();


  const navigate = (direction) => {
    setSlideIn(false);
    setTimeout(() => {
      if (direction === "next") {
        if (questionIndex < questionsCount - 1) {
          setQuestionIndex((i) => i + 1);
        } else if (songIndex < songsCount - 1) {
          setSongIndex((i) => i + 1);
          setQuestionIndex(0);
        }
      } else {
        if (questionIndex > 0) {
          setQuestionIndex((i) => i - 1);
        } else if (songIndex > 0) {
          setSongIndex((i) => i - 1);
          setQuestionIndex(questionsCount - 1);
        }
      }
      setSlideIn(true);
    }, 220);
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      const payload = Object.entries(responses).map(([key, value]) => {
        const [songId, questionId] = key.split("_");
        return {
          songId,
          questionId: parseInt(questionId, 10),
          value:
            typeof value === "object" ? JSON.stringify(value) : String(value),
        };
      });

      const res = await fetch("/api/listener/save-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: payload, token: data.data.token }),
      });

      if (!res.ok) throw new Error("Error al enviar respuestas");
      setStep("finished");
    } catch (e) {
      alert(e.message || "Error al enviar");
    } finally {
      setSubmitting(false);
    }
  };

  const questionsProgress = ((questionIndex + 1) / (questionsCount || 1)) * 100;

  const handlePlayPause = (songId) => {
    setAudioPlayingId((prevId) => (prevId === songId ? null : songId));
  };

  const renderQuestion = () => {
    if (!currentQuestion?.question) return null;

    const commonProps = {
      valorRespuesta:
        responses[`${currentSong.id}_${currentQuestion.question.id}`] ?? "",
      handleRespuestaChange: (value, event) =>
        handleResponseChange(currentQuestion.question.id, value, event),
    };

    switch (currentQuestion.question.type) {
      case "TEXT":
        return (
          <>
            <Typography component="legend" sx={{ fontSize: "1.25rem", mb: 1 }}>
              {currentQuestion.question.title}
            </Typography>
            <TextField
              fullWidth
              value={commonProps.valorRespuesta}
              sx={{ mt: 1 }}
              onChange={(e) =>
                handleResponseChange(
                  currentQuestion.question.id,
                  e.target.value
                )
              }
            />
          </>
        );

      case "MULTIPLE_CHOICE":
        const opcionesAdaptadas = currentQuestion.question.options
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((o) => ({ id: o.id, label: o.label,labelEn: o.labelEn,labelFr: o.labelFr, value: o.value }));

        return (
          <>
            <Typography component="legend" sx={{ fontSize: "1.25rem", mb: 1 }}>
              {currentQuestion.question.title}
            </Typography>
            {ComponentMultipleChoice && (
              <ComponentMultipleChoice
                opciones={opcionesAdaptadas}
                pregunta={currentQuestion.question}
                i18n={i18n}
                {...commonProps}
              />
            )}
          </>
        );

      case "SCALE_1_5":
        return (
          <>
            <Typography component="legend" sx={{ fontSize: "1.25rem", mb: 1 }}>
              {currentQuestion.question.title}
            </Typography>
            <RankingCard pregunta={currentQuestion.question} {...commonProps} />
          </>
        );

      default:
        return null;
    }
  };

  // 👉 INTRO
  if (step === "intro") {
    return (
      <Box sx={{ maxHeight: "80vh", overflowY: "auto", p: 2 }}>
        <Typography variant="h5" gutterBottom>{t("intro1")}</Typography>
        <Typography variant="h6" gutterBottom className="text-purple">{t("intro2")}</Typography>
        <Typography variant="body1">{t("intro3")} <br /><br />
          <span className="text-purple"><b>{t("intro3b")}</b>; {t("intro3s")}</span>
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>{t("intro4")}</Typography>

        <List>
          <ListItem>
            <ListItemIcon><LooksOneIcon /></ListItemIcon>
            <ListItemText>{t("intro5t")}
              <Typography variant="body2">{t("intro5d1")}<br />{t("intro5d2")}<br />{t("intro5d3")}</Typography>
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemIcon><LooksTwoIcon /></ListItemIcon>
            <ListItemText>{t("intro6t")}<br />
              <Typography variant="body2">{t("intro6d")}</Typography>
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemIcon><Looks3Icon /></ListItemIcon>
            <ListItemText>{t("intro7t")}
              <Typography variant="body2">{t("intro7d")}</Typography>
            </ListItemText>
          </ListItem>
        </List>

        <List>
          <ListItem>
            <ListItemIcon><CheckCircleOutlineIcon /></ListItemIcon>
            <ListItemText primary={t("introlist1")} />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleOutlineIcon /></ListItemIcon>
            <ListItemText primary={t("introlist2")} />
          </ListItem>
        </List>

        <Typography variant="body2"><b>{t("titleacept")}</b><br />{t("descacept")}</Typography>
        <Typography variant="body2">{t("introthanks")}</Typography>

        <Box mt={3} display="flex" gap={2}>
          <Button variant="contained" size="large" onClick={() => setStep("quiz")}>
            {t("btnTerms")}
          </Button>
        </Box>
      </Box>
    );
  }

  // 👉 QUIZ (si no hay preguntas → solo music player)
  if (step === "quiz") {
    return (
      <Box p={3} mx="auto">
        <Box mb={3}>
          {questionsCount > 0 && (
            <>
              <Typography variant="body2" gutterBottom>
                {t("questionsforsong")}: {questionIndex + 1} / {questionsCount}
              </Typography>
              <LinearProgress variant="determinate" value={questionsProgress} />
              <Divider sx={{ my: 2 }} />
            </>
          )}
        </Box>

        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
          <Box flex={{ md: "0 0 300px" }}>
            <MusicPlayer
              song={currentSong}
              musicSet={musicSet}
              isPlaying={audioPlayingId === currentSong?.id}
              onPlayPause={() => handlePlayPause(currentSong?.id)}
              songCount={songsCount}
              currentIndex={songIndex}
              onNext={() => navigate("next")}
              onPrev={() => navigate("prev")}
              isNextDisabled={songIndex === songsCount - 1 && questionIndex === questionsCount - 1}
              isPrevDisabled={songIndex === 0 && questionIndex === 0}
            />
          </Box>

          {questionsCount > 0 && (
            <Box flex="1" sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2, bgcolor: "background.paper" }}>
              <Slide in={slideIn} direction="left" mountOnEnter unmountOnExit>
                <Box>{renderQuestion()}</Box>
              </Slide>

              <Box mt={3} display="flex" justifyContent="space-between" gap={1}>
                <Button variant="outlined" color="secondary" onClick={() => navigate("prev")}
                  disabled={songIndex === 0 && questionIndex === 0}>
                  {t("prevbtn")}
                </Button>

                {songIndex === songsCount - 1 && questionIndex === questionsCount - 1 ? (
                  <Button variant="contained" color="success" onClick={submit} disabled={submitting}>
                    {submitting ? t("sending") : t("send")}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={() => navigate("next")}>
                    {t("nextbtn")}
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // 👉 FINISHED
  if (step === "finished") {
    return (
      <Box p={3} maxWidth="720px" mx="auto" textAlign="center">
        <Typography variant="h5" gutterBottom>{t("finish1")}</Typography>
        <Typography variant="h6">{t("finish2")}</Typography>
        <Typography variant="body1">{t("finish3")}</Typography>
        <Typography variant="body1">{t("finish4")} <span className="text-purple">Focufy.ai</span>.</Typography>
        <Typography variant="body1">{t("finish5")}</Typography>
        <Typography variant="body1">✨ {t("finish6")}</Typography>

        <Box mt={4}>
          <Button variant="contained" size="large" onClick={() => router.push("/listener/my-music")}>
            {t("btnfinish")}
          </Button>
        </Box>
      </Box>
    );
  }

  return null;
}
