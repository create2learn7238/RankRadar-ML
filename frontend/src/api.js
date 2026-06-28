const DEFAULT_API_URLS = [
  "http://localhost:8000",
  "http://localhost:8001",
];
const configuredApiUrl = import.meta.env.VITE_API_URL || "";
const BASE_URL = configuredApiUrl || DEFAULT_API_URLS[0];
let activeApiUrl = BASE_URL;

async function request(endpoint, options = {}) {
  const urlsToTry = configuredApiUrl
    ? [activeApiUrl]
    : [activeApiUrl, ...DEFAULT_API_URLS.filter((url) => url !== activeApiUrl)];

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  let lastError;

  for (const baseUrl of urlsToTry) {
    const url = `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP Error: ${response.status}`);
      }

      if (baseUrl !== activeApiUrl) {
        activeApiUrl = baseUrl;
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      const isNetworkError =
        error instanceof TypeError || String(error).includes("Failed to fetch");

      if (configuredApiUrl || !isNetworkError) {
        console.error(`API Request failed on ${url}:`, error);
        throw error;
      }

      console.warn(`Backend not reachable at ${url}, trying next fallback...`);
    }
  }

  console.error("API Request failed on all configured backend URLs:", lastError);
  throw lastError;
}

// ── API Methods ───────────────────────────────────────────────────────────────
export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────────
  // ── Health ──────────────────────────────────────────────────────────────────
  health: () => fetch(`${BASE_URL}/`).then((r) => r.json()).catch(() => null),

  // ── Dashboard ───────────────────────────────────────────────────────────────
  getOverview: () => request("/dashboard/overview"),

  // ── Students ─────────────────────────────────────────────────────────────────
  getStudents: (skip = 0, limit = 300) =>
    request(`/students/?skip=${skip}&limit=${limit}`),

  getStudentProfile: (enrollmentNo) =>
    request(`/students/${encodeURIComponent(enrollmentNo)}`),

  searchStudents: (q) => request(`/students/search?q=${encodeURIComponent(q)}`),

  // ── Analytics ────────────────────────────────────────────────────────────────
  getSubjectAverages: () => request("/analytics/subjects"),

  getAllAnalytics: (performanceLabel = "") => {
    const query = performanceLabel ? `?performance_label=${performanceLabel}` : "";
    return request(`/analytics${query}`);
  },

  getBatchAnalytics: () => request("/analytics/batch"),

  getSemesterComparison: () => request("/analytics/semester-comparison"),

  getStudentAnalytics: (enrollmentNo) =>
    request(`/analytics/${encodeURIComponent(enrollmentNo)}`),

  getStudentPredictions: (enrollmentNo) =>
    request(`/analytics/${encodeURIComponent(enrollmentNo)}/predictions`),

  // ── Compare ──────────────────────────────────────────────────────────────────
  compareStudents: (enroll1, enroll2) =>
    request(
      `/analytics/compare/students?student1_enroll=${enroll1}&student2_enroll=${enroll2}`
    ),

  // ── Leaderboard ──────────────────────────────────────────────────────────────
  getLeaderboard: (limit = 10) => request(`/leaderboard?limit=${limit}`),

  getSubjectToppers: () => request("/leaderboard/subject-toppers"),

  // ── ML Predict ───────────────────────────────────────────────────────────────
  predictScore: (t1, t2, t3, subjectName) =>
    request("/predict", {
      method: "POST",
      body: JSON.stringify({
        t1_marks: parseFloat(t1),
        t2_marks: parseFloat(t2),
        t3_marks: parseFloat(t3),
        subject_name: subjectName || null,
      }),
    }),
};
