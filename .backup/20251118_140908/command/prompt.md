# Prompt Writing Guidelines

This document specifies the rules for creating prompts.

## Core Requirements

### 1. Clarity and Conciseness

Prompts MUST be clear and concise.

### 2. Requirement Specification Language

Prompts MUST use RFC 2119 keywords to indicate requirement levels:

- **MUST** / **REQUIRED** / **SHALL**: Absolute requirement
- **MUST NOT** / **SHALL NOT**: Absolute prohibition
- **SHOULD** / **RECOMMENDED**: Strong recommendation, exceptions MAY exist
- **SHOULD NOT** / **NOT RECOMMENDED**: Strong discouragement, exceptions MAY exist
- **MAY** / **OPTIONAL**: Truly optional behavior

**Example:**

```
The system MUST validate all input parameters.
The system SHOULD log operations for debugging.
The system MAY cache results for performance.
```

### 3. Process Flow Diagrams

Prompts MUST use Mermaid flowcharts to showcase steps that need to execute in sequence.

**Example:**

```mermaid
flowchart TD
    A[Receive request] --> B{Validate input}
    B -->|Invalid| C[Return error]
    B -->|Valid| D[Process request]
    D --> E[Save to database]
    E --> F[Return success]
```

## Mermaid Flowchart Syntax

### Basic Elements

```mermaid
flowchart TD
    A[Rectangle: Process step]
    B{Diamond: Decision point}
    C([Rounded: Start/End])
    D[(Database operation)]
```

### Connections

```mermaid
flowchart TD
    A[Step 1] --> B[Step 2]
    B -->|Condition| C[Step 3]
    B -->|Alternative| D[Step 4]
```

### Example: Multi-step Process

```mermaid
flowchart TD
    Start([Start]) --> Input[Receive input]
    Input --> Validate{Valid?}
    Validate -->|No| Error[Return error]
    Validate -->|Yes| Process[Process data]
    Process --> Save[(Save to database)]
    Save --> Success[Return success]
    Error --> End([End])
    Success --> End
```

---

<!-- Ignore section if arguments are not replaced -->
<userinput>
$ARGUMENTS
</userinput>
