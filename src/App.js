import React, { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  IconButton,
  Divider,
  Stack,
  Tooltip,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const DEFAULT_FIELDS = [
  {
    id: crypto.randomUUID(),
    label: "Field 1",
    instruction:
      "You are a precise rewriter. Improve clarity and keep meaning.",
    input: "",
    output: "",
    loading: false,
    error: "",
  },
  {
    id: crypto.randomUUID(),
    label: "Field 2",
    instruction:
      "Summarize the text in 3 bullet points. Keep it factual and concise.",
    input: "",
    output: "",
    loading: false,
    error: "",
  },
  {
    id: crypto.randomUUID(),
    label: "Field 3",
    instruction:
      "Translate the text to French. Preserve technical terms in English.",
    input: "",
    output: "",
    loading: false,
    error: "",
  },
];

const MODEL_OPTIONS = [
  { value: "gpt-4o", label: "gpt-4o" },
  { value: "gpt-4.1-mini", label: "gpt-4.1-mini" },
  { value: "gpt-4o-mini", label: "gpt-4o-mini" },
];

const LS_KEY = "gpt-at-work:state";

export default function App() {
  const [apiBase, setApiBase] = useState("/api");
  const [model, setModel] = useState(MODEL_OPTIONS[0].value);
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "info" });

  // Load saved UI state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.apiBase) setApiBase(parsed.apiBase);
        if (parsed.model) setModel(parsed.model);
        if (
          parsed.fields &&
          Array.isArray(parsed.fields) &&
          parsed.fields.length
        ) {
          setFields(
            parsed.fields.map((f) => ({ ...f, loading: false, error: "" }))
          );
        }
      }
    } catch {}
  }, []);

  // Persist UI state
  useEffect(() => {
    const toSave = {
      apiBase,
      model,
      fields: fields.map(({ loading, error, ...rest }) => rest),
    };
    localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  }, [apiBase, model, fields]);

  const runningCount = useMemo(
    () => fields.filter((f) => f.loading).length,
    [fields]
  );

  const setField = (id, updater) =>
    setFields((prev) =>
      prev.map((f) =>
        f.id === id
          ? typeof updater === "function"
            ? updater(f)
            : { ...f, ...updater }
          : f
      )
    );

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: `Field ${prev.length + 1}`,
        instruction: "",
        input: "",
        output: "",
        loading: false,
        error: "",
      },
    ]);
    setSnack({ open: true, msg: "Field added", sev: "success" });
  };

  const deleteField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSnack({ open: true, msg: "Field removed", sev: "info" });
  };

  const copyOutput = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
      setSnack({ open: true, msg: "Copied to clipboard", sev: "success" });
    } catch {
      setSnack({ open: true, msg: "Copy failed", sev: "error" });
    }
  };

  // --- API call ---
  const runField = async (id) => {
    const field = fields.find((f) => f.id === id);
    if (!field) return;

    if (!field.instruction?.trim()) {
      setSnack({
        open: true,
        msg: "Add an instruction first.",
        sev: "warning",
      });
      return;
    }

    if (!field.input?.trim()) {
      setSnack({
        open: true,
        msg: "Add input text to process.",
        sev: "warning",
      });
      return;
    }

    setField(id, { loading: true, error: "" });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: field.instruction, input: field.input, model }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      console.log(data.answer);
      setField(id, { output: data.answer || "", loading: false, error: "" });
    } catch (err) {
      setField(id, { loading: false, error: err.message || "Request failed" });
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            GPT at Work
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <TextField
            size="small"
            select
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            sx={{
              minWidth: 170,
              background: "rgba(255,255,255,0.8)",
              borderRadius: 1,
            }}
          >
            {MODEL_OPTIONS.map((opt) => (
              <MenuItem value={opt.value} key={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="API Base"
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
            sx={{
              minWidth: 240,
              background: "rgba(255,255,255,0.8)",
              borderRadius: 1,
            }}
            helperText="Your backend base path (e.g., /api)"
          />
          <Tooltip title="Add new field">
            <IconButton color="inherit" onClick={addField}>
              <AddCircleIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Multi-Field ChatGPT Processor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Give each field its own <strong>instruction</strong> (system prompt)
            and <strong>input</strong>. Click <em>Run</em> to process with your
            backend. Everything is saved locally.
          </Typography>
        </Stack>

        <Box
          sx={{
            mt: 3,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: 2,
          }}
        >
          {fields.map((f, idx) => (
            <Card
              key={f.id}
              variant="outlined"
              sx={{ borderRadius: 3, overflow: "hidden" }}
            >
              <CardContent sx={{ display: "grid", gap: 1.5 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <TextField
                    label="Label"
                    size="small"
                    value={f.label}
                    onChange={(e) => setField(f.id, { label: e.target.value })}
                    sx={{ flex: 1 }}
                  />
                  <Tooltip title="Remove field">
                    <IconButton
                      onClick={() => deleteField(f.id)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <TextField
                  label="Instruction (system prompt for this field)"
                  value={f.instruction}
                  onChange={(e) =>
                    setField(f.id, { instruction: e.target.value })
                  }
                  multiline
                  minRows={2}
                  placeholder="e.g., You rewrite text in plain English while preserving technical accuracy."
                />

                <TextField
                  label="Input"
                  value={f.input}
                  onChange={(e) => setField(f.id, { input: e.target.value })}
                  multiline
                  minRows={3}
                  placeholder="Paste or type the text you want to process…"
                />

                <Divider />

                <TextField
                  label="Output"
                  value={f.output}
                  multiline
                  minRows={3}
                  InputProps={{ readOnly: true }}
                  placeholder="Result will appear here…"
                />

                {f.error ? (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {f.error}
                  </Alert>
                ) : null}
              </CardContent>

              <CardActions
                sx={{ px: 2, pb: 2, pt: 0, justifyContent: "space-between" }}
              >
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  disabled={f.loading}
                  onClick={() => runField(f.id)}
                >
                  {f.loading ? "Running…" : "Run"}
                </Button>

                <Tooltip title="Copy output">
                  <span>
                    <IconButton
                      disabled={!f.output}
                      onClick={() => copyOutput(f.output)}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </CardActions>
            </Card>
          ))}
        </Box>

        <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {fields.length} field(s) •{" "}
            {runningCount ? `Running: ${runningCount}` : "Idle"}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            onClick={addField}
            startIcon={<AddCircleIcon />}
          >
            Add Field
          </Button>
        </Box>
      </Container>

      <Snackbar
        open={snack.open}
        autoHideDuration={2200}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.sev}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
