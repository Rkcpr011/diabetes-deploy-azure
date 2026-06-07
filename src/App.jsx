import { useState } from "react";

const BACKEND_URL = "https://diabetesbackend-gebebubdfmhtbkd2.eastus-01.azurewebsites.net/";

const FIELDS = [
  { key: "age", label: "Age",            hint: "e.g. 0.038" },
  { key: "sex", label: "Sex",            hint: "e.g. 0.050" },
  { key: "bmi", label: "BMI",            hint: "e.g. 0.061" },
  { key: "bp",  label: "Blood Pressure", hint: "e.g. 0.021" },
  { key: "s1",  label: "S1 (serum)",     hint: "e.g. -0.044" },
  { key: "s2",  label: "S2 (serum)",     hint: "e.g. -0.034" },
  { key: "s3",  label: "S3 (serum)",     hint: "e.g. -0.043" },
  { key: "s4",  label: "S4 (serum)",     hint: "e.g. -0.002" },
  { key: "s5",  label: "S5 (serum)",     hint: "e.g. 0.019" },
  { key: "s6",  label: "S6 (serum)",     hint: "e.g. -0.017" },
];

const DEFAULT_VALUES = {
  age: "0.038", sex: "0.050", bmi: "0.061", bp: "0.021",
  s1: "-0.044", s2: "-0.034", s3: "-0.043",
  s4: "-0.002", s5: "0.019",  s6: "-0.017",
};

export default function App() {
  const [values, setValues]   = useState(DEFAULT_VALUES);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setValues(DEFAULT_VALUES);
    setResult(null);
    setError(null);
  };

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const body = {};
      FIELDS.forEach(f => { body[f.key] = parseFloat(values[f.key]); });

      const res = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data.prediction);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.h1}>Diabetes Progression Predictor</h1>
        <p style={styles.subtitle}>Enter normalized patient values to get a progression score</p>
      </div>

      {/* Input Grid */}
      <div style={styles.card}>
        <p style={styles.sectionLabel}>Patient Features</p>
        <div style={styles.grid}>
          {FIELDS.map(f => (
            <div key={f.key} style={styles.field}>
              <label style={styles.label}>{f.label}</label>
              <input
                type="number"
                step="0.001"
                value={values[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                style={styles.input}
              />
              <span style={styles.hint}>{f.hint}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <button onClick={handlePredict} disabled={loading} style={styles.btnPrimary}>
        {loading ? "Predicting..." : "Predict →"}
      </button>
      <button onClick={handleReset} style={styles.btnSecondary}>
        Reset to sample values
      </button>

      {/* Loading */}
      {loading && (
        <p style={styles.loading}>Calling Azure ML endpoint...</p>
      )}

      {/* Result */}
      {result !== null && (
        <div style={styles.result}>
          <p style={styles.resultLabel}>Diabetes Progression Score</p>
          <p style={styles.resultValue}>{Number(result).toFixed(1)}</p>
          <p style={styles.resultSub}>Higher score = faster progression (range ~25–346)</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.error}>{error}</div>
      )}
    </div>
  );
}

const styles = {
  app: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "2rem 1rem",
    fontFamily: "sans-serif",
  },
  header: { marginBottom: "1.5rem" },
  h1: { fontSize: 22, fontWeight: 500, margin: 0 },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  card: {
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: "1.25rem",
    marginBottom: "1rem",
    background: "#fff",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
  },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 13, color: "#555" },
  input: {
    height: 36,
    border: "1px solid #e5e5e5",
    borderRadius: 8,
    padding: "0 10px",
    fontSize: 14,
    width: "100%",
  },
  hint: { fontSize: 11, color: "#aaa" },
  btnPrimary: {
    width: "100%",
    height: 40,
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    marginBottom: 8,
  },
  btnSecondary: {
    width: "100%",
    height: 40,
    background: "#fff",
    color: "#111",
    border: "1px solid #e5e5e5",
    borderRadius: 8,
    fontSize: 14,
    cursor: "pointer",
  },
  loading: { textAlign: "center", color: "#888", fontSize: 14, padding: "1rem" },
  result: {
    background: "#f9f9f9",
    borderRadius: 12,
    padding: "1.5rem",
    textAlign: "center",
    marginTop: "1rem",
  },
  resultLabel: { fontSize: 13, color: "#888", marginBottom: 8 },
  resultValue: { fontSize: 36, fontWeight: 500, color: "#111", margin: 0 },
  resultSub: { fontSize: 13, color: "#888", marginTop: 6 },
  error: {
    background: "#fff0f0",
    border: "1px solid #ffcccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: "#cc0000",
    marginTop: "1rem",
  },
};

