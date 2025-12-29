import type { Plugin } from "@opencode-ai/plugin"
import notifier from "node-notifier"
import { exec } from "child_process"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const NotificationPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  return {
    event: async ({ event }) => {
      // Send notification when session becomes idle (completed)
      if (event.type === "session.idle") {
        const projectName = path.basename(directory)
        const title = "OpenCode"
        const message = `${projectName} - Session completed! Click to open in VS Code`

        // Send cross-platform notification with click handler
        notifier.notify(
          {
            title,
            message,
            icon: path.join(__dirname, "../assets/icons/vscode.png"),
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
