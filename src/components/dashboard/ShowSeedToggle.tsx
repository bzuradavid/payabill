"use client";

import { useEffect, useState, useTransition } from "react";
import { Switch } from "~/components/ui/Switch";
import { setShowSeed } from "~/actions/preferences";

interface ShowSeedToggleProps {
  initialShowSeed: boolean;
}

const TOUR_STORAGE_KEY = "payables:demo-toggle-tour-seen";

export function ShowSeedToggle({ initialShowSeed }: ShowSeedToggleProps) {
  const [showSeed, setShowSeedState] = useState(initialShowSeed);
  const [isPending, startTransition] = useTransition();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(TOUR_STORAGE_KEY)) {
      setShowTour(true);
    }
  }, []);

  const dismissTour = () => {
    setShowTour(false);
    window.localStorage.setItem(TOUR_STORAGE_KEY, "1");
  };

  const handleChange = (next: boolean) => {
    setShowSeedState(next);
    startTransition(async () => {
      const result = await setShowSeed(next);
      if (!result.success) {
        // Revert on failure
        setShowSeedState(!next);
      }
    });
  };

  return (
    <>
      {showTour && (
        <button
          type="button"
          aria-label="Dismiss tour"
          onClick={dismissTour}
          className="fixed inset-0 z-100 cursor-default bg-brand-900/50 backdrop-blur-[2px] animate-[fadeIn_200ms_ease-out]"
        />
      )}
      <div className="relative">
        <div
          className={
            showTour
              ? "relative z-101 flex items-center gap-3 rounded-2xl border border-[#ecebff] bg-white px-4 py-2.5 shadow-[0_0_0_4px_rgba(255,255,255,0.4),0_20px_60px_-10px_rgba(76,68,204,0.5)]"
              : "flex items-center gap-3 rounded-2xl border border-[#ecebff] bg-white px-4 py-2.5 shadow-sm"
          }
        >
          <Switch
            checked={showSeed}
            onChange={handleChange}
            disabled={isPending}
            size="sm"
            label="Show demo data"
            description={
              showSeed
                ? "Showing demo + your data"
                : "Showing only your data"
            }
          />
        </div>
        {showTour && <DemoTourTooltip onDismiss={dismissTour} />}
      </div>
      {isPending && <DemoDataOverlay showSeed={showSeed} />}
    </>
  );
}

function DemoTourTooltip({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="dialog"
      aria-labelledby="demo-tour-title"
      className="absolute right-0 top-full z-101 mt-3 w-80 rounded-2xl border border-[#ecebff] bg-white p-4 shadow-2xl animate-[fadeIn_250ms_ease-out]"
    >
      <span
        aria-hidden
        className="absolute -top-2 right-10 h-4 w-4 rotate-45 border-l border-t border-[#ecebff] bg-white"
      />
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 text-white">
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
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p
            id="demo-tour-title"
            className="text-sm font-semibold text-[#1a174f]"
          >
            Try it with demo data
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Toggle this on or off anytime to explore the app with sample
            vendors and bills, or just your own data.
          </p>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-3 inline-flex items-center rounded-lg bg-[#312D97] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#251f7e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312D97] focus-visible:ring-offset-2"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function DemoDataOverlay({ showSeed }: { showSeed: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-100 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 rounded-2xl bg-white/25 animate-ping" />
          <span className="absolute inset-0 rounded-2xl bg-linear-to-br from-brand-500 to-brand-700 shadow-[0_8px_32px_rgba(76,68,204,0.6)]" />
          <svg
            className="relative h-10 w-10 text-white animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-semibold text-white">
            {showSeed ? "Loading demo data…" : "Hiding demo data…"}
          </p>
          <p className="text-xs text-white/70">Refreshing your workspace</p>
        </div>
      </div>
    </div>
  );
}
