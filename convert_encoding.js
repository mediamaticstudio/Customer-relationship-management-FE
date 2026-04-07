const fs = require('fs');
const files = [
  'src/Buckets/LeadData.jsx',
  'src/components/DynamicRequirementForm.jsx',
  'src/styles/DynamicForm.css'
];

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf16le');
    // Remove potential corrupted emojis and replace with correct one
    const fixedContent = content.replace(/âš[ ï¸]+/g, '⚠️');
    fs.writeFileSync(file, fixedContent, 'utf8');
    console.log(`Converted ${file} to UTF-8`);
  } catch (err) {
    console.error(`Error converting ${file}:`, err.message);
  }
});
