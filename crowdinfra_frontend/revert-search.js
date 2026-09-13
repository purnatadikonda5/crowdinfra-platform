const fs = require('fs');
let code = fs.readFileSync('app/search-demands/page.js', 'utf8');

code = code.replace(/\/api\/demand/g, "/api/demands");
fs.writeFileSync('app/search-demands/page.js', code);
