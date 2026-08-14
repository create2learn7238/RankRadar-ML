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
import EngineRedirectOverlay from "./components/EngineRedirectOverlay";
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
    const subjectCode = mark.subject_code || "";
    const isFCSP2 = subjectCode === "FCSP-II" || subjectName.toLowerCase().includes("foundation of computer science");

    // Do not try to fetch T4 from DB for FCSP-II as per requirement
    if (isFCSP2 && mark.test_type === "T4") continue;

    if (!bySubject.has(subjectName)) {
      bySubject.set(subjectName, { subjectName, subjectCode, tests: {} });
    }
    
    // T4 marks stored out of 25 are scaled by 2 to show out of 50 (e.g. 18 -> 36)
    let markVal = Number(mark.marks ?? mark.obtained_marks ?? 0);
    if (mark.test_type === "T4" && markVal <= 25) {
      markVal = Math.round(markVal * 2 * 10) / 10;
    }

    bySubject.get(subjectName).tests[mark.test_type] = {
      marks: markVal,
      max: Number(mark.test_type === "T4" ? 50 : (mark.max_marks || TEST_MAX[mark.test_type] || 25)),
    };
  }

  return Array.from(bySubject.values())
    .map((subject) => {
      const isFCSP2 = subject.subjectCode === "FCSP-II" || subject.subjectName.toLowerCase().includes("foundation of computer science");
      
      if (isFCSP2) {
        const t1 = subject.tests.T1?.marks;
        const t2 = subject.tests.T2?.marks;
        const t3 = subject.tests.T3?.marks;
        const validMarks = [t1, t2, t3].filter((v) => v !== undefined && v !== null);
        if (validMarks.length > 0) {
          const avg25 = validMarks.reduce((a, b) => a + Number(b), 0) / validMarks.length;
          const t4Avg50 = Math.round(avg25 * 2 * 10) / 10;
          subject.tests.T4 = { marks: t4Avg50, max: 50 };
        }
      }

      const testEntries = Object.entries(subject.tests);
      const obtained = testEntries.reduce((sum, [, v]) => sum + Number(v.marks || 0), 0);
      const maxMarks = testEntries.reduce((sum, [t, v]) => sum + Number(v.max || TEST_MAX[t] || 25), 0);
      const percentage = maxMarks ? Math.round((obtained / maxMarks) * 1000) / 10 : 0;
      const hasActualT4 = subject.tests.T4 !== undefined;
      const predictedT4 = isFCSP2 ? subject.tests.T4?.marks : predictions[subject.subjectName];
      return {
        ...subject, obtained, maxMarks, percentage,
        average: testEntries.length ? Math.round((obtained / testEntries.length) * 10) / 10 : 0,
        status: getStatus(percentage),
        predictedT4,
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

function parseRouteFromUrl() {
  const path = window.location.pathname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace("#", "").toLowerCase();

  let enrollment = searchParams.get("student") || searchParams.get("enrollment") || searchParams.get("id") || "";
  
  if (!enrollment) {
    const parts = path.split("/").filter(Boolean);
    if ((parts[0] === "student" || parts[0] === "profile") && parts[1]) {
      enrollment = parts[1];
    }
  }

  if (!enrollment) {
    enrollment = localStorage.getItem("rankradar-last-student") || "";
  }

  let targetPage = "search";
  let targetSection = hash || "overview";

  if (path.includes("/dashboard") || path.includes("/profile") || path.includes("/student")) {
    targetPage = enrollment ? "profile" : "search";
  } else if (path.includes("/prediction") || path.includes("/predict")) {
    targetPage = enrollment ? "profile" : "search";
    targetSection = "sem4";
  } else if (path.includes("/analytics") || path.includes("/charts")) {
    targetPage = enrollment ? "profile" : "search";
    targetSection = "charts";
  } else if (path.includes("/history") || path.includes("/sem3")) {
    targetPage = enrollment ? "profile" : "search";
    targetSection = "sem3";
  } else if (enrollment && (path !== "/" && path !== "/search")) {
    targetPage = "profile";
  }

  return { targetPage, enrollment, targetSection, path };
}

function updateBrowserUrl(routePath, enrollmentNo = "") {
  const url = enrollmentNo ? `${routePath}?student=${encodeURIComponent(enrollmentNo)}` : routePath;
  if (window.location.pathname + window.location.search !== url) {
    window.history.pushState({ routePath, enrollmentNo }, "", url);
  }
}

function App() {
  const initialRoute = parseRouteFromUrl();
  const [theme, setTheme] = useState(() => localStorage.getItem("rankradar-theme") || "dark");
  const [page, setPage] = useState(() => (initialRoute.enrollment && initialRoute.targetPage === "profile" ? "profile" : "search"));
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(() => Boolean(initialRoute.enrollment && initialRoute.targetPage === "profile"));
  const [isRedirecting, setIsRedirecting] = useState(false);
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

  // Route state rehydration on page load / refresh
  useEffect(() => {
    const routeInfo = parseRouteFromUrl();
    if (routeInfo.enrollment && routeInfo.targetPage === "profile") {
      localStorage.setItem("rankradar-last-student", routeInfo.enrollment);
      openProfile(routeInfo.enrollment).then(() => {
        if (routeInfo.targetSection) {
          setTimeout(() => {
            const el = document.getElementById(routeInfo.targetSection);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 350);
        }
      });
    } else {
      setPage("search");
    }

    const handlePopState = () => {
      const info = parseRouteFromUrl();
      if (info.enrollment && info.targetPage === "profile") {
        openProfile(info.enrollment);
      } else {
        setPage("search");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
    localStorage.removeItem("rankradar-last-student");
    updateBrowserUrl("/");
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
    setIsRedirecting(true);
    setError("");
    setStudent(null);
    setPredictions({});
    setPredictionDone(false);
    try {
      const result = await api.searchStudents(query);
      if (!result?.best_match) throw new Error("No student found with that enrollment number.");
      showToast("Student found — booting ML engine...", "success");
      await openProfile(result.best_match);
    } catch (err) {
      setError(err.message || "No student matched that enrollment number.");
      showToast("Search failed", "error");
      setIsRedirecting(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const openProfile = async (studentRecord) => {
    const enrollmentNo = typeof studentRecord === "string" ? studentRecord : (getEnrollment(studentRecord) || studentRecord?.id);
    if (!enrollmentNo) return;
    localStorage.setItem("rankradar-last-student", enrollmentNo);
    updateBrowserUrl("/dashboard", enrollmentNo);
    setPage("profile");
    setProfileLoading(true);
    setIsRedirecting(true);
    setError("");
    setStudent(null);
    setCohortData([]);
    setPredictions({});
    setPredictionDone(false);
    try {
      const [profile] = await Promise.all([
        api.getStudentProfile(enrollmentNo),
        new Promise((resolve) => setTimeout(resolve, 1400)),
      ]);
      setStudent(profile);
      showToast("Profile loaded", "success");
      api.getAllAnalytics().then((items) => setCohortData(items || [])).catch(() => setCohortData([]));
    } catch (err) {
      setError(err.message || "Unable to load student profile.");
      setPage("error");
      showToast("Profile failed", "error");
    } finally {
      setProfileLoading(false);
      setIsRedirecting(false);
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
      const isFCSP2 = subject.subjectCode === "FCSP-II" || subject.subjectName.toLowerCase().includes("foundation of computer science");
      const t1 = getMarkValue(subject, "T1");
      const t2 = getMarkValue(subject, "T2");
      const t3 = getMarkValue(subject, "T3");
      if (isFCSP2) {
        const valid = [t1, t2, t3].filter((v) => v !== undefined && v !== null);
        const avg = valid.length ? (valid.reduce((a, b) => a + Number(b), 0) / valid.length) * 2 : 0;
        return { subjectName: subject.subjectName, score: Math.round(avg * 10) / 10 };
      }
      if ([t1, t2, t3].some((v) => v === undefined || v === null)) {
        throw new Error(`Missing marks for ${subject.subjectName}`);
      }
      const prediction = await api.predictScore(t1, t2, t3, subject.subjectName);
      let predScore = Number(prediction.predicted_final_score || 0);
      if (predScore > 0 && predScore <= 25) {
        predScore = predScore * 2;
      }
      return { subjectName: subject.subjectName, score: clamp(predScore, 0, 50) };
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
    className="clay sticky top-3 z-30 px-4 py-2.5 mb-4"
  >
    <div className="flex items-center justify-between gap-3">
      <button onClick={resetToSearch} className="flex items-center gap-3 text-left group shrink-0">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-indigo-500)] to-[var(--color-cyan-500)] text-white shadow-md transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
          <UserRound className="h-5 w-5" />
        </span>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent">RankRadar</span>
          <span className="text-xs font-medium text-slate-400 hidden xl:inline-block">
            "See your success before it happens" #MarksPrediction
          </span>
        </div>
      </button>

      {/* Header Center Navigation Pills (Visible when on Profile page) */}
      {page === "profile" && student && (
        <div className="hidden md:flex items-center gap-1 bg-[rgba(15,23,42,0.6)] backdrop-blur-md px-2 py-1 rounded-full border border-[rgba(255,255,255,0.08)]">
          <button onClick={() => scrollToSection("overview")} className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white hover:bg-[rgba(99,102,241,0.2)] transition-all flex items-center gap-1.5 cursor-pointer">
            <UserRound className="h-3.5 w-3.5 text-[var(--color-cyan-400)]" /> Overview
          </button>
          <button onClick={() => scrollToSection("sem4")} className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white hover:bg-[rgba(99,102,241,0.2)] transition-all flex items-center gap-1.5 cursor-pointer">
            <BrainCircuit className="h-3.5 w-3.5 text-[var(--color-cyan-400)]" /> ML Predict
          </button>
          <button onClick={() => scrollToSection("sem3")} className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white hover:bg-[rgba(99,102,241,0.2)] transition-all flex items-center gap-1.5 cursor-pointer">
            <BookOpen className="h-3.5 w-3.5 text-[var(--color-violet-400)]" /> Sem III
          </button>
          <button onClick={() => scrollToSection("charts")} className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white hover:bg-[rgba(99,102,241,0.2)] transition-all flex items-center gap-1.5 cursor-pointer">
            <BarChart3 className="h-3.5 w-3.5 text-[var(--color-cyan-400)]" /> Charts
          </button>
          <button onClick={() => scrollToSection("insights")} className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white hover:bg-[rgba(99,102,241,0.2)] transition-all flex items-center gap-1.5 cursor-pointer">
            <Target className="h-3.5 w-3.5 text-[var(--color-amber-400)]" /> Insights
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0">
        {/* Header Exit Button (Visible when on Profile page) */}
        {page === "profile" && (
          <button
            onClick={resetToSearch}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105"
          >
            <LogOut className="h-4 w-4" />
            <span>EXIT</span>
          </button>
        )}

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
          <button type="submit" disabled={searchLoading || isRedirecting} className="premium-btn search-btn group">
            {searchLoading || isRedirecting ? (
              <span className="flex items-center gap-2 font-mono text-xs text-cyan-200">
                <BrainCircuit className="h-4 w-4 animate-spin text-cyan-300" />
                <span>ENGINE RUNNING...</span>
              </span>
            ) : (
              <>
                <span>VIEW REPORT</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Enrollment Chips */}
        <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[var(--color-cyan-400)]" />
            Try Demos:
          </span>
          {[
            { tag: "Demo 1", enroll: "24002171410039" },
            { tag: "Demo 2", enroll: "24002170210107" },
            { tag: "Demo 3", enroll: "24002171510025" },
          ].map(({ tag, enroll }) => (
            <button
              key={enroll}
              type="button"
              disabled={isRedirecting}
              onClick={() => {
                setSearchTerm(enroll);
                openProfile(enroll);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(99,102,241,0.18)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(0,240,255,0.4)] text-[11px] font-mono text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-sans text-[10px] font-bold text-[var(--color-cyan-400)]">{tag}</span>
              <span className="opacity-90">{enroll}</span>
            </button>
          ))}
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
        y: { duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
      }}
      className="hero-img-wrap"
      style={{ perspective: 1000 }}
    >
      <img
        src={heroIllustration}
        alt="AI Student Performance Intelligence"
        className="hero-img"
      />
    </motion.div>
  </motion.section>
);


  /* ──────────────── PROFILE LOADING ──────────────── */
  const renderProfileLoading = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="clay-panel my-12 p-8 md:p-12 text-center max-w-xl mx-auto shadow-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-cyan-500/5 to-purple-500/10 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="mb-6 flex items-center justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider uppercase shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <BrainCircuit className="h-3.5 w-3.5 animate-pulse" />
            RankRadar ML Engine Active
          </span>
        </div>

        <MLLoader label="Executing Machine Learning Model" />

        <p className="text-xs text-slate-400 mt-4 max-w-md">
          Analyzing historical test records, calculating batch percentiles, and predicting Semester IV performance...
        </p>

        {/* Animated Progress Bar */}
        <div className="w-full max-w-xs bg-slate-800/80 rounded-full h-2 mt-6 overflow-hidden border border-white/10 p-0.5">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.95, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)]"
          />
        </div>
      </div>
    </motion.div>
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

  const renderMarkRow = (subject, test, label, fallbackMax = TEST_MAX[test]) => {
    const val = getMarkValue(subject, test);
    return (
      <tr key={test} className="mark-row">
        <td className="mark-label">{label}</td>
        <td className="mark-value font-mono text-right">
          {val !== undefined && val !== null ? `${formatNumber(val)} / ${fallbackMax}` : `-- / ${fallbackMax}`}
        </td>
      </tr>
    );
  };

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
                  <td className="mark-value mark-predicted font-mono text-right">
                    {subject.predictedT4 !== undefined ? (
                      <>
                        <AnimatedCounter value={subject.predictedT4} /> / 50
                      </>
                    ) : (
                      "-- / 50"
                    )}
                  </td>
                </tr>
                <tr className="mark-row">
                  <td className="mark-label">T4 · Actual</td>
                  <td className="mark-value font-mono text-right">
                    {subject.hasActualT4 ? `${formatNumber(subject.actualT4)} / 50` : "Pending"}
                  </td>
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
  const renderSemester4 = () => {
    const predictedScores = semester4.map((s) => s.predictedT4).filter((v) => v !== undefined && v !== null);
    const avgPredicted = predictedScores.length
      ? Math.round((predictedScores.reduce((a, b) => a + Number(b), 0) / predictedScores.length) * 10) / 10
      : 0;

    return (
      <section className="section-wrap">
        <div className="section-header flex items-center justify-between">
          <div>
            <p className="section-eyebrow">Semester IV Intelligence</p>
            <h3 className="section-title">ML Marks Prediction &amp; Test Tracking</h3>
          </div>
          <span className="ml-model-tag">
            <BrainCircuit className="h-4 w-4" />
            ML Model Engine Active
          </span>
        </div>

        {/* Prediction Summary Hero Banner */}
        <div className="ml-prediction-hero">
          <div className="ml-prediction-header">
            <div>
              <h4 className="text-lg font-bold text-[var(--text-primary)]">Semester IV Final Test (T4) ML Predictor</h4>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Calculates predicted T4 score out of 50 based on T1, T2, &amp; T3 historical test trends.
              </p>
            </div>
            <button
              onClick={handlePredictAll}
              disabled={predictionLoading || predictionDone || !semester4.length}
              className="premium-btn"
            >
              {predictionLoading ? (
                <><MLLoader size="sm" /><span>Executing ML Model...</span></>
              ) : predictionDone ? (
                <><CheckCircle2 className="h-5 w-5 text-emerald-400" /><span>ML Predictions Ready</span></>
              ) : (
                <><BrainCircuit className="h-5 w-5 text-cyan-400" /><span>Run ML Prediction</span></>
              )}
            </button>
          </div>

          <div className="prediction-stats-row">
            <div className="prediction-stat-box">
              <span className="prediction-stat-label">Model Algorithms</span>
              <span className="text-xs font-semibold text-[var(--color-indigo-400)]">Random Forest &amp; GBDT</span>
            </div>
            <div className="prediction-stat-box">
              <span className="prediction-stat-label">Predicted T4 Average</span>
              <span className="prediction-stat-val">{predictionDone ? `${avgPredicted} / 50` : "-- / 50"}</span>
            </div>
            <div className="prediction-stat-box">
              <span className="prediction-stat-label">Prediction Status</span>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                {predictionDone ? "Generated ✓" : predictionLoading ? "Computing..." : "Pending Execution"}
              </span>
            </div>
            <div className="prediction-stat-box">
              <span className="prediction-stat-label">Target Max Marks</span>
              <span className="prediction-stat-val">50 Marks</span>
            </div>
          </div>
        </div>

        <div className="subjects-grid">
          {semester4.length
            ? semester4.map((s, i) => renderSubjectCard(s, i, { semester: 4 }))
            : <ClayCard className="empty-card"><BrainCircuit className="h-8 w-8 text-[var(--cyan-400)]" /><p className="empty-text">No Semester IV data available.</p></ClayCard>}
        </div>
      </section>
    );
  };

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
        <p className="section-eyebrow">Visual Analytics</p>
        <h3 className="section-title">Subject-wise Comparison &amp; ML Trends</h3>
      </div>
      <div className="charts-grid">
        <ClayCard className="chart-card">
          <h4 className="chart-title">Semester III · Test Marks (T1–T4)</h4>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSemester3}>
                <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={70} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border-subtle)", background: "var(--glass-bg)", backdropFilter: "blur(12px)", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }} />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
                <Bar dataKey="T1" fill={chartColors.T1} radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1200} />
                <Bar dataKey="T2" fill={chartColors.T2} radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1200} />
                <Bar dataKey="T3" fill={chartColors.T3} radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1200} />
                <Bar dataKey="T4" fill={chartColors.T4} radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>

        <ClayCard className="chart-card">
          <h4 className="chart-title">Semester IV · ML Prediction vs Actual Trends</h4>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSemester4}>
                <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={70} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 50]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border-subtle)", background: "var(--glass-bg)", backdropFilter: "blur(12px)", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }} />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
                <Line type="monotone" dataKey="T1" stroke={chartColors.T1} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={true} animationDuration={1200} />
                <Line type="monotone" dataKey="T2" stroke={chartColors.T2} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={true} animationDuration={1200} />
                <Line type="monotone" dataKey="T3" stroke={chartColors.T3} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={true} animationDuration={1200} />
                <Line type="monotone" dataKey="Predicted" stroke={chartColors.Predicted} strokeWidth={3} dot={{ r: 4 }} name="T4 Predicted" strokeDasharray="5 3" isAnimationActive={true} animationDuration={1200} />
                <Line type="monotone" dataKey="Actual" stroke={chartColors.Actual} strokeWidth={3} dot={{ r: 4 }} name="T4 Actual" isAnimationActive={true} animationDuration={1200} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>
      </div>
    </section>
  );

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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
        <div className="app-dashboard-shell">
          <div className="app-main-workspace pb-20 md:pb-0">
            <div id="overview" className="space-y-6">
              {renderProfileHero()}
              {renderAnalytics()}
            </div>
            <div id="sem4">{renderSemester4()}</div>
            <div id="sem3">{renderSemester3()}</div>
            <div id="charts">{renderCharts()}</div>
            <div id="insights">{renderInsights()}</div>
          </div>
        </div>

        {/* Mobile Glass Bottom Navigation Bar (<768px) */}
        <nav className="app-mobile-nav flex md:hidden" aria-label="Mobile Navigation">
          <button onClick={() => scrollToSection("overview")} className="mobile-nav-btn active">
            <UserRound className="h-4 w-4" />
            <span>Overview</span>
          </button>
          <button onClick={() => scrollToSection("sem4")} className="mobile-nav-btn">
            <BrainCircuit className="h-4 w-4 text-[var(--color-cyan-400)]" />
            <span>Predict</span>
          </button>
          <button onClick={() => scrollToSection("sem3")} className="mobile-nav-btn">
            <BookOpen className="h-4 w-4" />
            <span>Sem III</span>
          </button>
          <button onClick={() => scrollToSection("charts")} className="mobile-nav-btn">
            <BarChart3 className="h-4 w-4" />
            <span>Charts</span>
          </button>
          <button onClick={resetToSearch} className="mobile-nav-btn text-rose-400">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
        </nav>
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
      <EngineRedirectOverlay
        isVisible={profileLoading || isRedirecting}
        enrollmentNo={searchTerm || (student ? getEnrollment(student) : "") || initialRoute.enrollment}
      />
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
