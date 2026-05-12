export function LogoOverlay() {
  return (
    <div className="animate-fade-in fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 aspect-square w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#312D97]/15 to-[#10A6CC]/15 blur-3xl" />
      </div>

      <div className="flex flex-col items-center gap-5">
        <div className="animate-breathe flex h-16 w-16 items-center justify-center rounded-2xl bg-[#312D97] shadow-2xl shadow-[#312D97]/40">
          <svg
            className="h-9 w-9 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#1a174f]">
          Payabill
        </span>
      </div>
    </div>
  );
}
