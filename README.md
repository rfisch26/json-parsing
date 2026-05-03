# Incident Triage CLI

A TypeScript command-line tool for querying, filtering, and managing a security incident backlog — built for speed during on-call triage.

## Features

- **View open incidents** sorted by priority (P1 → P3)
- **Filter by tag** to scope incidents to a domain (e.g. `payments`, `auth`)
- **Auto-generated summary report** with priority breakdown and assignee stats
- **Reassign unassigned incidents** to an on-call engineer, persisted to disk
- Strict TypeScript types with a clean separation between CLI logic and utility helpers

## Tech Stack

| Tool | Purpose |
|------|---------|
| TypeScript 5 | End-to-end type safety |
| ts-node | Zero-build local development |
| Node.js `fs` | Reads/writes `incidents.json` |

## Getting Started

```bash
npm install
```

### Run (development)

```bash
npx ts-node index.ts
```

### Build & run (production)

```bash
npm run build
npm start
```

## Usage

```
USAGE:
  npx ts-node index.ts [options]

OPTIONS:
  --tag <tag>           Filter all incidents by tag (case-insensitive)
  --assignee <name>     Reassign all unassigned incidents to <name> and save
  --help                Show this help message
```

### Examples

**View all open incidents + summary:**
```bash
npx ts-node index.ts
```

```
Open incidents (5) — sorted by priority:

  [P1] INC-001  •  Payment gateway returning 502 errors  •  @alice  •  tags: payments, gateway
  [P1] INC-002  •  Auth tokens expiring prematurely       •  @unassigned  •  tags: auth, security
  [P1] INC-005  •  Webhook retries flooding internal queue •  @alice  •  tags: webhooks, queue
  [P2] INC-004  •  CSV export silently truncating rows    •  @unassigned  •  tags: exports, data
  [P2] INC-006  •  Incorrect VAT calculation on EU invoices •  @unassigned  •  tags: payments, billing

╔══════════════════════════════╗
║       Summary Report         ║
╠══════════════════════════════╣
║  Total incidents:    8       ║
║  Open:               5       ║
║  In Progress:        2       ║
║  Resolved:           1       ║
║  Unassigned:         3       ║
║  Top assignee:       alice   ║
╠══════════════════════════════╣
║  Priority breakdown:         ║
║    P1 (critical):  3         ║
║    P2 (high):      4         ║
║    P3 (low):       1         ║
╚══════════════════════════════╝
```

**Filter by tag:**
```bash
npx ts-node index.ts --tag payments
```

**Reassign all unassigned incidents:**
```bash
npx ts-node index.ts --assignee jordan
```
Updates `incidents.json` on disk so the assignments persist.

## Project Structure

```
.
├── index.ts          # CLI entry point — argument parsing and output
├── utils.ts          # Pure functions: filtering, sorting, summary, reassignment
├── incidents.json    # Incident data store
├── tsconfig.json     # TypeScript compiler config
└── package.json
```

## Data Format

`incidents.json` expects the following shape:

```json
{
  "incidents": [
    {
      "id": "INC-001",
      "title": "Payment gateway returning 502 errors",
      "status": "open",
      "priority": 1,
      "assignee": "alice",
      "tags": ["payments", "gateway"],
      "createdAt": "2025-04-28T09:14:00Z"
    }
  ]
}
```

| Field | Type | Values |
|-------|------|--------|
| `id` | `string` | Unique incident identifier |
| `title` | `string` | Short description |
| `status` | `string` | `"open"` \| `"in-progress"` \| `"resolved"` |
| `priority` | `number` | `1` (critical) · `2` (high) · `3` (low) |
| `assignee` | `string \| null` | Username or `null` if unassigned |
| `tags` | `string[]` | Domain labels for filtering |
| `createdAt` | `string` | ISO 8601 timestamp |

## Design Decisions

- **`utils.ts` is side-effect free** — all functions are pure and independently testable.
- **`index.ts` owns I/O** — file reads, writes, and console output are isolated to the entry point.
- **Persistence on reassign** — `--assignee` writes back to `incidents.json` so changes survive across runs.
- **`tsconfig` uses `CommonJS`** — required for `ts-node` compatibility without additional ESM flags.