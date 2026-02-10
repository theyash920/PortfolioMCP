const fs = require('fs');
const path = require('path');

const dataDir = __dirname;
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ndjson'));

const ids = new Set();
const references = [];

function findRefs(obj, docId, file) {
    if (!obj || typeof obj !== 'object') return;

    if (obj._ref) {
        references.push({ ref: obj._ref, docId: docId || 'unknown', file });
    }

    // Sanity ignores keys starting with _ except _ref, _type, _id, _weak
    // But we traverse everything just in case
    for (const key in obj) {
        findRefs(obj[key], docId, file);
    }
}

// 1. Collect all IDs and References
console.log('Scanning files...');
files.forEach(file => {
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.trim()) return;

    content.split('\n').forEach((line, idx) => {
        try {
            if (!line.trim()) return;
            const doc = JSON.parse(line);
            if (doc._id) {
                ids.add(doc._id);
            }
            findRefs(doc, doc._id, file);
        } catch (e) {
            console.error(`[ERROR] Parsing ${file} line ${idx + 1}: ${e.message}`);
        }
    });
});

// 2. Validate References
console.log(`Found ${ids.size} documents and ${references.length} references.`);
const missing = new Set();

references.forEach(({ ref, docId, file }) => {
    if (!ids.has(ref)) {
        // Ignore potential image references if we don't have image assets (usually image-*, but let's check basic pattern)
        if (ref.startsWith('image-')) return;

        console.error(`[MISSING] ${ref} (referenced in ${file} by ${docId})`);
        missing.add(ref);
    }
});

if (missing.size === 0) {
    console.log('✅ Integrity check passed: All references are valid.');
    process.exit(0);
} else {
    console.log(`❌ Found ${missing.size} missing references.`);
    // Output list of missing IDs for easy addition
    console.log('\nMissing IDs:');
    Array.from(missing).forEach(id => console.log(id));
    process.exit(1);
}
