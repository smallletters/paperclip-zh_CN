const fs = require('fs');
const content = fs.readFileSync('ui/src/context/LanguageContext.tsx', 'utf8');

// Extract English keys - look for the en: { ... } section
const enMatch = content.match(/en:\s*\{([\s\S]*?)\n  \},?\s*\n  zh:/);
if (!enMatch) {
  console.log('Could not find en section');
  process.exit(1);
}

const enContent = enMatch[1];
const keys = [...enContent.matchAll(/"([^"]+)":\s*"/g)].map(m => m[1]);

console.log(`Found ${keys.length} English translation keys`);

const duplicates = [];
const seen = new Set();
for (const key of keys) {
  if (seen.has(key)) {
    duplicates.push(key);
  } else {
    seen.add(key);
  }
}

if (duplicates.length > 0) {
  console.log('\nDuplicate keys found in English section:');
  duplicates.forEach(k => console.log('  - ' + k));
} else {
  console.log('\nNo duplicate keys found in English section.');
}

// Check Chinese section
const zhMatch = content.match(/zh:\s*\{([\s\S]*?)\n  \},?\s*\n\};/);
if (!zhMatch) {
  console.log('Could not find zh section');
  process.exit(1);
}

const zhContent = zhMatch[1];
const zhKeys = [...zhContent.matchAll(/"([^"]+)":\s*"/g)].map(m => m[1]);

console.log(`\nFound ${zhKeys.length} Chinese translation keys`);

const zhDuplicates = [];
const zhSeen = new Set();
for (const key of zhKeys) {
  if (zhSeen.has(key)) {
    zhDuplicates.push(key);
  } else {
    zhSeen.add(key);
  }
}

if (zhDuplicates.length > 0) {
  console.log('\nDuplicate keys found in Chinese section:');
  zhDuplicates.forEach(k => console.log('  - ' + k));
} else {
  console.log('\nNo duplicate keys found in Chinese section.');
}

// Check for missing translations
console.log('\n--- Checking for missing translations ---');
const enSet = new Set(keys);
const zhSet = new Set(zhKeys);

const missingInZh = [...enSet].filter(k => !zhSet.has(k));
const missingInEn = [...zhSet].filter(k => !enSet.has(k));

if (missingInZh.length > 0) {
  console.log('\nKeys missing in Chinese section:');
  missingInZh.forEach(k => console.log('  - ' + k));
} else {
  console.log('\nAll English keys have Chinese translations.');
}

if (missingInEn.length > 0) {
  console.log('\nKeys missing in English section:');
  missingInEn.forEach(k => console.log('  - ' + k));
} else {
  console.log('All Chinese keys have English translations.');
}

console.log('\n--- Summary ---');
console.log(`English keys: ${keys.length}`);
console.log(`Chinese keys: ${zhKeys.length}`);
console.log(`Duplicates in EN: ${duplicates.length}`);
console.log(`Duplicates in ZH: ${zhDuplicates.length}`);
console.log(`Missing in ZH: ${missingInZh.length}`);
console.log(`Missing in EN: ${missingInEn.length}`);
