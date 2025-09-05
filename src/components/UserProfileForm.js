"use client";
import { useState, useEffect } from "react";
import {
  Card, CardContent, Typography, TextField, Button, Switch,
  FormControlLabel, Box, FormControl, Autocomplete, Tab
} from "@mui/material";

import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useTranslation } from "react-i18next";

export default function UserProfileForm({ user }) {
  const [profile, setProfile] = useState(user);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [value, setValue] = useState("1");
  const { t, i18n } = useTranslation();
  const handleChangeT = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    setProfile(user);
    fetchUbicaciones();
  }, [user]);

  const fetchUbicaciones = async () => {
    try {
      const res = await fetch("/api/ubicacion");
      const data = await res.json();
      setUbicaciones(data);
    } catch (err) {
      console.error("Error cargando países/ciudades", err);
    }
  };

  // Inicializar ciudades cuando ya hay un país seleccionado en el perfil
  useEffect(() => {
    if (ubicaciones.length > 0 && profile?.idPais) {
      const pais = ubicaciones.find((p) => p.id === profile.idPais);
      if (pais) {
        setCiudades(pais.ciudades || []);
      }
    }
  }, [ubicaciones, profile?.idPais]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Nuevo handleSubmit que manda todos los campos del perfil
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        alert("❌ Error al guardar perfil");
        return;
      }

      const saved = await response.json();
      setProfile(saved); // actualizar el formulario con lo guardado
      alert("✅"+t("savedprof"));
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      alert("❌ Error en la conexión con el servidor");
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: "auto", mt: 4, mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {t("profiletitle")}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList onChange={handleChangeT} aria-label="User data">
                <Tab label={t("profpers")} value="1" />
                <Tab label={t("profpub")} value="2" />
              </TabList>
            </Box>

            {/* Panel 1 */}
            <TabPanel value="1">
              <TextField
                label={t("namelbl")}
                name="name"
                value={profile?.name || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t("agelbl")}
                name="edad"
                type="number"
                value={profile.edad || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t("desclbl")}
                name="description"
                value={profile.description || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />

              {/* País */}
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  options={ubicaciones}
                  getOptionLabel={(option) => option.nombre}
                  value={
                    ubicaciones.find((p) => p.id === profile.idPais) || null
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  onChange={(e, newValue) => {
                    setProfile((prev) => ({
                      ...prev,
                      idPais: newValue ? newValue.id : null,
                      idCiudad: null,
                    }));
                    setCiudades(newValue ? newValue.ciudades : []);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label={t("paislbl")} margin="normal" fullWidth />
                  )}
                />
              </FormControl>

              {/* Ciudad */}
              <FormControl fullWidth margin="normal" disabled={!ciudades.length}>
                <Autocomplete
                  options={ciudades}
                  getOptionLabel={(option) => option?.nombre || ""}
                  value={
                    ciudades.find((c) => c.id === profile.idCiudad) || null
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  onChange={(e, newValue) => {
                    setProfile((prev) => ({
                      ...prev,
                      idCiudad: newValue ? newValue.id : null,
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label={t("citylbl")} margin="normal" fullWidth />
                  )}
                />
              </FormControl>
            </TabPanel>

            {/* Panel 2 */}
            <TabPanel value="2">
              <TextField
                label={t("phonelbl")}
                name="phone"
                value={profile.phone || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t("sitelbl")}
                name="website"
                value={profile.website || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t("contactmaillbl")}
                name="contactEmail"
                value={profile.contactEmail || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={profile.availableForCollab || false}
                    onChange={handleChange}
                    name="availableForCollab"
                  />
                }
                label={t("availlbl")}
              />
            </TabPanel>
          </TabContext>

          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary">
              {t("savechanges")}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}
