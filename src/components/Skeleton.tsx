export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-bg-secondary p-5">
      <div className="skeleton mb-3 h-5 w-2/3 rounded" />
      <div className="skeleton mb-2 h-4 w-full rounded" />
      <div className="skeleton h-4 w-4/5 rounded" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
