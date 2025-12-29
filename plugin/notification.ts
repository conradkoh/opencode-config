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
          (err, response) => {
            if (err) {
              console.error("Notification error:", err)
              return
            }

            // If user clicked the notification, open VS Code
            if (response === "activate") {
              exec(`code --reuse-window "${directory}"`, (error) => {
                if (error) {
                  console.error("Failed to open VS Code:", error)
                }
              })
            }
          }
        )

        // Listen for click events (alternative way to handle interactions)
        notifier.on("click", (notifierObject, options) => {
          exec(`code --reuse-window "${directory}"`, (error) => {
            if (error) {
              console.error("Failed to open VS Code:", error)
            }
          })
        })

        notifier.on("timeout", (notifierObject, options) => {
          // Notification closed without interaction
          console.log("Notification closed without interaction")
        })
      }

      // Optional: Send notification when a file is edited
      if (event.type === "file.edited") {
        const title = "OpenCode"
        const message = "File edited"

        notifier.notify({
          title,
          message,
          sound: true,
        })
      }
    },
  }
}
