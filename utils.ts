export interface Incident {
  id: string;
  status: "open" | "resolved" | "in-progress";
  priority: 1 | 2 | 3;
  assignee: string | null;
  tags: string[];
  title: string;
  createdAt: string;
}

export interface SummaryReport {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  unassigned: number;
  topAssignee: string | null;
  priorityBreakdown: Record<number, number>;
}

/** Filter incidents to only open ones, sorted by priority ascending */
export function getOpenIncidents(incidents: Incident[]): Incident[] {
  return incidents
    .filter((inc) => inc.status === "open")
    .sort((a, b) => a.priority - b.priority);
}

/** Filter incidents by a specific tag (case-insensitive) */
export function filterByTag(incidents: Incident[], tag: string): Incident[] {
  const lower = tag.toLowerCase();
  return incidents.filter((inc) =>
    inc.tags.map((t) => t.toLowerCase()).includes(lower)
  );
}

/** Reassign all unassigned incidents to a given assignee (mutates in place) */
export function reassignUnassigned(
  incidents: Incident[],
  assignee: string
): Incident[] {
  const updated: Incident[] = [];
  for (const inc of incidents) {
    if (inc.assignee === null) {
      inc.assignee = assignee;
      updated.push(inc);
    }
  }
  return updated;
}

/** Build a summary report from the full incident list */
export function buildSummary(incidents: Incident[]): SummaryReport {
  const assigneeCounts: Record<string, number> = {};
  const priorityBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0 };

  for (const inc of incidents) {
    if (inc.assignee) {
      assigneeCounts[inc.assignee] = (assigneeCounts[inc.assignee] || 0) + 1;
    }
    priorityBreakdown[inc.priority] = (priorityBreakdown[inc.priority] || 0) + 1;
  }

  const topEntry = Object.entries(assigneeCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    total: incidents.length,
    open: incidents.filter((i) => i.status === "open").length,
    inProgress: incidents.filter((i) => i.status === "in-progress").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
    unassigned: incidents.filter((i) => i.assignee === null).length,
    topAssignee: topEntry ? topEntry[0] : null,
    priorityBreakdown,
  };
}

/** Print a formatted summary report to stdout */
export function printSummary(report: SummaryReport): void {
  console.log("\n╔══════════════════════════════╗");
  console.log("║       Summary Report         ║");
  console.log("╠══════════════════════════════╣");
  console.log(`║  Total incidents:    ${String(report.total).padEnd(8)}║`);
  console.log(`║  Open:               ${String(report.open).padEnd(8)}║`);
  console.log(`║  In Progress:        ${String(report.inProgress).padEnd(8)}║`);
  console.log(`║  Resolved:           ${String(report.resolved).padEnd(8)}║`);
  console.log(`║  Unassigned:         ${String(report.unassigned).padEnd(8)}║`);
  console.log(`║  Top assignee:       ${String(report.topAssignee ?? "N/A").padEnd(8)}║`);
  console.log("╠══════════════════════════════╣");
  console.log("║  Priority breakdown:         ║");
  console.log(`║    P1 (critical):  ${String(report.priorityBreakdown[1] ?? 0).padEnd(9)}║`);
  console.log(`║    P2 (high):      ${String(report.priorityBreakdown[2] ?? 0).padEnd(9)}║`);
  console.log(`║    P3 (low):       ${String(report.priorityBreakdown[3] ?? 0).padEnd(9)}║`);
  console.log("╚══════════════════════════════╝\n");
}