import type { Plugin } from "@opencode-ai/plugin"
import notifier from "node-notifier"
import { exec } from "child_process"

export const NotificationPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  return {
    event: async ({ event }) => {
      // Send notification when session becomes idle (completed)
      if (event.type === "session.idle") {
        const title = "OpenCode"
        const message = "Session completed! Click to open in VS Code"

        // Send cross-platform notification with click handler
        notifier.notify(
          {
            title,
            message,
            wait: true, // Wait for user interaction
            sound: true, // Play notification sound
          },
          () => {} // Silent error handling
        )

        // Listen for click events (alternative way to handle interactions)
        notifier.on("click", () => {
          exec(`code --reuse-window "${directory}"`, () => {})
        })

        notifier.on("timeout", () => {
          // Notification closed without interaction - silent
        })
      }
    },
  }
}
