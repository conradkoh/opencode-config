# System Prompt Writing Guidelines

## Philosophy

System prompts should be crafted with nuance and flexibility rather than strict rules. The goal is to create agents that generalize well across scenarios while maintaining consistent behavioral traits.

## Identity

The foundation of any system prompt is establishing who the agent fundamentally is. Identity shapes behavior more effectively than rigid rules. Key dimensions to consider:

* **Curiosity**: How naturally inquisitive is the agent? Does it question assumptions and explore edge cases?
* **Detail Orientation**: Where does the agent fall on the spectrum from meticulous to broad-strokes thinking?
* **Communication Style**: Preferred verbosity, directness, and clarity in interactions
* **Theoretical vs Pragmatic**: Balance between abstract reasoning and practical implementation
* **Visionary vs Present-Focused**: Long-term strategic thinking versus immediate problem-solving
* **Proactive vs Reactive**: Initiative in suggesting improvements versus waiting for explicit direction

These traits are not binary choices but exist on spectrums. The art of prompt engineering lies in finding the right combination that produces natural, helpful behavior across diverse scenarios.

## Understanding User Goals (Two Time Horizons)

A good system prompt should encourage the agent to understand the user’s intent at two levels:

1. **Immediate goal (definition of done)**

   * Inferred from the latest user message.
   * Typically contains ~80% of what the expected outcome is.
   * Always the #1 priority: it sets the definition of done — no more, no less.

2. **Broader goal (contextual intent)**
   * Inferred from the full conversation history.
   * More nuanced, and often explains constraints, tone preferences, and what “good” looks like.
   * Useful guiding questions:
     * “Why is the user giving me this instruction?”
     * “Of all times, why now?”
     * “Of all topics, why this topic?”

Try to satisfy the immediate goal precisely, while using the broader goal to make better trade-offs, ask better clarifying questions, and avoid misalignment.

## Definition Of Done (Concrete Deliverables)

A good system prompt encourages the agent to translate abstract principles into concrete, verifiable deliverables.

* **Set clear goals**: Define outcomes the agent can actually achieve within the current context.
* **Prefer value-bearing increments**: Aim for deliverables that the user can evaluate after meaningful progress, not after every micro-decision.
* **Manage complexity explicitly**: Task complexity rises with:
  * the number of variable factors, and
  * the number of decisions required to produce the outcome.
    As decision count increases, the chance of getting something “wrong” (or merely preference-mismatched) rises.
* **Sequence decisions sensibly**: Encourage the agent to decide what it wants to do first, then execute, then ask for validation at natural checkpoints—so the user can confirm direction without discarding lots of work.
* **Avoid question-paralysis**: Clarifying questions are useful, but over-asking is annoying; the right balance depends on the task.

In general, prompts should steer the agent toward concrete deliverables that bring value to the user.

## Preventing Scope Creep And Unwanted State Changes

A good system prompt should encourage the agent to be scope-disciplined and thoughtful about changes that persist.

* **Stick to the facts**: Prefer grounded, checkable claims (file paths, function names, class names, command outputs) over speculation.
* **Treat stateful actions as costly**: File writes, git commits, and external service calls create persistence and cleanup work.
* **Prefer “think/say” over “write” when unsure**: If content is exploratory, keep it in reasoning/output first; write to disk only when it’s clearly useful and stable.
* **Be explicit about git history**: Encourage the agent to understand what it is committing to history and to avoid unnecessary churn.
* **Organize files as maps, not encyclopedias**: Files should point to other sources of truth rather than duplicate every detail; avoid generating lots of verbose documents.
* **Optimize for how users consume outputs**: Use concise structure (bullets, occasional tables), consistent formatting, and provide helpful links to relevant files/URLs when appropriate.
* **Avoid common annoyances**: Don’t be sloppy—avoid deeply nested lists, inconsistent formatting, and unstructured walls of text, especially when the result is persistent.

## Principles

1. **Behavior over Rules**: Define desired behaviors through identity rather than enumerating every possible scenario
2. **Nuanced Trade-offs**: Acknowledge that traits exist in tension with each other and require careful balancing
3. **Contextual Adaptation**: The same identity can express differently depending on the situation
4. **Scalable Patterns**: Focus on patterns that generalize rather than case-by-case instructions

***

<!-- Ignore section if arguments are not replaced -->

<userinput>
$ARGUMENTS
</userinput>
