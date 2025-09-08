"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function EditFocusGroup() {
  const { id } = useParams();
  const [nombre, setNombre] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [emails, setEmails] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [users, setUsers] = useState([]);
  const { t, i18n } = useTranslation();

  // 🔹 Cargar usuarios desde API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("No se pudieron cargar los usuarios");
        const data = await res.json();
        setUsers(data);
      } catch (e) {
        console.error(e);
        setSnackbar({
          open: true,
          message: e.message,
          severity: "error",
        });
      }
    })();
  }, []);

  const handleCreate = async () => {
    if (!nombre.trim()) {
      setSnackbar({
        open: true,
        message: t("nameval"),
        severity: "warning",
      });
      return;
    }

    try {
      const res = await fetch("/api/focus-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          userIds: selectedUsers,
          emails,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear el FocusGroup");

      setSnackbar({
        open: true,
        message: t("fgsucess"),
        severity: "success",
      });
      setNombre("");
      setSelectedUsers([]);
      setEmails("");
    } catch (e) {
      setSnackbar({ open: true, message: e.message, severity: "error" });
    }
  };
  useEffect(() => {
    const fetchData = async () => {
    try {
        const res = await fetch(`/api/pulls/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el FocusGroup");

        const data = await res.json();
        console.log("Data",data);
        setNombre(data.nombre);
        setSelectedUsers(data.selectedUsers||[]);
        setEmails(data.emails||[]);
        
    } catch (e) {
        console.error(e);
    }
    };

    fetchData();
    }, [id]);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null
  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        {t("fgcreate")}
      </Typography>

      <TextField
        label={t("fgname")}
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        select
        SelectProps={{ multiple: true }}
        label={t("addregistered")}
        value={selectedUsers||[]}
        onChange={(e) =>
          setSelectedUsers(
            typeof e.target.value === "string"
              ? e.target.value.split(",")
              : e.target.value
          )
        }
        fullWidth
        sx={{ mb: 2 }}
      >
        {users.map((u) => (
          <MenuItem
            key={u.id}
            value={u.email}
            sx={{
              backgroundColor:
                selectedUsers.indexOf(u.id) > -1 ? "primary.main" : "inherit",
              color:
                selectedUsers.indexOf(u.id) > -1
                  ? "primary.contrastText"
                  : "inherit",
              "&:hover": {
                backgroundColor:
                  selectedUsers.indexOf(u.id) > -1 ? "#ff81ea" : "#fff",
              },
            }}
          >
            {u.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        SelectProps={{ multiple: true }}
        label={t("addemails")}
        value={emails||[]}
        onChange={(e) => setEmails(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Button variant="contained" onClick={handleCreate}>
        {t("fgcreate")}
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

