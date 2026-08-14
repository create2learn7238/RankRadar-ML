import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Cpu,
  Zap,
  Activity,
  CheckCircle2,
  Sparkles,
  Gauge,
  Radio,
  Binary,
  Layers
} from "lucide-react";

const TELEMETRY_STEPS = [
  { id: 1, label: "BOOTING RANKRADAR ML ENGINE v4.2...", detail: "Spinning neural matrix core & prediction pipeline" },
  { id: 2, label: "FETCHING ACADEMIC RECORDS & METRICS...", detail: "Parsing past test scores & subject statistics" },
  { id: 3, label: "CALIBRATING PREDICTIVE ALGORITHMS...", detail: "Executing Random Forest & Gradient Boosting models" },
  { id: 4, label: "COMPUTING BATCH PERCENTILES & RANK VECTORS...", detail: "Benchmarking performance against cohort telemetry" },
  { id: 5, label: "SYNTHESIZING REPORT & INTELLIGENCE RADAR...", detail: "Generating final grade forecasts & AI recommendations" }
];

export default function EngineRedirectOverlay({ isVisible, enrollmentNo }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setProgress(6);
      return;
    }

    // Smooth progress counter simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98; // hold at 98% until transition ends
        const stepInc = Math.floor(Math.random() * 14) + 8;
        return Math.min(prev + stepInc, 98);
      });
    }, 180);

    // Sequence through telemetry log steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < TELEMETRY_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 250);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const currentStepData = TELEMETRY_STEPS[currentStep] || TELEMETRY_STEPS[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[rgba(5,8,18,0.95)] backdrop-blur-2xl px-4 py-8 select-none"
      >
        {/* Animated Background Rays & Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(99,102,241,0.2),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.15),transparent_50%)] pointer-events-none" />
        <div className="engine-grid-bg absolute inset-0 opacity-20 pointer-events-none" />

        {/* Engine Header Tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-wrap items-center justify-center gap-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(6,182,212,0.12)] border border-[rgba(6,182,212,0.35)] text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
            <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            RANKRADAR ENGINE ACTIVE
          </div>

          {enrollmentNo && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-slate-300 text-xs font-mono shadow-inner">
              <span className="text-slate-500 font-sans font-medium text-[11px]">STUDENT ENROLLMENT:</span>
              <span className="text-cyan-300 font-bold tracking-wide">{enrollmentNo}</span>
            </div>
          )}
        </motion.div>

        {/* Central Engine Turbine Reactor Animation */}
        <div className="relative mb-8 flex items-center justify-center w-48 h-48 sm:w-60 sm:h-60">
          {/* Outer Dashed Spinning Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40 animate-[spin_14s_linear_infinite]" />
          
          {/* Counter Rotating Ring */}
          <div className="absolute inset-3 rounded-full border-2 border-indigo-500/40 border-t-cyan-400 border-b-purple-500 animate-[spin_9s_linear_infinite_reverse]" />

          {/* Glowing Reactor Glow Base */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-600/20 via-cyan-500/25 to-purple-600/20 backdrop-blur-md border border-white/15 shadow-[0_0_50px_rgba(99,102,241,0.45)] animate-pulse" />

          {/* Innermost Speed Ring */}
          <div className="absolute inset-12 rounded-full border-2 border-cyan-400/30 border-r-cyan-400 animate-[spin_4s_linear_infinite]" />

          {/* Central Reactor Orb */}
          <motion.div
            animate={{ scale: [0.94, 1.06, 0.94] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 grid h-24 w-24 sm:h-28 sm:w-28 place-items-center rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-[0_0_40px_rgba(6,182,212,0.7)] border border-white/40"
          >
            <BrainCircuit className="h-12 w-12 sm:h-14 sm:w-14 animate-pulse text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
          </motion.div>

          {/* Orbiting Energy Dots */}
          <div className="absolute inset-0 animate-[spin_6s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_16px_#00f0ff]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_14px_#6366f1]" />
          </div>
        </div>

        {/* Live Percentage Counter Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center mb-6"
        >
          <div className="flex items-baseline gap-1 font-mono font-black text-5xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 drop-shadow-[0_0_24px_rgba(6,182,212,0.5)] tracking-tight">
            <span>{progress}</span>
            <span className="text-3xl sm:text-4xl text-cyan-400">%</span>
          </div>
          <span className="text-[11px] font-mono tracking-widest text-slate-300 uppercase mt-1 flex items-center gap-1.5 font-semibold">
            <Gauge className="h-3.5 w-3.5 text-cyan-400" />
            ENGINE CALIBRATION IN PROGRESS
          </span>
        </motion.div>

        {/* Telemetry Log Terminal Card */}
        <div className="w-full max-w-lg rounded-2xl bg-[rgba(15,23,42,0.85)] border border-[rgba(255,255,255,0.15)] p-5 backdrop-blur-md shadow-2xl space-y-4">
          
          {/* Progress Bar Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold text-cyan-300">
                <Activity className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
                {currentStepData.label}
              </span>
              <span className="text-slate-400 font-bold">{currentStep + 1}/{TELEMETRY_STEPS.length}</span>
            </div>

            {/* Glowing Engine Progress Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full p-0.5 border border-white/10 overflow-hidden relative shadow-inner">
              <motion.div
                initial={{ width: "6%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 shadow-[0_0_16px_rgba(0,240,255,0.9)] relative overflow-hidden"
              >
                {/* Shimmer sweep effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_1.4s_infinite]" />
              </motion.div>
            </div>
          </div>

          {/* Telemetry Console Lines */}
          <div className="rounded-xl bg-slate-950/90 p-3.5 border border-white/10 font-mono text-xs space-y-2.5 max-h-40 overflow-y-auto">
            {TELEMETRY_STEPS.map((step, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-2.5 transition-all duration-300 ${
                    isCurrent
                      ? "text-cyan-300 font-semibold opacity-100 scale-[1.01]"
                      : isDone
                      ? "text-slate-400 opacity-85"
                      : "text-slate-600 opacity-40"
                  }`}
                >
                  <span className="shrink-0 mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <Zap className="h-3.5 w-3.5 text-cyan-400 animate-bounce" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-slate-700 grid place-items-center text-[9px] text-slate-600">
                        {step.id}
                      </div>
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold">{step.label}</p>
                    {isCurrent && (
                      <p className="text-[10px] text-cyan-400/90 mt-0.5 animate-pulse font-sans">
                        ↳ {step.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans border-t border-white/10 pt-2.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Machine Learning & Data Analytics Engine
            </span>
            <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase">
              RankRadar Core v4.2
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
