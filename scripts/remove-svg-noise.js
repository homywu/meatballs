const fs = require('fs');
const path = require('path');

// Read the SVG file
const svgPath = path.join(__dirname, '../public/icon.svg');
let svgContent = fs.readFileSync(svgPath, 'utf8');

// Function to remove duplicate consecutive coordinates in path data
function removeDuplicateCoords(pathData) {
  let result = pathData;
  let changed = true;
  let iterations = 0;
  
  // Keep iterating until no more changes
  while (changed && iterations < 20) {
    iterations++;
    const before = result;
    
    // Remove duplicate coordinate pairs: "x y x y" -> "x y"
    // This catches patterns like "C1 0 1 0 2 0" -> "C1 0 2 0"
    // More aggressive: match any duplicate coordinate pair
    result = result.replace(/(\s+(-?\d+)\s+(-?\d+)\s+\2\s+\3)(?=\s|$|Z|C|L|M)/g, ' $2 $3');
    
    // Also handle patterns like "C-54 72 -54 72" -> "C-54 72"
    result = result.replace(/([CLM])\s+(-?\d+)\s+(-?\d+)\s+\2\s+\3(?=\s|$|Z|C|L|M)/g, '$1 $2 $3');
    
    // Remove duplicate single numbers: "1 1" -> "1" (but be careful)
    result = result.replace(/([CLM])\s+(-?\d+)\s+\2\s+(-?\d+)(?=\s|$|Z|C|L|M)/g, '$1 $2 $3');
    
    // Remove "0 0" duplicates: "0 0 0 0" -> "0 0"
    result = result.replace(/\s+0\s+0\s+0\s+0(?=\s|$|Z|C|L|M)/g, ' 0 0');
    
    // Remove redundant "M0 0 C0 0" -> "M0 0 C"
    result = result.replace(/^M0\s+0\s+C0\s+0\s+/g, 'M0 0 C');
    result = result.replace(/^M0\s+0\s+0\s+0/g, 'M0 0');
    
    // Remove patterns like "C0 0 1 0 1 0" -> "C0 0 1 0"
    result = result.replace(/C\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)\s+\3\s+\4(?=\s|$|Z|C|L|M)/g, 'C $1 $2 $3 $4');
    
    // Remove consecutive duplicate commands: "C1 0 C1 6" -> "C1 0 1 6"
    // First, merge consecutive C commands where the second starts with the same coordinate
    result = result.replace(/C\s+(-?\d+)\s+(-?\d+)\s+C\s+\1\s+(-?\d+)/g, 'C $1 $2 $1 $3');
    
    // Also handle "C1 0 C1 0" -> "C1 0"
    result = result.replace(/C\s+(-?\d+)\s+(-?\d+)\s+C\s+\1\s+\2/g, 'C $1 $2');
    
    // Handle "C1 0 C1 6" -> "C1 0 1 6" (more general pattern)
    result = result.replace(/C\s+(-?\d+)\s+(-?\d+)\s+C\s+\1\s+(-?\d+)\s+(-?\d+)/g, 'C $1 $2 $1 $3 $4');
    
    // General case: merge any consecutive C commands
    result = result.replace(/C\s+([^C]+)\s+C\s+/g, 'C $1 ');
    
    // Clean up multiple spaces
    result = result.replace(/\s+/g, ' ').trim();
    
    changed = (before !== result);
  }
  
  // Final cleanup
  result = result.replace(/\s+Z/g, ' Z');
  
  return result;
}

// Remove transform="translate(0,0)" as it's redundant
svgContent = svgContent.replace(/\s+transform="translate\(0,0\)"/g, '');

// Process all path elements
svgContent = svgContent.replace(/<path\s+([^>]*d="([^"]*)"[^>]*)>/g, (match, attrs, pathData) => {
  let cleanedPathData = removeDuplicateCoords(pathData);
  
  // Replace the path data in the attributes
  const newAttrs = attrs.replace(/d="[^"]*"/, `d="${cleanedPathData}"`);
  
  return `<path ${newAttrs}>`;
});

// Format the SVG with proper line breaks for readability
// Add line breaks after each path element
svgContent = svgContent.replace(/><path/g, '>\n<path');
svgContent = svgContent.replace(/><\/svg>/g, '>\n</svg>');
svgContent = svgContent.replace(/^<svg/, '<svg');

// Write the cleaned SVG back
fs.writeFileSync(svgPath, svgContent, 'utf8');

console.log('SVG noise removed successfully!');
console.log('- Removed all duplicate consecutive coordinates');
console.log('- Removed redundant transform="translate(0,0)"');
console.log('- Cleaned up spacing and formatting');
