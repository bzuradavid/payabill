"use client";

import { useState, useTransition } from "react";
import { Switch } from "~/components/ui/Switch";
import { setHideSeed } from "~/actions/preferences";

interface HideSeedToggleProps {
  initialHideSeed: boolean;
}

export function HideSeedToggle({ initialHideSeed }: HideSeedToggleProps) {
  const [hideSeed, setHideSeedState] = useState(initialHideSeed);
  const [isPending, startTransition] = useTransition();

  const handleChange = (next: boolean) => {
    setHideSeedState(next);
    startTransition(async () => {
      const result = await setHideSeed(next);
      if (!result.success) {
        // Revert on failure
        setHideSeedState(!next);
      }
    });
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#ecebff] bg-white px-4 py-2.5 shadow-sm">
      <Switch
        checked={hideSeed}
        onChange={handleChange}
        disabled={isPending}
        size="sm"
        label="Hide demo data"
        description={
          hideSeed
            ? "Showing only your data"
            : "Showing demo + your data"
        }
      />
    </div>
  );
}
