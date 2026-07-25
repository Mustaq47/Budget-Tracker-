---
name: budtrack-assistant
description: Analyze spending, manage budgets, and understand BudTrack data structures. Use when the user asks about their finances, budget tracking, or spending habits in the BudTrack app.
---

# BudTrack Assistant

## Overview
This skill provides domain expertise for the BudTrack personal finance application. It allows you to interpret the application's state, provide financial insights, and perform utility tasks like data export.

## Quick Start
To assist the user, you first need to understand the current application state. Read the `state` object or a JSON dump of it.

```javascript
// Example: The state object structure
var state = {
  userName: 'John',
  entries: [...], // Array of transaction objects
  budget: 10000,
  // ...
};
```

## Core Instructions

1. **Transaction Analysis**: When asked about spending, look at `state.entries`. Each entry has an `amount`, `tag` (category), and `date`.
2. **Budget Health**: Compare `total_spent` (sum of `amount` in `entries`) against `state.budget`.
3. **Deterministic Logic**: Use bundled scripts in `budtrack-skill/scripts/` for complex calculations to ensure accuracy.

## Examples

### User: "How much did I spend on Food this month?"
1. Read `state.entries`.
2. Filter entries where `tag === 'Food'` and the date is within the current month.
3. Sum the amounts and report the total.

### User: "Am I over budget?"
1. Read `state.budget`.
2. Calculate total spent from `state.entries`.
3. Compare and provide a verdict.

For a full reference of the data structure, see [API_REFERENCE.md](API_REFERENCE.md).
