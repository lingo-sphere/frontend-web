export default function GlobalLoading() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center space-y-4 py-16">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" />
        <div className="h-10 w-10 rounded-2xl border-3 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-xs font-medium text-text-tertiary animate-pulse">
        Đang tải dữ liệu LingoSphere...
      </p>
    </div>
  )
}
