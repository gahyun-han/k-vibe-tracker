export function CardSkeleton() {
  return (
    <div className="bg-[#1E1E30] rounded-2xl p-4 border border-[#2E2E4A] space-y-3">
      <div className="h-4 w-1/3 skeleton rounded-lg" />
      <div className="h-4 w-full skeleton rounded-lg" />
      <div className="h-4 w-2/3 skeleton rounded-lg" />
    </div>
  );
}

export function MapCardSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#1E1E30] rounded-2xl p-4 border border-[#2E2E4A] flex gap-3">
          <div className="w-10 h-10 rounded-xl skeleton shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/2 skeleton rounded" />
            <div className="h-3 w-full skeleton rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PinPulse({ style }: { style?: React.CSSProperties }) {
  return (
    <span
      style={style}
      className="absolute w-4 h-4 rounded-full bg-[#FF3A5C] animate-ping opacity-75"
    />
  );
}
