const fs = require('fs');
const path = require('path');

const skillsFile = path.join(__dirname, 'skills.ndjson');
const content = fs.readFileSync(skillsFile, 'utf8');

// Parse existing skills to check for duplicates
const existingSkills = content.trim().split('\n').map(line => {
    try { return JSON.parse(line); } catch (e) { return null; }
}).filter(s => s && s._id);

const existingIds = new Set(existingSkills.map(s => s._id));

const newSkills = [
    { "_type": "skill", "_id": "skill-ai", "name": "Artificial Intelligence", "category": "ai-ml", "proficiency": "advanced", "percentage": 85 },
    { "_type": "skill", "_id": "skill-algorithms", "name": "Algorithms", "category": "soft-skills", "proficiency": "advanced", "percentage": 80 },
    { "_type": "skill", "_id": "skill-backend-development", "name": "Backend Development", "category": "backend", "proficiency": "advanced", "percentage": 85 },
    { "_type": "skill", "_id": "skill-authentication", "name": "Authentication", "category": "backend", "proficiency": "intermediate", "percentage": 75 },
    { "_type": "skill", "_id": "skill-javascript", "name": "JavaScript", "category": "frontend", "proficiency": "advanced", "percentage": 90, "color": "#F7DF1E" },
    { "_type": "skill", "_id": "skill-aws", "name": "AWS", "category": "cloud", "proficiency": "intermediate", "percentage": 70, "color": "#FF9900" },
    { "_type": "skill", "_id": "skill-programming", "name": "Programming Fundamentals", "category": "backend", "proficiency": "advanced", "percentage": 90 },
    { "_type": "skill", "_id": "skill-web-development", "name": "Web Development", "category": "frontend", "proficiency": "advanced", "percentage": 85 },
    { "_type": "skill", "_id": "skill-software-engineering", "name": "Software Engineering", "category": "backend", "proficiency": "advanced", "percentage": 85 },
    { "_type": "skill", "_id": "skill-modern-web", "name": "Modern Web Technologies", "category": "frontend", "proficiency": "advanced", "percentage": 85 },
    { "_type": "skill", "_id": "skill-critical-thinking", "name": "Critical Thinking", "category": "soft-skills", "proficiency": "advanced", "percentage": 90 },
    { "_type": "skill", "_id": "skill-tensorflow", "name": "TensorFlow", "category": "ai-ml", "proficiency": "intermediate", "percentage": 75, "color": "#FF6F00" },
    { "_type": "skill", "_id": "skill-graphql", "name": "GraphQL", "category": "backend", "proficiency": "intermediate", "percentage": 70, "color": "#E10098" }
];

const skillsToAdd = newSkills.filter(s => !existingIds.has(s._id));

if (skillsToAdd.length > 0) {
    const appendContent = skillsToAdd.map(s => JSON.stringify(s)).join('\n');
    // Ensure we start on a new line
    const finalContent = content.endsWith('\n') ? content + appendContent : content + '\n' + appendContent;

    fs.writeFileSync(skillsFile, finalContent);
    console.log(`Added ${skillsToAdd.length} missing skills to skills.ndjson`);
    skillsToAdd.forEach(s => console.log(` - ${s._id}`));
} else {
    console.log('No missing skills found (all already exist).');
}
