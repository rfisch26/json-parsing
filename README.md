# Incident Triage CLI

A TypeScript CLI for managing security incidents.

## Setup

```bash
npm install
npx ts-node index.ts
```

## Usage

**Task 1 - View open incidents:**
```bash
npx ts-node index.ts
```

**Task 2 - Filter by tag:**
```bash
npx ts-node index.ts --tag payments
```

**Task 3 - Summary report:**
Printed with every run.

**Task 4 - Reassign incidents:**
```bash
npx ts-node index.ts --assignee jordan
```

## Example

```bash
$ npx ts-node index.ts
Open incidents (sorted by priority):
[
  {
    "id": "INC-001",
    "status": "open",
    "priority": 1,
    "assignee": "rachel",
    "tags": ["payments", "auth"]
  },
  {
    "id": "INC-004",
    "status": "open",
    "priority": 1,
    "assignee": null,
    "tags": []
  }
]

--- Summary Report ---
Total incidents: 5
Open incidents: 3
Unassigned incidents: 2
Most active assignee: rachel
```

## Data Format

incidents.json should have:
```json
{
  "incidents": [
    {
      "id": "INC-001",
      "status": "open",
      "priority": 1,
      "assignee": "rachel",
      "tags": ["payments"]
    }
  ]
}
```