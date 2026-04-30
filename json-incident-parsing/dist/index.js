import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('incidents.json', 'utf-8'));
const incidents = data.incidents;
incidents.sort((a, b) => a.priority - b.priority);
console.log(JSON.stringify({ incidents }, null, 2));
