const fs = require('fs');
const js = fs.readFileSync('app.js', 'utf8');
try {
  new Function(js);
  console.log("No syntax errors in app.js");
} catch(e) {
  console.error(e);
}
