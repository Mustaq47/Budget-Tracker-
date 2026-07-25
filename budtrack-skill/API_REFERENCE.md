# BudTrack API Reference

This document describes the internal state and core functions of the BudTrack application (`budtrack_logic.js`).

## State Object (`state`)

The `state` variable is the single source of truth for the application.

### `state.userName` (String)
The name of the user provided during onboarding.

### `state.entries` (Array<Object>)
A list of all transactions. Each object contains:
- `id`: Unique timestamp.
- `amount`: Numeric value of the expense.
- `tag`: Category (e.g., 'Food', 'Transport', 'Bills').
- `note`: User-provided description.
- `time`: Time of entry (HH:MM).
- `date`: ISO date string (YYYY-MM-DD).
- `budgetKey`: The budget category this entry belongs to (default: 'Personal').

### `state.budget` (Number)
The total monthly budget for the active `budgetKey`.

### `state.recurring` (Array<Object>)
List of recurring expenses (subscriptions).
- `name`: Subscription name.
- `amount`: Monthly cost.
- `day`: Day of the month it triggers.
- `active`: Boolean status.

### `state.settings` (Object)
User preferences including `currency`, `theme`, and notification toggles.

## Core Categories (`TAG_COLORS`)
Valid categories include:
- `Food`
- `Transport`
- `Coffee`
- `Shopping`
- `Bills`
- `Health`
- `Entertainment`
- `Other`

## Data Storage
BudTrack uses `Capacitor Preferences` for native storage, with a fallback to `localStorage` under the key `budtrack_v6_state`.
