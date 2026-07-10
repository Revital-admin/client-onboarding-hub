const fs = require('fs');
try {
  const code = fs.readFileSync(process.argv[2], 'utf8');
  new Function(code);
  console.log("Syntax OK");
} catch (e) {
  console.error("Syntax Error:", e);
  process.exit(1);
}
