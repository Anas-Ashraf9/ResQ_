// Real-time polling service for live updates across all panels

export class RealtimeService {
  private static instance: RealtimeService
  private listeners: Map<string, Set<() => void>> = new Map()
  private pollingInterval: NodeJS.Timeout | null = null
  private isPolling = false

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService()
    }
    return RealtimeService.instance
  }

  // Subscribe to order updates
  subscribe(channel: string, callback: () => void): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set())
    }
    this.listeners.get(channel)!.add(callback)

    // Start polling if not already started
    if (!this.isPolling) {
      this.startPolling()
    }

    // Return unsubscribe function
    return () => {
      const channelListeners = this.listeners.get(channel)
      if (channelListeners) {
        channelListeners.delete(callback)
        if (channelListeners.size === 0) {
          this.listeners.delete(channel)
        }
      }
      // Stop polling if no listeners
      if (this.listeners.size === 0) {
        this.stopPolling()
      }
    }
  }

  // Notify all listeners of a channel
  notify(channel: string): void {
    const channelListeners = this.listeners.get(channel)
    if (channelListeners) {
      channelListeners.forEach((callback) => callback())
    }
  }

  // Notify all channels
  notifyAll(): void {
    this.listeners.forEach((listeners) => {
      listeners.forEach((callback) => callback())
    })
  }

  private startPolling(): void {
    if (this.pollingInterval) return
    this.isPolling = true

    // Poll every 2 seconds for real-time updates
    this.pollingInterval = setInterval(() => {
      this.notifyAll()
    }, 2000)
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
      this.isPolling = false
    }
  }

  // Trigger immediate update
  triggerUpdate(channel?: string): void {
    if (channel) {
      this.notify(channel)
    } else {
      this.notifyAll()
    }
  }
}

// Helper hook for React components
export function useRealtimeUpdates(channel: string, callback: () => void): void {
  if (typeof window === "undefined") return

  const service = RealtimeService.getInstance()
  const unsubscribe = service.subscribe(channel, callback)

  // Cleanup on unmount
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", unsubscribe)
  }
}

// Trigger update from anywhere
export function triggerRealtimeUpdate(channel?: string): void {
  if (typeof window === "undefined") return
  const service = RealtimeService.getInstance()
  service.triggerUpdate(channel)
}
