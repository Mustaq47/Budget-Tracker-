import json
import csv
import sys
import io

def export_to_csv(state_json):
    try:
        state = json.loads(state_json)
    except Exception as e:
        return f"Error parsing JSON: {str(e)}"

    entries = state.get('entries', [])
    if not entries:
        return "No entries found to export."

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(['ID', 'Date', 'Time', 'Category', 'Note', 'Amount', 'Budget'])
    
    # Data
    for e in entries:
        writer.writerow([
            e.get('id', ''),
            e.get('date', ''),
            e.get('time', ''),
            e.get('tag', ''),
            e.get('note', ''),
            e.get('amount', 0),
            e.get('budgetKey', 'Personal')
        ])
    
    return output.getvalue()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            data = f.read()
    else:
        data = sys.stdin.read()
    
    print(export_to_csv(data))
