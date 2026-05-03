import { readFileSync, writeFileSync } from "fs";
import {
  Incident,
  getOpenIncidents,
  filterByTag,
  reassignUnassigned,
  buildSummary,
  printSummary,
} from "./utils";

// ── Help ──────────────────────────────────────────────────────────────────────

const HELP = `
Incident Triage CLI

USAGE:
  npx ts-node index.ts [options]

OPTIONS:
  --tag <tag>           Filter all incidents by tag (case-insensitive)
  --assignee <name>     Reassign all unassigned incidents to <name> and save
  --help                Show this help message

EXAMPLES:
  npx ts-node index.ts
  npx ts-node index.ts --tag payments
  npx ts-node index.ts --assignee jordan
`;

const args = process.argv.slice(2);

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

// ── Load data ─────────────────────────────────────────────────────────────────

let incidents: Incident[] = [];

try {
  const raw = readFileSync("incidents.json", "utf-8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data.incidents)) {
    console.error("Error: incidents.json must contain an { incidents: [] } array.");
    process.exit(1);
  }

  incidents = data.incidents as Incident[];
} catch (err) {
  console.error(
    "Error reading incidents.json:",
    err instanceof Error ? err.message : err
  );
  process.exit(1);
}

// ── Open Incidents Sorted by Priority ─────────────────────────────────

const open = getOpenIncidents(incidents);
console.log(`\nOpen incidents (${open.length}) — sorted by priority:\n`);

if (open.length === 0) {
  console.log("  No open incidents. 🎉");
} else {
  open.forEach((inc) => {
    const assignee = inc.assignee ?? "unassigned";
    const tags = inc.tags.length ? inc.tags.join(", ") : "—";
    console.log(
      `  [P${inc.priority}] ${inc.id}  •  ${inc.title}  •  @${assignee}  •  tags: ${tags}`
    );
  });
}

// ── Filter by --tag ───────────────────────────────────────────────────

const tagIndex = args.indexOf("--tag");
if (tagIndex !== -1) {
  const tag = args[tagIndex + 1];
  if (!tag || tag.startsWith("--")) {
    console.error('Error: --tag requires a value, e.g. --tag payments');
    process.exit(1);
  }

  const tagged = filterByTag(incidents, tag);
  console.log(`\nIncidents tagged "${tag}" (${tagged.length}):\n`);

  if (tagged.length === 0) {
    console.log("  No incidents found for that tag.");
  } else {
    tagged.forEach((inc) => {
      console.log(`  [${inc.status.toUpperCase()}] ${inc.id}  •  ${inc.title}`);
    });
  }
}

// ── Summary Report ────────────────────────────────────────────────────

const report = buildSummary(incidents);
printSummary(report);

// ── Reassign Unassigned Incidents ─────────────────────────────────────

const assigneeIndex = args.indexOf("--assignee");
if (assigneeIndex !== -1) {
  const newAssignee = args[assigneeIndex + 1];
  if (!newAssignee || newAssignee.startsWith("--")) {
    console.error('Error: --assignee requires a value, e.g. --assignee jordan');
    process.exit(1);
  }

  const updated = reassignUnassigned(incidents, newAssignee);

  if (updated.length === 0) {
    console.log("No unassigned incidents — nothing to reassign.");
  } else {
    console.log(`Reassigned ${updated.length} incident(s) to @${newAssignee}:`);
    updated.forEach((inc) => console.log(`  • ${inc.id}  —  ${inc.title}`));

    // Persist the updated assignments back to disk
    writeFileSync("incidents.json", JSON.stringify({ incidents }, null, 2));
    console.log("incidents.json updated.\n");
  }
}