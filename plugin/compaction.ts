import type { Plugin } from "@opencode-ai/plugin"

export const CustomCompactionPlugin: Plugin = async (ctx) => {
  return {
    "experimental.session.compacting": async (input, output) => {
      // Simplified compaction focused on important instructions
      output.prompt = `
Summarize this conversation, focusing on preserving important instructions and context needed to continue work.

Your summary must include:

1. **Important Instructions**: Any rules, guidelines, or specific instructions the user has given that should persist (e.g., coding style preferences, constraints, "always do X", "never do Y").

2. **Current Task**: What are you currently working on? Include:
   - The user's request
   - Files involved (with relevant code snippets if needed)
   - Current progress and what remains

3. **Key Decisions**: Important technical decisions made and why.

4. **Next Step**: The immediate next action to take (only if there's ongoing work).

Keep it concise but preserve all critical context. Prioritize instructions and constraints over history.

In the summary, remind the agent to study the current changes to remember the context, and then continue with accomplishing the user's goal.`.trim();
    },
  }
}