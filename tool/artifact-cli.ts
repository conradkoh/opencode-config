import { tool } from "@opencode-ai/plugin"

/**
 * artifact-cli OpenCode integration
 * 
 * This file provides 3 tools for OpenCode to create and manage
 * React component previews using artifact-cli.
 * 
 * Available tools:
 *   - artifact-cli_create: Create a preview from React component code
 *   - artifact-cli_update: Update an existing preview with new code
 *   - artifact-cli_open: Open preview in browser
 * 
 * The CLI manages file storage, servers, and cleanup internally.
 * Pass component code directly - no file paths needed.
 */

export const create = tool({
  description: `Create an artifact preview from React component code.

Pass the component code directly as a string. The CLI handles file storage internally.

How it works:
1. Writes your code to an internal temp directory
2. Parses the component and detects npm dependencies automatically
3. Creates a Sandpack environment with hot reload support
4. Starts a local server and returns the preview URL

Returns:
- Artifact ID: Use for update/open commands
- Preview URL: The browser URL for the preview
- Stop instructions: How to clean up servers when done

Note: Opening the preview is optional - do so based on context.`,
  args: {
    code: tool.schema.string().describe("The React component code (TSX/JSX as a string)"),
    name: tool.schema.string().optional().describe("Optional component name (auto-detected if omitted)"),
  },
  async execute(args) {
    try {
      // Use Buffer for proper UTF-8 support (btoa fails on non-ASCII characters)
      const encoded = Buffer.from(args.code).toString('base64')
      const nameArg = args.name ? ` --name ${args.name}` : ''
      const result = await Bun.$`artifact create --code ${encoded}${nameArg}`.text()
      return result.trim()
    } catch (error) {
      return `Error creating artifact: ${error}`
    }
  },
})

export const update = tool({
  description: `Update an existing artifact with new component code.

Pass the updated code directly. The CLI handles:
- Writing the new code to the artifact's temp directory
- Regenerating the Sandpack environment
- Hot reloading (or restarting the server if it was stopped)

The tool returns when the preview is ready to view.`,
  args: {
    id: tool.schema.string().describe("Artifact ID to update (e.g., a1b2c3)"),
    code: tool.schema.string().describe("The updated React component code"),
  },
  async execute(args) {
    try {
      // Use Buffer for proper UTF-8 support (btoa fails on non-ASCII characters)
      const encoded = Buffer.from(args.code).toString('base64')
      const result = await Bun.$`artifact update ${args.id} --code ${encoded}`.text()
      return result.trim()
    } catch (error) {
      return `Error updating artifact: ${error}`
    }
  },
})

export const open = tool({
  description: `Open an artifact preview in the browser.

Handles all cases:
- If artifact exists and server is running: opens browser immediately
- If artifact exists but server stopped: starts server, then opens browser
- If artifact not found: returns helpful error message

Use this to revisit previous artifacts or open a newly created one.`,
  args: {
    id: tool.schema.string().describe("Artifact ID to open (e.g., a1b2c3)"),
  },
  async execute(args) {
    try {
      const result = await Bun.$`artifact open ${args.id}`.text()
      return result.trim()
    } catch (error) {
      return `Error opening artifact: ${error}`
    }
  },
})
