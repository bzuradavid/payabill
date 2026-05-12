"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "payabill:dashboard-tour-seen";

type Placement = "top" | "bottom" | "left" | "right";

interface TourStep {
  targetId: string;
  title: string;
  body: string;
  placement: Placement;
}

const STEPS: TourStep[] = [
  {
    targetId: "tour-kpi-cards",
    title: "Your AP at a glance",
    body: "Total outstanding, due-soon, overdue, and paid-this-month — the four numbers that matter.",
    placement: "bottom",
  },
  {
    targetId: "tour-pending-approvals",
    title: "What needs your attention",
    body: "Bills your staff submitted are queued here. Click any to approve or reject.",
    placement: "top",
  },
  {
    targetId: "tour-recent-bills",
    title: "The full pipeline",
    body: "Track bills as they move from draft → pending → approved → scheduled → paid.",
    placement: "top",
  },
  {
    targetId: "tour-staff-nav",
    title: "Add your team",
    body: "Invite staff by email. They'll join this workspace and can submit bills for your approval.",
    placement: "right",
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function DashboardTour() {
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);

  // Decide whether to show the tour after mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY)) return;
    setStep(0);
  }, []);

  // Lift the current target above the backdrop while its step is active.
  useEffect(() => {
    if (step === null) return;
    const target = document.getElementById(STEPS[step]!.targetId);
    if (!target) return;
    const prev = { position: target.style.position, zIndex: target.style.zIndex };
    target.style.position = "relative";
    target.style.zIndex = "101";
    return () => {
      target.style.position = prev.position;
      target.style.zIndex = prev.zIndex;
    };
  }, [step]);

  const measure = useCallback(() => {
    if (step === null) return;
    const target = document.getElementById(STEPS[step]!.targetId);
    if (!target) {
      setRect(null);
      return;
    }
    const r = target.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (step === null) return;
    const handler = () => measure();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [step, measure]);

  // Scroll target into view when advancing.
  useEffect(() => {
    if (step === null) return;
    const target = document.getElementById(STEPS[step]!.targetId);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [step]);

  const finish = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setStep(null);
  }, []);

  if (step === null) return null;
  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Backdrop — clicks dismiss */}
      <button
        type="button"
        aria-label="Skip tour"
        onClick={finish}
        className="bg-brand-900/55 fixed inset-0 z-[100] cursor-default backdrop-blur-[2px]"
      />

      {/* Spotlight outline on the target */}
      {rect && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[101] rounded-2xl shadow-[0_0_0_4px_rgba(255,255,255,0.5),0_20px_60px_-10px_rgba(76,68,204,0.6)] ring-2 ring-white/80"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      )}

      {/* Tooltip card */}
      <TourCard
        rect={rect}
        step={current}
        stepIndex={step}
        total={STEPS.length}
        isLast={isLast}
        onBack={() => setStep((s) => (s === null ? null : Math.max(0, s - 1)))}
        onNext={() => {
          if (isLast) finish();
          else setStep((s) => (s === null ? null : s + 1));
        }}
        onSkip={finish}
      />
    </>
  );
}

function TourCard({
  rect,
  step,
  stepIndex,
  total,
  isLast,
  onBack,
  onNext,
  onSkip,
}: {
  rect: Rect | null;
  step: TourStep;
  stepIndex: number;
  total: number;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const cardW = 320;
  const cardH = 180;
  const gap = 16;

  // Fallback to center if we couldn't measure.
  let top =
    typeof window !== "undefined" ? window.innerHeight / 2 - cardH / 2 : 200;
  let left =
    typeof window !== "undefined" ? window.innerWidth / 2 - cardW / 2 : 200;

  if (rect) {
    switch (step.placement) {
      case "bottom":
        top = rect.top + rect.height + gap;
        left = rect.left + rect.width / 2 - cardW / 2;
        break;
      case "top":
        top = rect.top - cardH - gap;
        left = rect.left + rect.width / 2 - cardW / 2;
        break;
      case "right":
        top = rect.top + rect.height / 2 - cardH / 2;
        left = rect.left + rect.width + gap;
        break;
      case "left":
        top = rect.top + rect.height / 2 - cardH / 2;
        left = rect.left - cardW - gap;
        break;
    }
    // Clamp to viewport.
    if (typeof window !== "undefined") {
      const maxLeft = window.innerWidth - cardW - 12;
      const maxTop = window.innerHeight - cardH - 12;
      left = Math.max(12, Math.min(left, maxLeft));
      top = Math.max(12, Math.min(top, maxTop));
    }
  }

  return (
    <div
      role="dialog"
      aria-labelledby="dashboard-tour-title"
      className="fixed z-[102] w-80 rounded-2xl border border-[#ecebff] bg-white p-4 shadow-2xl"
      style={{ top, left }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[0.7rem] font-medium tracking-widest text-[#10A6CC] uppercase">
            Step {stepIndex + 1} of {total}
          </p>
          <p
            id="dashboard-tour-title"
            className="mt-1 text-sm font-semibold text-[#1a174f]"
          >
            {step.title}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            {step.body}
          </p>
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="-mt-1 -mr-1 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Skip tour"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          Skip tour
        </button>
        <div className="flex items-center gap-2">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={onBack}
              className="hover:bg-brand-50 rounded-full border border-[#ecebff] bg-white px-3 py-1.5 text-xs font-semibold text-[#312D97] transition-colors"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-[#312D97] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#251f7e]"
          >
            {isLast ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
