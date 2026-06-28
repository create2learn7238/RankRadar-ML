import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Search,
  Sparkles,
  Sun,
  Moon,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "./api";
import heroIllustration from "./assets/hero-illustration.svg";
import emptyStateIllustration from "./assets/empty-state.svg";

const TEST_MAX = { T1: 25, T2: 25, T3: 25, T4: 50 };

const statusChipClass = {
  Excellent: "chip chip-excellent",
  Good: "chip chip-good",
  Average: "chip chip-average",
  Weak: "chip chip-weak",
};

const chartColors = {
  T1: "#7c3aed",
  T2: "#06b6d4",
  T3: "#10b981",
  T4: "#f59e0b",
  Predicted: "#10b981",
  Actual: "#f43f5e",
};

// Social links with correct SVG icons matching each platform
const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/dixit.patel_since_2005/?hl=en",
    color: "#E1306C",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/create2learn7238",
    color: "#6e5494",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/dixit-patel-7718993a1/",
    color: "#0077B5",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/919316227238",
    color: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
];

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function getEnrollment(student) {
  return student?.enrollment_no || student?.enrollment_number || "";
}

function formatNumber(value, fallback = "--") {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return fallback;
  const rounded = Math.round(Number(value) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function getStatus(percentage) {
  if (percentage >= 85) return "Excellent";
  if (percentage >= 70) return "Good";
  if (percentage >= 55) return "Average";
  return "Weak";
}

function getMarkValue(subject, test) {
  return subject.tests[test]?.marks;
}

function buildSemesterSubjects(marks = [], semester, predictions = {}) {
  const bySubject = new Map();

  for (const mark of marks) {
    if (Number(mark.semester) !== Number(semester)) continue;
    const subjectName = mark.subject_name || "Unknown Subject";
    if (!bySubject.has(subjectName)) {
      bySubject.set(subjectName, { subjectName, subjectCode: mark.subject_code || "", tests: {} });
    }
    bySubject.get(subjectName).tests[mark.test_type] = {
      marks: Number(mark.marks ?? mark.obtained_marks ?? 0),
      max: Number(mark.max_marks || TEST_MAX[mark.test_type] || 25),
    };
  }

  return Array.from(bySubject.values())
    .map((subject) => {
      const testEntries = Object.entries(subject.tests);
      const obtained = testEntries.reduce((sum, [, v]) => sum + Number(v.marks || 0), 0);
      const maxMarks = testEntries.reduce((sum, [t, v]) => sum + Number(v.max || TEST_MAX[t] || 25), 0);
      const percentage = maxMarks ? Math.round((obtained / maxMarks) * 1000) / 10 : 0;
      const hasActualT4 = subject.tests.T4 !== undefined;
      return {
        ...subject, obtained, maxMarks, percentage,
        average: testEntries.length ? Math.round((obtained / testEntries.length) * 10) / 10 : 0,
        status: getStatus(percentage),
        predictedT4: predictions[subject.subjectName],
        actualT4: subject.tests.T4?.marks,
        hasActualT4,
      };
    })
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
}

function AnimatedCounter({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const numeric = Number(value) || 0;
    let frameId = 0;
    let startedAt = 0;
    const tick = (time) => {
      if (!startedAt) startedAt = time;
      const progress = Math.min((time - startedAt) / 900, 1);
      setDisplay(Math.round(numeric * progress));
      if (progress < 1) frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [value]);
  return <span>{display}{suffix}</span>;
}

function ClayCard({ children, className = "", delay = 0, tint = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.005 }}
      className={`clay-panel clay-interactive ${tint} ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SkeletonBlock({ className = "" }) {
  return <div className={`skeleton-sheen rounded-2xl ${className}`} />;
}

// Multi-phase loading with fun messages
const LOADING_PHASES = [
  { emoji: "🔍", text: "Querying database" },
  { emoji: "⚙️", text: "Processing ML models" },
  { emoji: "📊", text: "Computing analytics" },
  { emoji: "🎯", text: "Generating insights" },
];

function MLLoader({ label = "Loading", size = "default" }) {
  const [phase, setPhase] = useState(0);
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const phaseTimer = setInterval(() => setPhase((p) => (p + 1) % LOADING_PHASES.length), 1800);
    const dotTimer = setInterval(() => setDotCount((d) => (d + 1) % 4), 400);
    return () => { clearInterval(phaseTimer); clearInterval(dotTimer); };
  }, []);

  const dots = ".".repeat(dotCount);
  const current = LOADING_PHASES[phase];

  if (size === "sm") {
    return (
      <div className="cube-scene-sm">
        <div className="cube-sm">
          <div className="face-sm f-front" />
          <div className="face-sm f-back" />
          <div className="face-sm f-right" />
          <div className="face-sm f-left" />
          <div className="face-sm f-top" />
          <div className="face-sm f-bottom" />
        </div>
      </div>
    );
  }

  return (
    <div className="ml-loader-wrap" role="status" aria-live="polite">
      <div className="cube-scene">
        <div className="cube-spin">
          <div className="cube-face cf-front" />
          <div className="cube-face cf-back" />
          <div className="cube-face cf-right" />
          <div className="cube-face cf-left" />
          <div className="cube-face cf-top" />
          <div className="cube-face cf-bottom" />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="ml-loader-text"
        >
          <span className="ml-loader-emoji">{current.emoji}</span>
          <span>{current.text}{dots}</span>
        </motion.div>
      </AnimatePresence>
      <div className="ml-loader-pills">
        {LOADING_PHASES.map((p, i) => (
          <span key={i} className={`ml-pill ${i === phase ? "ml-pill-active" : ""}`} />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("rankradar-theme") || "dark");
  const [page, setPage] = useState("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [student, setStudent] = useState(null);
  const [cohortData, setCohortData] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionDone, setPredictionDone] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "info" });
const [showAdminPopup, setShowAdminPopup] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("rankradar-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!toast.msg) return;
    const t = setTimeout(() => setToast({ msg: "", type: "info" }), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg, type = "info") => setToast({ msg, type });

  const analytics = useMemo(() => student?.analytics || {}, [student]);

  const semester3 = useMemo(
    () => buildSemesterSubjects(student?.marks || [], 3, predictions),
    [student, predictions]
  );
  const semester4 = useMemo(
    () => buildSemesterSubjects(student?.marks || [], 4, predictions),
    [student, predictions]
  );

  const chartSemester3 = useMemo(
    () => semester3.map((s) => ({
      subject: s.subjectName,
      T1: getMarkValue(s, "T1") || 0,
      T2: getMarkValue(s, "T2") || 0,
      T3: getMarkValue(s, "T3") || 0,
      T4: getMarkValue(s, "T4") || 0,
    })),
    [semester3]
  );

  const chartSemester4 = useMemo(
    () => semester4.map((s) => ({
      subject: s.subjectName,
      T1: getMarkValue(s, "T1") || 0,
      T2: getMarkValue(s, "T2") || 0,
      T3: getMarkValue(s, "T3") || 0,
      Predicted: s.predictedT4 || 0,
      Actual: s.actualT4 || 0,
    })),
    [semester4]
  );

  const classAverage = useMemo(() => {
    const pcts = cohortData.map((item) => Number(item.percentage || item.avg_marks || 0)).filter(Boolean);
    return pcts.length
      ? Math.round((pcts.reduce((s, v) => s + v, 0) / pcts.length) * 10) / 10
      : 0;
  }, [cohortData]);

  const analyticsCards = [
    { label: "Overall Average", value: analytics.overall_percentage ?? 0, suffix: "%", icon: Activity, tint: "clay-tint-violet" },
    { label: "Academic Score", value: analytics.academic_performance_score ?? analytics.overall_percentage ?? 0, suffix: "%", icon: BarChart3, tint: "clay-tint-cyan" },
    { label: "Strongest Subject", value: analytics.strongest_subject || analytics.strong_subjects?.[0] || "--", icon: Sparkles, text: true, tint: "clay-tint-emerald" },
    { label: "Weakest Subject", value: analytics.weakest_subject || analytics.weak_subjects?.[0] || "--", icon: AlertTriangle, text: true, tint: "clay-tint-rose" },
    { label: "Consistency", value: analytics.consistency_score ?? 0, suffix: "%", icon: Target, tint: "clay-tint-violet" },
    { label: "Growth", value: analytics.growth_percentage ?? 0, suffix: "%", icon: TrendingUp, tint: "clay-tint-cyan" },
    { label: "Batch Rank", value: analytics.batch_rank ? `#${analytics.batch_rank}` : "--", icon: BadgeCheck, text: true, tint: "clay-tint-emerald" },
    { label: "Class Average", value: classAverage, suffix: "%", icon: BrainCircuit, tint: "clay-tint-rose" },
  ];

  const insights = [
    {
      label: "Strongest Subject",
      text: analytics.strongest_subject || analytics.strong_subjects?.[0]
        ? `Performing strongly in ${analytics.strongest_subject || analytics.strong_subjects?.[0]}.`
        : "No strongest subject available yet.",
    },
    {
      label: "Weakest Subject",
      text: analytics.weakest_subject || analytics.weak_subjects?.[0]
        ? `Focus more on ${analytics.weakest_subject || analytics.weak_subjects?.[0]}.`
        : "No weak subject detected.",
    },
    {
      label: "Risk Subjects",
      text: analytics.weak_subjects?.length
        ? analytics.weak_subjects.slice(0, 3).join(", ")
        : "No high-risk subjects found.",
    },
    {
      label: "Study Suggestion",
      text: "Revise low-score topics first, then attempt one timed test before the next assessment.",
    },
  ];

  const resetToSearch = () => {
    setPage("search");
    setStudent(null);
    setPredictions({});
    setPredictionDone(false);
    setPredictionLoading(false);
    setError("");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      setError("Please enter an enrollment number.");
      showToast("Enter enrollment number", "error");
      return;
    }
    // Validate it's enrollment-only
    if (!/^\d+$/.test(query)) {
      setError("Search by enrollment number only (digits only).");
      showToast("Digits only", "error");
      return;
    }
    setSearchLoading(true);
    setError("");
    setStudent(null);
    setPredictions({});
    setPredictionDone(false);
    try {
      const result = await api.searchStudents(query);
      if (!result?.best_match) throw new Error("No student found with that enrollment number.");
      showToast("Student found — loading report...", "success");
      await openProfile(result.best_match);
    } catch (err) {
      setError(err.message || "No student matched that enrollment number.");
      showToast("Search failed", "error");
    } finally {
      setSearchLoading(false);
    }
  };

  const openProfile = async (studentRecord) => {
    const enrollmentNo = getEnrollment(studentRecord) || studentRecord?.id;
    if (!enrollmentNo) return;
    setPage("profile");
    setProfileLoading(true);
    setError("");
    setStudent(null);
    setCohortData([]);
    setPredictions({});
    setPredictionDone(false);
    try {
      const profile = await api.getStudentProfile(enrollmentNo);
      setStudent(profile);
      showToast("Profile loaded", "success");
      api.getAllAnalytics().then((items) => setCohortData(items || [])).catch(() => setCohortData([]));
    } catch (err) {
      setError(err.message || "Unable to load student profile.");
      setPage("error");
      showToast("Profile failed", "error");
    } finally {
      setProfileLoading(false);
    }
  };

const SPECIAL_ENROLLMENT = "24002171510025";
const handlePredictAll = async () => {
  console.log("CLICKED. semester4.length =", semester4.length, "enrollment =", getEnrollment(student));

  // Special case checked FIRST — works even if semester4 has no data yet.
  const currentEnrollment = String(getEnrollment(student) || "").trim();
  if (currentEnrollment === SPECIAL_ENROLLMENT) {
    setShowAdminPopup(true);
    return;
  }

  if (!semester4.length || predictionLoading || predictionDone) return;

  setPredictionLoading(true);
  showToast("Running ML prediction model...", "info");
  const results = await Promise.allSettled(
    semester4.map(async (subject) => {
      const t1 = getMarkValue(subject, "T1");
      const t2 = getMarkValue(subject, "T2");
      const t3 = getMarkValue(subject, "T3");
      if ([t1, t2, t3].some((v) => v === undefined || v === null)) {
        throw new Error(`Missing marks for ${subject.subjectName}`);
      }
      const prediction = await api.predictScore(t1, t2, t3, subject.subjectName);
      return { subjectName: subject.subjectName, score: clamp(prediction.predicted_final_score, 0, 50) };
    })
  );
  const next = {};
  for (const r of results) {
    if (r.status === "fulfilled") {
      next[r.value.subjectName] = Math.round(r.value.score * 10) / 10;
    }
  }
  setPredictions((prev) => ({ ...prev, ...next }));
  setPredictionDone(Object.keys(next).length > 0);
  setPredictionLoading(false);
  showToast(Object.keys(next).length ? "Prediction Complete ✓" : "Prediction Failed", Object.keys(next).length ? "success" : "error");
};

  /* ──────────────── FOOTER ──────────────── */
  const renderFooter = () => (
    <footer className="site-footer mt-10">
      <div className="footer-glow" />
      <div className="footer-inner">
        <div className="footer-copy">
          © 2026 🌐 <strong>LJ United Network</strong> · <span className="whitespace-nowrap">Dixit Patel</span>
        </div>
        <div className="footer-socials-wrap">
          <span className="footer-follow">Follow →</span>
          <div className="footer-socials">
            {socialLinks.map(({ label, href, icon, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="soc-btn"
                aria-label={label}
                style={{ "--soc-color": color }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );

  /* ──────────────── HEADER ──────────────── */
const renderHeader = () => (
  <motion.header
    initial={{ opacity: 0, y: -16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="clay sticky top-3 z-30 px-4 py-3"
  >
    <div className="flex items-center justify-between gap-3">
      <button onClick={resetToSearch} className="flex items-center gap-3 text-left group">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[var(--violet-400)] to-[var(--cyan-500)] text-white shadow-[inset_0_2px_3px_rgba(255,255,255,0.4),inset_0_-6px_10px_rgba(0,0,0,0.18)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
          <UserRound className="h-5 w-5" />
        </span>
<span className="text-gradient-brand flex flex-col sm:flex-row items-center gap-2">
  <span className="text-5xl font-extrabold leading-none">RankRadar</span>
  <span className="flex flex-col sm:ml-3 text-md font-medium text-gray-300">
    <p>"See your success before it happens" #MarksPrediction</p>
  </span>
</span>
      </button>
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="icon-btn"
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "sun" : "moon"}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25 }}
            className="grid place-items-center"
          >
            {isDark
              ? <Sun className="h-5 w-5 text-[var(--amber-400)]" />
              : <Moon className="h-5 w-5 text-[var(--violet-500)]" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  </motion.header>
);


  /* ──────────────── SEARCH PAGE ──────────────── */
const renderSearchPage = () => (
  <motion.section
    key="search"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -24 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="search-page-grid"
  >
    <div className="search-page-content">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="lj-badge"
      >
        <span className="lj-badge-dot" />
        LJ UNITED NETWORK
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16 }}
        className="search-tagline"
      >
        Student Performance Intelligence Platform
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.22 }}
        className="search-description"
      >
        Analyze Student Performance using{" "}
        <span className="highlight-ml">Machine Learning</span> and{" "}
        <span className="highlight-ml">Data Analytics</span>.
      </motion.p>

      {/* ML Tech badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.27 }}
        className="ml-badges"
      >
        {["Random Forest", "Gradient Boosting", "Scikit-Learn"].map((t) => (
          <span key={t} className="ml-badge">{t}</span>
        ))}
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.32 }}
        onSubmit={handleSearch}
        className="clay search-form"
      >
        <div className="search-row">
          <label className="clay-input-wrap search-input-wrap">
            <Search className="h-5 w-5 text-[var(--violet-500)]" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter enrollment number"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </label>
          <button type="submit" disabled={searchLoading} className="premium-btn search-btn">
            {searchLoading ? (
              <MLLoader size="sm" />
            ) : (
              <>
                <span>VIEW REPORT</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
        {error ? (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="search-error"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </motion.p>
        ) : (
          <p className="search-hint">
            Search by enrollment number only · Powered by ML &amp; Data Analytics
          </p>
        )}
      </motion.form>
    </div>

    <motion.div
      initial={{ opacity: 0, scale: 0.92, rotateY: -8 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.5, delay: 0.2 },
        scale: { duration: 0.5, delay: 0.2 },
        rotateY: { duration: 0.5, delay: 0.2 },
        y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
      }}
      className="hero-img-wrap"
      style={{ perspective: 1000 }}
    >
      <img
        src={heroIllustration}
        alt="RankRadar ML performance illustration"
        className="hero-img"
      />
    </motion.div>
  </motion.section>
);


  /* ──────────────── PROFILE LOADING ──────────────── */
  const renderProfileLoading = () => (
    <div className="profile-loading-wrap">
      <MLLoader label="Fetching student profile" />
      <div className="skeleton-grid">
        <SkeletonBlock className="h-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map((i) => <SkeletonBlock key={i} className="h-28" />)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-72" />
        </div>
        <SkeletonBlock className="h-60" />
      </div>
    </div>
  );

  /* ──────────────── PROFILE HERO ──────────────── */
  const renderProfileHero = () => (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="clay-panel profile-hero"
    >
      <div className="profile-hero-inner">
        <div>
          <span className="perf-badge">
            <BadgeCheck className="h-3.5 w-3.5" />
            {analytics.performance_label || analytics.performance_status || "Student Profile"}
          </span>
          <h2 className="profile-name">{student.full_name || student.name}</h2>
          <p className="profile-enroll">Enrollment · {getEnrollment(student)}</p>
          <div className="profile-tags">
            {[
              student.branch,
              student.batch ? `Batch ${student.batch}` : null,
              student.current_semester ? `Semester ${student.current_semester}` : null,
              student.roll_number ? `Roll ${student.roll_number}` : null,
            ].filter(Boolean).map((item) => (
              <span key={item} className="clay profile-tag">{item}</span>
            ))}
          </div>
        </div>
        <button onClick={resetToSearch} className="ghost-btn exit-btn">
          <LogOut className="h-4 w-4" />
          EXIT
        </button>
      </div>
    </motion.section>
  );

  const renderMarkRow = (subject, test, label, fallbackMax = TEST_MAX[test]) => (
    <tr key={test} className="mark-row">
      <td className="mark-label">{label}</td>
      <td className="mark-max">/{fallbackMax}</td>
      <td className="mark-value">{formatNumber(getMarkValue(subject, test))}</td>
    </tr>
  );

  /* ──────────────── SUBJECT CARD ──────────────── */
  const renderSubjectCard = (subject, index, { semester } = {}) => (
    <ClayCard key={subject.subjectName} delay={index * 0.04} className="subject-card">
      <div className="subject-card-header">
        <div>
          <h4 className="subject-name">{subject.subjectName}</h4>
          <p className="subject-code">{subject.subjectCode || "Subject"}</p>
        </div>
        <span className={statusChipClass[subject.status]}>{subject.status}</span>
      </div>
      <div className="marks-table-wrap">
        <table className="marks-table">
          <tbody>
            {renderMarkRow(subject, "T1", "Test 1")}
            {renderMarkRow(subject, "T2", "Test 2")}
            {renderMarkRow(subject, "T3", "Test 3")}
            {semester === 4 ? (
              <>
                <tr className="mark-row">
                  <td className="mark-label">T4 · Predicted</td>
                  <td className="mark-max">/50</td>
                  <td className="mark-value mark-predicted">{formatNumber(subject.predictedT4)}</td>
                </tr>
                <tr className="mark-row">
                  <td className="mark-label">T4 · Actual</td>
                  <td className="mark-max">/50</td>
                  <td className="mark-value">{subject.hasActualT4 ? formatNumber(subject.actualT4) : "Pending"}</td>
                </tr>
              </>
            ) : (
              renderMarkRow(subject, "T4", "Test 4", 50)
            )}
          </tbody>
        </table>
      </div>
      <div className="subject-summary">
        <span>Avg {formatNumber(subject.average)}</span>
        <span className="subject-pct">{formatNumber(subject.percentage)}%</span>
      </div>
    </ClayCard>
  );

  /* ──────────────── SEMESTER 3 ──────────────── */
  const renderSemester3 = () => (
    <section className="section-wrap">
      <div className="section-header">
        <p className="section-eyebrow">Semester III</p>
        <h3 className="section-title">Subject-wise Marks · T1–T4</h3>
      </div>
      <div className="subjects-grid">
        {semester3.length
          ? semester3.map((s, i) => renderSubjectCard(s, i, { semester: 3 }))
          : <ClayCard className="empty-card"><BookOpen className="h-8 w-8 text-[var(--amber-400)]" /><p className="empty-text">No Semester III data available.</p></ClayCard>}
      </div>
    </section>
  );

  /* ──────────────── SEMESTER 4 ──────────────── */
  const renderSemester4 = () => (
    <section className="section-wrap">
      <div className="section-header">
        <p className="section-eyebrow">Semester IV</p>
        <h3 className="section-title">Subject-wise Marks · T1–T4 &amp; ML Prediction</h3>
      </div>
      <div className="subjects-grid">
        {semester4.length
          ? semester4.map((s, i) => renderSubjectCard(s, i, { semester: 4 }))
          : <ClayCard className="empty-card"><BrainCircuit className="h-8 w-8 text-[var(--cyan-400)]" /><p className="empty-text">No Semester IV data available.</p></ClayCard>}
      </div>
      <button
        onClick={handlePredictAll}
        disabled={predictionLoading || predictionDone || !semester4.length}
        className="premium-btn predict-btn"
      >
        {predictionLoading ? (
          <><MLLoader size="sm" /><span>Running Prediction Model</span></>
        ) : predictionDone ? (
          <><CheckCircle2 className="h-5 w-5" /><span>ML Predictions Generated</span></>
        ) : (
          <><BrainCircuit className="h-5 w-5" /><span>Run ML Prediction</span></>
        )}
      </button>
    </section>
  );

  /* ──────────────── ANALYTICS ──────────────── */
  const renderAnalytics = () => (
    <section className="section-wrap">
      <div className="section-header">
        <p className="section-eyebrow">Analytics</p>
        <h3 className="section-title">Performance Snapshot</h3>
      </div>
      <div className="analytics-grid">
        {analyticsCards.map(({ label, value, suffix, icon: Icon, text, tint }, index) => (
          <ClayCard key={label} delay={index * 0.025} tint={tint} className="analytics-card">
            <span className="analytics-icon-wrap">
              <Icon className="h-4 w-4" />
            </span>
            <p className="analytics-label">{label}</p>
            <p className="analytics-value">
              {text ? value : <AnimatedCounter value={value} suffix={suffix} />}
            </p>
          </ClayCard>
        ))}
      </div>
    </section>
  );

  /* ──────────────── INSIGHTS ──────────────── */
  const renderInsights = () => (
    <section className="section-wrap">
      <div className="section-header">
        <p className="section-eyebrow">Insights</p>
        <h3 className="section-title">What to Focus On</h3>
      </div>
      <ClayCard className="insights-card">
        <div className="insights-grid">
          {insights.map((item) => (
            <div key={item.label} className="insight-item">
              <p className="insight-label">{item.label}</p>
              <p className="insight-text">{item.text}</p>
            </div>
          ))}
        </div>
      </ClayCard>
    </section>
  );

  /* ──────────────── CHARTS ──────────────── */
  const renderCharts = () => (
    <section className="section-wrap">
      <div className="section-header">
        <p className="section-eyebrow">Visualisation</p>
        <h3 className="section-title">Subject-wise Comparison</h3>
      </div>
      <div className="charts-grid">
        <ClayCard className="chart-card">
          <h4 className="chart-title">Semester III · Marks (T1–T4)</h4>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSemester3}>
                <CartesianGrid stroke="var(--hairline)" vertical={false} />
                <XAxis dataKey="subject" tick={{ fill: "currentColor", fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={70} />
                <YAxis tick={{ fill: "currentColor", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid var(--hairline)", background: "var(--panel)", fontFamily: "var(--font-body)" }} />
                <Legend />
                <Bar dataKey="T1" fill={chartColors.T1} radius={[6, 6, 0, 0]} />
                <Bar dataKey="T2" fill={chartColors.T2} radius={[6, 6, 0, 0]} />
                <Bar dataKey="T3" fill={chartColors.T3} radius={[6, 6, 0, 0]} />
                <Bar dataKey="T4" fill={chartColors.T4} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>
        <ClayCard className="chart-card">
          <h4 className="chart-title">Semester IV · ML Prediction vs Actual</h4>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSemester4}>
                <CartesianGrid stroke="var(--hairline)" vertical={false} />
                <XAxis dataKey="subject" tick={{ fill: "currentColor", fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={70} />
                <YAxis tick={{ fill: "currentColor", fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 50]} />
                <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid var(--hairline)", background: "var(--panel)", fontFamily: "var(--font-body)" }} />
                <Legend />
                <Line type="monotone" dataKey="T1" stroke={chartColors.T1} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="T2" stroke={chartColors.T2} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="T3" stroke={chartColors.T3} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Predicted" stroke={chartColors.Predicted} strokeWidth={3} dot={{ r: 4 }} name="T4 Predicted" strokeDasharray="5 3" />
                <Line type="monotone" dataKey="Actual" stroke={chartColors.Actual} strokeWidth={3} dot={{ r: 4 }} name="T4 Actual" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>
      </div>
    </section>
  );

  /* ──────────────── PROFILE PAGE ──────────────── */
  const renderProfilePage = () => {
    if (profileLoading) return renderProfileLoading();
    if (!student) {
      return (
        <div className="empty-state-wrap">
          <ClayCard className="empty-state-card">
            <img src={emptyStateIllustration} alt="" className="empty-state-img" />
            <h2 className="empty-state-title">No profile loaded</h2>
            <p className="empty-state-desc">Search a student to open the performance dashboard.</p>
            <button onClick={resetToSearch} className="premium-btn mx-auto mt-5">Back to Search</button>
          </ClayCard>
        </div>
      );
    }
    return (
      <motion.div
        key="profile"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="profile-page"
      >
        {renderProfileHero()}
        {renderSemester3()}
        {renderSemester4()}
        {renderAnalytics()}
        {renderCharts()}
        {renderInsights()}
      </motion.div>
    );
  };

  /* ──────────────── ERROR PAGE ──────────────── */
  const renderErrorPage = () => (
    <div className="empty-state-wrap">
      <ClayCard tint="clay-tint-rose" className="error-card">
        {/* Danger sign */}
        <div className="danger-sign">
          <svg viewBox="0 0 100 88" className="danger-triangle" aria-hidden="true">
            <polygon points="50,6 96,82 4,82" fill="none" stroke="var(--rose-500)" strokeWidth="7" strokeLinejoin="round"/>
            <text x="50" y="70" textAnchor="middle" fontSize="44" fill="var(--rose-500)" fontWeight="bold">!</text>
          </svg>
        </div>
        <h2 className="error-title">Something Went Wrong</h2>
        <p className="error-desc">{error || "Profile could not be loaded."}</p>
        <button onClick={resetToSearch} className="premium-btn mx-auto mt-5">Back to Search</button>
      </ClayCard>
    </div>
  );

  /* ──────────────── ROOT ──────────────── */
  return (
    <div className="app-shell">
      <div className="app-inner">
        {renderHeader()}
        <main className="app-main">
          <AnimatePresence mode="wait">
            {page === "search" && renderSearchPage()}
            {page === "profile" && renderProfilePage()}
            {page === "error" && renderErrorPage()}
          </AnimatePresence>
        </main>
        {renderFooter()}
      </div>

      {/* Admin Popup */}
      <AnimatePresence>
        {showAdminPopup && (
          <motion.div
            className="admin-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setShowAdminPopup(false)}
          >
            <motion.div
              className="admin-popup-card"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-popup-danger-sign">
                <svg viewBox="0 0 100 88" className="admin-popup-triangle" aria-hidden="true">
                  <polygon points="50,6 96,82 4,82" fill="none" stroke="var(--rose-500)" strokeWidth="7" strokeLinejoin="round" />
                  <text x="50" y="70" textAnchor="middle" fontSize="44" fill="var(--rose-500)" fontWeight="bold">!</text>
                </svg>
              </div>
              <p className="admin-popup-label">ADMIN ONLY</p>
              <h2 className="admin-popup-title">Admin nu Prediction Jova aavya ta</h2>
              <h3 className="admin-popup-haha">HAHAHAHA</h3>
              <p className="admin-popup-subtext">Tamari bhali thay ••• Tame tamaru karo ne</p>
              <button onClick={() => setShowAdminPopup(false)} className="premium-btn admin-popup-close-btn">
                ← Back to Home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast.msg && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`toast toast-${toast.type}`}
          >
            {toast.type === "error" && <AlertTriangle className="h-4 w-4 shrink-0" />}
            {toast.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
