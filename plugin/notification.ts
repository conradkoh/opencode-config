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
        const termProgram = process.env.TERM_PROGRAM || "vscode"

        // Determine editor based on TERM_PROGRAM
        // Note: Unfortunately, Cursor also returns "vscode" for TERM_PROGRAM
        // TODO: When Cursor provides a unique TERM_PROGRAM value, update mapping
        const editorMap: Record<string, { command: string; name: string }> = {
          vscode: { command: "code", name: "VS Code" },
          cursor: { command: "cursor", name: "Cursor" },
        }

        const editor = editorMap[termProgram] || editorMap.vscode
        const title = "OpenCode"
        const message = `${projectName} - Session completed! Click to open in ${editor.name}`

        // Send cross-platform notification with click handler
        // Note: Custom icons are not supported on macOS due to limitations
        // See: https://github.com/mikaelbr/node-notifier/issues/71
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
          exec(`${editor.command} --reuse-window "${directory}"`, () => {})
        })

        notifier.on("timeout", () => {
          // Notification closed without interaction - silent
        })
      }
    },
  }
}
