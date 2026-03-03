import { useState, useRef } from "react";

const PASTEL_BG = "#F7F3EE";
const GREEN = "#3D7A5A";
const GREEN_LIGHT = "#E8F4EE";
const ACCENT = "#F4A261";
const TEXT = "#1A1A1A";
const MUTED = "#7A7A7A";

const styles = {
  app: { minHeight: "100vh", background: PASTEL_BG, fontFamily: "'Georgia', serif", color: TEXT, display: "flex", flexDirection: "column", alignItems: "center" },
  header: { width: "100%", background: GREEN, padding: "18px 0 14px 0", textAlign: "center", boxShadow: "0 2px 12px rgba(61,122,90,0.13)" },
  headerTitle: { color: "#fff", fontSize: "1.55rem", fontWeight: "bold", letterSpacing: "0.04em", margin: 0 },
  headerSub: { color: "#b6e0c8", fontSize: "0.82rem", marginTop: "3px", letterSpacing: "0.07em" },
  main: { width: "100%", maxWidth: "480px", padding: "28px 16px 40px 16px", display: "flex", flexDirection: "column", gap: "22px" },
  uploadCard: { background: "#fff", borderRadius: "20px", boxShadow: "0 2px 18px rgba(61,122,90,0.08)", padding: "28px 22px 22px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" },
  uploadArea: { width: "100%", border: `2.5px dashed ${GREEN}`, borderRadius: "14px", background: GREEN_LIGHT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "160px", cursor: "pointer", padding: "18px", gap: "10px" },
  uploadIcon: { fontSize: "2.5rem" },
  uploadText: { color: GREEN, fontWeight: "bold", fontSize: "1rem" },
  uploadSub: { color: MUTED, fontSize: "0.8rem" },
  imagePreview: { width: "100%", borderRadius: "12px", maxHeight: "240px", objectFit: "cover", boxShadow: "0 2px 10px rgba(0,0,0,0.09)" },
  analyzeBtn: { width: "100%", background: GREEN, color: "#fff", border: "none", borderRadius: "50px", padding: "14px 0", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", letterSpacing: "0.04em", boxShadow: "0 4px 14px rgba(61,122,90,0.18)" },
  loadingCard: { background: "#fff", borderRadius: "20px", boxShadow: "0 2px 18px rgba(61,122,90,0.08)", padding: "30px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" },
  spinner: { width: "44px", height: "44px", border: `4px solid ${GREEN_LIGHT}`, borderTop: `4px solid ${GREEN}`, borderRadius: "50%", animation: "spin 0.9s linear infinite" },
  loadingText: { color: GREEN, fontWeight: "bold", fontSize: "1rem" },
  resultCard: { background: "#fff", borderRadius: "20px", boxShadow: "0 2px 18px rgba(61,122,90,0.08)", padding: "24px 20px", display: "flex", flexDirection: "column", gap: "16px" },
  resultTitle: { fontSize: "1.1rem", fontWeight: "bold", color: GREEN, borderBottom: `2px solid ${GREEN_LIGHT}`, paddingBottom: "8px", marginBottom: "2px" },
  foodName: { fontSize: "1.5rem", fontWeight: "bold", color: TEXT },
  foodDesc: { fontSize: "0.9rem", color: MUTED, lineHeight: "1.6" },
  badge: { display: "inline-block", background: ACCENT, color: "#fff", borderRadius: "50px", padding: "3px 14px", fontSize: "0.78rem", fontWeight: "bold", marginBottom: "4px" },
  tipsBox: { background: "#FFF8F0", border: `1.5px solid ${ACCENT}`, borderRadius: "12px", padding: "13px 15px", fontSize: "0.88rem", color: "#7a4a1e", lineHeight: "1.65" },
  resetBtn: { background: "transparent", border: `2px solid ${GREEN}`, color: GREEN, borderRadius: "50px", padding: "11px 0", width: "100%", fontWeight: "bold", cursor: "pointer", fontSize: "0.95rem" },
  errorBox: { background: "#fff0f0", border: "1.5px solid #e07070", borderRadius: "12px", padding: "14px 16px", color: "#b03030", fontSize: "0.92rem" },
  apiKeyBox: { background: "#fff", borderRadius: "20px", boxShadow: "0 2px 18px rgba(61,122,90,0.08)", padding: "24px 20px", display: "flex", flexDirection: "column", gap: "12px" },
  apiKeyLabel: { fontWeight: "bold", color: GREEN, fontSize: "0.95rem" },
  apiKeyInput: { border: `1.5px solid #ccc`, borderRadius: "10px", padding: "11px 14px", fontSize: "0.92rem", width: "100%", boxSizing: "border-box" },
  apiKeyBtn: { background: GREEN, color: "#fff", border: "none", borderRadius: "50px", padding: "12px 0", fontWeight: "bold", cursor: "pointer", fontSize: "0.95rem" },
  apiKeyNote: { fontSize: "0.78rem", color: MUTED, lineHeight: "1.6" },
};

function NutrientBar({ label, value, max, unit, color }) {
  const pct = Math.min(100, (parseFloat(value) / max) * 100);
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "0.85rem", color: MUTED }}>{label}</span>
        <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: TEXT }}>{value}{unit}</span>
      </div>
      <div style={{ background: "#eee", borderRadius: "99px", height: "7px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color || GREEN, borderRadius: "99px", transition: "width 0.7s ease" }} />
      </div>
    </div>
  );
}

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("anthropic_key") || "");
  const [savedKey, setSavedKey] = useState(!!localStorage.getItem("anthropic_key"));
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const saveKey = () => {
    localStorage.setItem("anthropic_key", apiKey);
    setSavedKey(true);
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setResult(null); setError(null);
    setImage(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = (e) => setImageBase64({ data: e.target.result.split(",")[1], mediaType: file.type });
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!imageBase64) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: imageBase64.mediaType, data: imageBase64.data } },
              { type: "text", text: `이 음식 사진을 분석해서 반드시 아래 JSON 형식만 응답해줘. 다른 텍스트나 마크다운은 절대 포함하지 마.\n\n{"foodName":"음식이름","category":"종류","servingSize":"1인분기준","calories":숫자,"nutrients":{"carbs":숫자,"protein":숫자,"fat":숫자,"fiber":숫자,"sodium":숫자},"description":"설명2-3문장","healthTips":"건강팁2-3문장","healthScore":1~10숫자}` }
            ]
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(i => i.text || "").join("") || "";
      setResult(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch (err) {
      setError("분석 중 오류가 발생했습니다. API 키를 확인하거나 다시 시도해 주세요.");
    }
    setLoading(false);
  };

  const scoreColor = (s) => s >= 8 ? "#3D7A5A" : s >= 5 ? "#F4A261" : "#e07070";

  return (
    <div style={styles.app}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <header style={styles.header}>
        <div style={styles.headerTitle}>🥗 푸드 렌즈</div>
        <div style={styles.headerSub}>AI 음식 영양소 분석기</div>
      </header>
      <main style={styles.main}>

        {!savedKey && (
          <div style={styles.apiKeyBox}>
            <div style={styles.apiKeyLabel}>🔑 Anthropic API 키 입력</div>
            <input style={styles.apiKeyInput} type="password" placeholder="sk-ant-..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
            <button style={styles.apiKeyBtn} onClick={saveKey}>저장하고 시작하기</button>
            <div style={styles.apiKeyNote}>
              API 키는 <strong>console.anthropic.com</strong>에서 발급받을 수 있어요.<br />
              키는 이 기기에만 저장되며 외부로 전송되지 않아요.
            </div>
          </div>
        )}

        {savedKey && !result && (
          <div style={styles.uploadCard}>
            <div style={styles.uploadArea} onClick={() => fileRef.current.click()}>
              {image
                ? <img src={image} alt="food" style={styles.imagePreview} />
                : <><div style={styles.uploadIcon}>📷</div><div style={styles.uploadText}>음식 사진을 업로드하세요</div><div style={styles.uploadSub}>클릭하거나 카메라로 촬영하세요</div></>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            {image && <button style={styles.analyzeBtn} onClick={analyze} disabled={loading}>🔍 영양소 분석하기</button>}
            {!image && <div style={{ fontSize: "0.8rem", color: MUTED, textAlign: "center" }}>사진 한 장으로 칼로리·영양소를 바로 확인하세요!</div>}
          </div>
        )}

        {loading && (
          <div style={styles.loadingCard}>
            <div style={styles.spinner} />
            <div style={styles.loadingText}>AI가 음식을 분석하고 있어요...</div>
          </div>
        )}

        {error && <div style={styles.errorBox}>⚠️ {error}<br /><button style={{ ...styles.resetBtn, marginTop: "12px" }} onClick={() => setError(null)}>다시 시도</button></div>}

        {result && (
          <div style={styles.resultCard}>
            {image && <img src={image} alt="food" style={styles.imagePreview} />}
            <div>
              <span style={styles.badge}>{result.category}</span>
              <div style={styles.foodName}>{result.foodName}</div>
              <div style={{ color: MUTED, fontSize: "0.82rem", marginTop: "2px" }}>{result.servingSize} 기준</div>
            </div>
            <div style={styles.foodDesc}>{result.description}</div>
            <div>
              <div style={styles.resultTitle}>🔥 칼로리</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: ACCENT }}>{result.calories} <span style={{ fontSize: "1rem", color: MUTED }}>kcal</span></div>
            </div>
            <div>
              <div style={styles.resultTitle}>🧬 영양소 분석</div>
              <NutrientBar label="탄수화물" value={result.nutrients.carbs} max={100} unit="g" color="#F4A261" />
              <NutrientBar label="단백질" value={result.nutrients.protein} max={60} unit="g" color="#3D7A5A" />
              <NutrientBar label="지방" value={result.nutrients.fat} max={60} unit="g" color="#e07070" />
              <NutrientBar label="식이섬유" value={result.nutrients.fiber} max={30} unit="g" color="#7ec8a0" />
              <NutrientBar label="나트륨" value={result.nutrients.sodium} max={2000} unit="mg" color="#8888cc" />
            </div>
            <div>
              <div style={styles.resultTitle}>💚 건강 점수</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ fontSize: "2.2rem", fontWeight: "bold", color: scoreColor(result.healthScore) }}>{result.healthScore}<span style={{ fontSize: "1rem", color: MUTED }}>/10</span></div>
                <div style={{ color: MUTED, fontSize: "0.85rem" }}>{result.healthScore >= 8 ? "매우 건강한 음식! 🌟" : result.healthScore >= 5 ? "균형 잡힌 음식 👍" : "가끔 즐기세요 ⚠️"}</div>
              </div>
            </div>
            <div>
              <div style={styles.resultTitle}>💡 건강 팁</div>
              <div style={styles.tipsBox}>{result.healthTips}</div>
            </div>
            <button style={styles.resetBtn} onClick={() => { setResult(null); setImage(null); setImageBase64(null); }}>📷 다른 음식 분석하기</button>
            <button style={{ ...styles.resetBtn, color: MUTED, borderColor: "#ccc", fontSize: "0.8rem" }} onClick={() => { localStorage.removeItem("anthropic_key"); setSavedKey(false); setApiKey(""); }}>🔑 API 키 변경</button>
          </div>
        )}
      </main>
    </div>
  );
}
