import { readFileSync } from 'fs';

interface Incident {
  id: string;
  status: string;
  priority: number;
  assignee: string | null;
  tags: string[];
}

// Load incidents from JSON
let incidents: Incident[] = [];
try {
  const data = JSON.parse(readFileSync('incidents.json', 'utf-8'));
  incidents = data.incidents || [];
  if (!Array.isArray(incidents)) {
    console.error('Error: incidents.json must contain an array');
    process.exit(1);
  }
} catch (error) {
  console.error('Error reading incidents.json:', error instanceof Error ? error.message : error);
  process.exit(1);
}

const args = process.argv.slice(2);

// Task 1: Display open incidents sorted by priority
console.log('Open incidents (sorted by priority):');
const openIncidents = incidents
  .filter(inc => inc.status === 'open')
  .sort((a, b) => a.priority - b.priority);
console.log(JSON.stringify(openIncidents, null, 2));

// Task 2: Filter by --tag flag
if (args[0] === '--tag') {
  if (!args[1]) {
    console.error('Error: --tag requires a value');
    process.exit(1);
  }
  const filtered = incidents.filter(inc => inc.tags.includes(args[1]));
  console.log(`\nIncidents with tag "${args[1]}":`);
  if (filtered.length === 0) {
    console.log('No incidents found.');
  } else {
    console.log(JSON.stringify(filtered, null, 2));
  }
}

// Task 3: Summary report
const totalIncidents = incidents.length;
const openCount = incidents.filter(inc => inc.status === 'open').length;
const unassignedCount = incidents.filter(inc => inc.assignee === null).length;

// Find most active assignee
const assigneeCounts: Record<string, number> = {};
incidents.forEach(inc => {
  if (inc.assignee) {
    assigneeCounts[inc.assignee] = (assigneeCounts[inc.assignee] || 0) + 1;
  }
});
const topAssignee = Object.entries(assigneeCounts).sort((a, b) => b[1] - a[1])[0];

console.log('\n--- Summary Report ---');
console.log(`Total incidents: ${totalIncidents}`);
console.log(`Open incidents: ${openCount}`);
console.log(`Unassigned incidents: ${unassignedCount}`);
console.log(`Most active assignee: ${topAssignee ? topAssignee[0] : 'N/A'}`);

// Task 4: Reassign unassigned incidents
if (args[0] === '--assignee') {
  if (!args[1]) {
    console.error('Error: --assignee requires a value');
    process.exit(1);
  }
  const unassigned = incidents.filter(inc => inc.assignee === null);
  if (unassigned.length === 0) {
    console.log('No unassigned incidents to reassign.');
  } else {
    unassigned.forEach(inc => inc.assignee = args[1]);
    console.log(`\nReassigned ${unassigned.length} incidents to ${args[1]}:`);
    console.log(JSON.stringify(incidents, null, 2));
  }
}
