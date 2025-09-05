export const dynamic = "force-dynamic";
export const revalidate = 0;
import React, { useState, useEffect, Fragment } from "react";
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TextField, Select, MenuItem, IconButton, Collapse, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import {
    Edit, Delete, KeyboardArrowDown, KeyboardArrowUp
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
// ============================================================================
// Componente para cada Fila de Pregunta (Master-Detail Row)
// ============================================================================
function QuestionRow({ question, onEdit, onDelete, onOptionEdit, onOptionDelete, onOptionNew }) {
    const [open, setOpen] = useState(false); // Controla si el detalle está expandido
    const { t, i18n } = useTranslation();

    return (
        <Fragment>
            {/* Fila Maestra (La Pregunta) */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell sx={{ width: '50px' }}>
                    {/* Solo muestra el botón de expandir si hay opciones */}
                    {question.type === "MULTIPLE_CHOICE" && (
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                    )}
                </TableCell>
                <TableCell>{question.key}</TableCell>
                <TableCell>
                    <b>🇪🇸:</b>{question.title}<br/><b>🇺🇸:</b>{question.titleEn}<br/><b>🇫🇷:</b>{question.titleFr}<br/></TableCell>
                <TableCell>{question.type}</TableCell>
                <TableCell align="right">
                    <IconButton onClick={() => onEdit(question)}><Edit /></IconButton>
                    <IconButton onClick={() => onDelete(question.id)} color="error"><Delete /></IconButton>
                </TableCell>
            </TableRow>

            {/* Fila de Detalle (Las Opciones) - Se muestra al expandir */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, padding: 2, backgroundColor: '#fafafa', borderRadius: '4px',marginLeft:30 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                {t("optionquestion")}
                            </Typography>
                            <Table size="small" aria-label="options" >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t("orderlbl")}</TableCell>
                                        <TableCell>{t("valuelbl")}</TableCell>
                                        <TableCell>{t("textlbl")}</TableCell>
                                        <TableCell align="right">{t("actionlbl")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(question.options || []).map((option) => (
                                        <TableRow key={option.id}>
                                            <TableCell>{option.order}</TableCell>
                                            <TableCell>{option.value}</TableCell>
                                            <TableCell><b>🇪🇸:</b>{option.label}<br/><b>🇺🇸:</b>{option.labelEn}<br/><b>🇫🇷:</b>{option.labelFr}</TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => onOptionEdit(question.id, option)}>
                                                    <Edit fontSize="inherit" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => onOptionDelete(option.id)}>
                                                    <Delete fontSize="inherit" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button
                                size="small"
                                variant="outlined"
                                sx={{ mt: 2 }}
                                onClick={() => onOptionNew(question.id)}
                            >
                                {t("addoption")}
                            </Button>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </Fragment>
    );
}


// ============================================================================
// Componente Principal del Catálogo
// ============================================================================
export default function QuestionsCatalog() {
    const [questions, setQuestions] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [openOptionModal, setOpenOptionModal] = useState(false);
    const [editingOption, setEditingOption] = useState(null);
    const [currentQuestionId, setCurrentQuestionId] = useState(null);
    const { t, i18n } = useTranslation();
    const fetchQuestions = async () => {
        try {
            const res = await fetch("/api/questions");
            const data = await res.json();
            setQuestions(data);
        } catch (error) {
            console.error("Failed to fetch questions:", error);
        }
    };

    useEffect(() => { fetchQuestions(); }, []);

    // === Lógica para CRUD de Preguntas ===
    const handleSaveQuestion = async () => {
        const method = editingQuestion?.id ? "PUT" : "POST";
        try {
            await fetch("/api/questions", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingQuestion),
            });
        } catch (error) {
            console.error("Failed to save question:", error);
        } finally {
            setOpenModal(false);
            fetchQuestions();
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (window.confirm(t("confirmdelquestion"))) {
            try {
                await fetch("/api/questions", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                });
            } catch (error) {
                console.error("Failed to delete question:", error);
            } finally {
                fetchQuestions();
            }
        }
    };

    // === Lógica para CRUD de Opciones ===
    const handleSaveOption = async () => {
        const method = editingOption?.id ? "PUT" : "POST";
        const body = editingOption?.id
            ? editingOption
            : { ...editingOption, questionId: currentQuestionId };
        try {
            await fetch("/api/options", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error("Failed to save option:", error);
        } finally {
            setOpenOptionModal(false);
            fetchQuestions();
        }
    };

    const handleDeleteOption = async (id) => {
        if (window.confirm(t("confirmdelopt"))) {
            try {
                await fetch("/api/options", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                });
            } catch (error) {
                console.error("Failed to delete option:", error);
            } finally {
                fetchQuestions();
            }
        }
    };

    // === Manejadores para abrir modales ===
    const handleNewQuestion = () => {
        setEditingQuestion({ key: "", title: "",titleEn: "",titleFr: "", type: "TEXT" });
        setOpenModal(true);
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
        setOpenModal(true);
    };

    const handleNewOption = (questionId) => {
        setCurrentQuestionId(questionId);
        setEditingOption({ order: 0, value: "", label: "", labelEn: "", labelFr: "" });
        setOpenOptionModal(true);
    };

    const handleEditOption = (questionId, option) => {
        setCurrentQuestionId(questionId);
        setEditingOption(option);
        setOpenOptionModal(true);
    };

    return (
        <Box sx={{ p: 3 }}>
            <h1>{t("questioncattitle")}</h1>
            <Button variant="contained" color="primary" onClick={handleNewQuestion}>
                {t("newquestion")}
            </Button>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>{t("keylbl")}</TableCell>
                            <TableCell>{t("textlbl")}</TableCell>
                            <TableCell>{t("typelbl")}</TableCell>
                            <TableCell align="right">{t("actionlbl")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {questions.map((question) => (
                            <QuestionRow
                                key={question.id}
                                question={question}
                                onEdit={handleEditQuestion}
                                onDelete={handleDeleteQuestion}
                                onOptionEdit={handleEditOption}
                                onOptionDelete={handleDeleteOption}
                                onOptionNew={handleNewOption}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de Preguntas */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingQuestion?.id ? "Editar Pregunta" : "Nueva Pregunta"}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label={t("keylbl")}
                        fullWidth
                        margin="dense"
                        value={editingQuestion?.key || ""}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, key: e.target.value })}
                    />
                    <TextField
                        label={t("textlbl")+" ES"}
                        fullWidth
                        margin="dense"
                        value={editingQuestion?.title || ""}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                    />
                    <TextField
                        label={t("textlbl")+" US"}
                        fullWidth
                        margin="dense"
                        value={editingQuestion?.titleEn || ""}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, titleEn: e.target.value })}
                    />
                    <TextField
                        label={t("textlbl")+" FR"}
                        fullWidth
                        margin="dense"
                        value={editingQuestion?.titleFr || ""}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, titleFr: e.target.value })}
                    />
                    <Select
                        fullWidth
                        value={editingQuestion?.type || "TEXT"}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value })}
                        sx={{ mt: 1 }}
                    >
                        <MenuItem value="TEXT">{t("optiontypet")}</MenuItem>
                        <MenuItem value="MULTIPLE_CHOICE">{t("optiontypem")}</MenuItem>
                        <MenuItem value="SCALE_1_5">{t("optiontypes")}</MenuItem>
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>{t("cancelbtn")}</Button>
                    <Button onClick={handleSaveQuestion} variant="contained">{t("savebtn")}</Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Opciones */}
            <Dialog open={openOptionModal} onClose={() => setOpenOptionModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingOption?.id ? "Editar Opción" : "Nueva Opción"}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label={t("orderlbl")}
                        fullWidth
                        margin="dense"
                        type="number"
                        value={editingOption?.order || ""}
                        onChange={(e) => setEditingOption({ ...editingOption, order: parseInt(e.target.value, 10) || 0 })}
                    />
                    <TextField
                        label={t("valuelbl")}
                        fullWidth
                        margin="dense"
                        value={editingOption?.value || ""}
                        onChange={(e) => setEditingOption({ ...editingOption, value: e.target.value })}
                    />
                    <TextField
                        label={t("textlbl")+" ES"}
                        fullWidth
                        margin="dense"
                        value={editingOption?.label || ""}
                        onChange={(e) => setEditingOption({ ...editingOption, label: e.target.value })}
                    />
                    <TextField
                        label={t("textlbl")+" EN"}
                        fullWidth
                        margin="dense"
                        value={editingOption?.labelEn || ""}
                        onChange={(e) => setEditingOption({ ...editingOption, labelEn: e.target.value })}
                    />
                    <TextField
                        label={t("textlbl")+" FR"}
                        fullWidth
                        margin="dense"
                        value={editingOption?.labelFr || ""}
                        onChange={(e) => setEditingOption({ ...editingOption, labelFr: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenOptionModal(false)}>{t("cancelbtn")}</Button>
                    <Button onClick={handleSaveOption} variant="contained">{t("savebtn")}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
