import type { Plugin } from "@opencode-ai/plugin"

export const NotificationPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  return {
    event: async ({ event }) => {
      // Send notification when session becomes idle (completed)
      if (event.type === "session.idle") {
        const title = "OpenCode"
        const message = "Session completed!"

        // Detect platform and send notification accordingly
        if (process.platform === "darwin") {
          // macOS notification
          await $`osascript -e 'display notification "${message}" with title "${title}"'`
        } else if (process.platform === "linux") {
          // Linux notification
          await $`notify-send "${title}" "${message}"`
        } else if (process.platform === "win32") {
          // Windows notification (requires PowerShell)
          await $`powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('${message}', '${title}')"`
        }
      }

      // Optional: Send notification when a file is edited
      if (event.type === "file.edited") {
        const title = "OpenCode"
        const message = "File edited"

        if (process.platform === "darwin") {
          await $`osascript -e 'display notification "${message}" with title "${title}"'`
        } else if (process.platform === "linux") {
          await $`notify-send "${title}" "${message}"`
        }
      }
    },
  }
}
