import json
import sys
from datetime import datetime

def analyze_spending(state_json):
    try:
        state = json.loads(state_json)
    except Exception as e:
        return f"Error parsing JSON: {str(e)}"

    entries = state.get('entries', [])
    budget = state.get('budget', 0)
    currency = state.get('currency', '₹')

    total_spent = sum(item.get('amount', 0) for item in entries)
    
    # Category breakdown
    categories = {}
    for item in entries:
        tag = item.get('tag', 'Other')
        categories[tag] = categories.get(tag, 0) + item.get('amount', 0)

    # Sort categories by spend
    sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)
    
    # Calculate budget health
    remaining = budget - total_spent
    pct_used = (total_spent / budget * 100) if budget > 0 else 0

    # Format output
    summary = []
    summary.append(f"--- BudTrack Financial Summary ---")
    summary.append(f"User: {state.get('userName', 'Unknown')}")
    summary.append(f"Total Spent: {currency}{total_spent:,.2f}")
    summary.append(f"Monthly Budget: {currency}{budget:,.2f}")
    summary.append(f"Budget Used: {pct_used:.1f}%")
    summary.append(f"Remaining: {currency}{remaining:,.2f}")
    summary.append(f"\nTop Categories:")
    for cat, amt in sorted_cats[:3]:
        cat_pct = (amt / total_spent * 100) if total_spent > 0 else 0
        summary.append(f"- {cat}: {currency}{amt:,.2f} ({cat_pct:.1f}%)")

    if pct_used > 100:
        summary.append(f"\nSTATUS: 🚨 OVER BUDGET")
    elif pct_used > 80:
        summary.append(f"\nSTATUS: ⚠️ CRITICAL")
    else:
        summary.append(f"\nSTATUS: ✅ HEALTHY")

    return "\n".join(summary)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Read from file or argument
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            data = f.read()
    else:
        # Read from stdin
        data = sys.stdin.read()
    
    print(analyze_spending(data))
