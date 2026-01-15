const fs = require('fs');
const path = require('path');

// Read the SVG file
const svgPath = path.join(__dirname, '../public/icon.svg');
let svgContent = fs.readFileSync(svgPath, 'utf8');

// Function to round numbers in path data
function roundPathNumbers(pathData, precision = 0) {
  // Match all numbers (including negative and decimals)
  return pathData.replace(/-?\d+\.?\d*/g, (match) => {
    const num = parseFloat(match);
    if (isNaN(num)) return match;
    // Round to integer (precision = 0) or specified decimal places
    return num.toFixed(precision);
  });
}

// Process all path elements
svgContent = svgContent.replace(/<path\s+([^>]*d="([^"]*)"[^>]*)>/g, (match, attrs, pathData) => {
  // Round all numbers in the path data to integers
  const cleanedPathData = roundPathNumbers(pathData, 0);
  
  // Replace the path data in the attributes
  const newAttrs = attrs.replace(/d="[^"]*"/, `d="${cleanedPathData}"`);
  
  return `<path ${newAttrs}>`;
});

// Also clean transform attributes
svgContent = svgContent.replace(/transform="translate\(([^)]+)\)"/g, (match, coords) => {
  const cleanedCoords = coords.split(',').map(coord => {
    const num = parseFloat(coord.trim());
    return isNaN(num) ? coord.trim() : Math.round(num).toString();
  }).join(',');
  return `transform="translate(${cleanedCoords})"`;
});

// Write the cleaned SVG back
fs.writeFileSync(svgPath, svgContent, 'utf8');

console.log('SVG paths cleaned successfully! All coordinates rounded to integers.');
