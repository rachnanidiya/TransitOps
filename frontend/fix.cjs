const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src/pages');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  // Fix template literals: `?{ -> `${
  c = c.replace(/\?\{/g, '${');
  // Fix missing template dollar signs outside backticks: ?{ -> ${
  c = c.replace(/`\?/g, '`₹');
  c = c.replace(/>\?/g, '>₹');
  c = c.replace(/\(\?\)/g, '(₹)');
  c = c.replace(/\xEF\xBF\xBD/g, '·'); // Replacement character
  fs.writeFileSync(f, c, 'utf8');
});
