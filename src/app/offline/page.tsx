export const metadata = {
  title: "Offline – Moneee"
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-2xl font-semibold">You are offline</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This budget lives on your device. Make changes once you reconnect or keep planning with the cached data.
      </p>
    </div>
  )
}
