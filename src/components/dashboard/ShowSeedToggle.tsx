"use client";

import { useState, useTransition } from "react";
import { Switch } from "~/components/ui/Switch";
import { setShowSeed } from "~/actions/preferences";

interface ShowSeedToggleProps {
  initialShowSeed: boolean;
}

export function ShowSeedToggle({ initialShowSeed }: ShowSeedToggleProps) {
  const [showSeed, setShowSeedState] = useState(initialShowSeed);
  const [isPending, startTransition] = useTransition();

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
      <div className="flex items-center gap-3 rounded-2xl border border-[#ecebff] bg-white px-4 py-2.5 shadow-sm">
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
      {isPending && <DemoDataOverlay showSeed={showSeed} />}
    </>
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
