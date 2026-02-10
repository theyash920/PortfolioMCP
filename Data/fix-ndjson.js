const fs = require('fs');
const path = require('path');

const dataDir = __dirname;
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ndjson'));

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const trimmedContent = content.trim();

    // Skip empty files
    if (!trimmedContent) {
        console.log(`Skipping ${file} (empty).`);
        return;
    }

    try {
        // Try parsing as standard JSON
        const json = JSON.parse(content);
        
        console.log(`Processing ${file}...`);
        
        if (Array.isArray(json)) {
            // It's an array (like skills.ndjson), convert to NDJSON
            const ndjson = json.map(item => JSON.stringify(item)).join('\n');
            fs.writeFileSync(filePath, ndjson);
            console.log(`  Converted array to NDJSON.`);
        } else if (typeof json === 'object' && json !== null) {
            // It's a single object (like profile.ndjson), minify to single line
            fs.writeFileSync(filePath, JSON.stringify(json));
            console.log(`  Minified single object to NDJSON.`);
        }
    } catch (e) {
        // If it fails to parse as JSON, it might already be NDJSON or invalid
        // Let's check if it looks like NDJSON (multiple lines, each is valid JSON)
        const lines = trimmedContent.split('\n');
        let isValidNdjson = true;
        try {
            lines.forEach(line => {
                if (line.trim()) JSON.parse(line);
            });
        } catch (err) {
            isValidNdjson = false;
        }

        if (isValidNdjson) {
            console.log(`Skipping ${file} (already valid NDJSON).`);
        } else {
            console.error(`ERROR: ${file} is neither valid JSON nor NDJSON. Error: ${e.message}`);
        }
    }
});
