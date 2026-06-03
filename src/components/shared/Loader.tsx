export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-brand-900/40" />
        <div className="absolute inset-0 rounded-full border-2 border-t-brand-500 animate-spin" />
      </div>
      <p className="text-brand-700 text-sm animate-pulse-soft font-body">Loading menu…</p>
    </div>
  )
}
