const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'skills.ndjson');
try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    const cleanLines = lines.map(line => {
        try {
            return JSON.stringify(JSON.parse(line));
        } catch (e) {
            console.error('Error parsing line:', line);
            throw e;
        }
    });
    fs.writeFileSync(file, cleanLines.join('\n'));
    console.log('Fixed skills.ndjson with ' + cleanLines.length + ' lines.');
} catch (err) {
    console.error('Failed to fix skills.ndjson:', err);
    process.exit(1);
}
