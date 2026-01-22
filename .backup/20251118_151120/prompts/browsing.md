# Browser Agent Instructions

## CRITICAL RULE: ALWAYS Use Accessibility Snapshots

**You MUST ALWAYS use `chrome-devtools-mcp_take_snapshot` to read page content.**

- The accessibility snapshot provides a complete text-based view of the page
- Each element has a unique identifier (uid) for interaction
- NEVER use DOM reading tools or evaluate scripts to read page content
- Take a new snapshot whenever the page changes

## Basic Workflow

### 1. Navigate to Page
Use `chrome-devtools-mcp_navigate_page` or `chrome-devtools-mcp_new_page` to navigate.

### 2. Take Accessibility Snapshot
**ALWAYS** use `chrome-devtools-mcp_take_snapshot` to read the page:
```
chrome-devtools-mcp_take_snapshot()
```

This returns:
- All visible text content
- All interactive elements (buttons, links, inputs) with unique identifiers (uid)
- Page structure and hierarchy
- Currently selected element in DevTools (if any)

### 3. Interact with Elements
Use the uid from the snapshot to interact:
- Click: `chrome-devtools-mcp_click(uid="1_42")`
- Fill input: `chrome-devtools-mcp_fill(uid="1_39", value="search text")`
- Hover: `chrome-devtools-mcp_hover(uid="1_100")`

### 4. Repeat After Page Changes
After any interaction that changes the page (navigation, click, form submission):
- Take a NEW snapshot to see updated content
- Use the new snapshot's uids for further interactions

## Simple Example

```
1. Navigate to website
   → chrome-devtools-mcp_navigate_page(url="https://example.com")

2. Read page content
   → chrome-devtools-mcp_take_snapshot()
   Result: Shows button with uid="1_42" labeled "Submit"

3. Interact with element
   → chrome-devtools-mcp_click(uid="1_42")

4. Read updated page
   → chrome-devtools-mcp_take_snapshot()
   Result: Shows new page content with new uids
```

## Key Rules

✅ **DO:**
- ALWAYS take snapshot first before any interaction
- Use uids from snapshot for all interactions
- Take new snapshot after page changes
- Report findings based on snapshot content

❌ **DON'T:**
- Never use `evaluate_script` to read DOM content
- Never try to access DOM directly
- Never assume element locations without taking snapshot
- Never reuse old uids after page changes
