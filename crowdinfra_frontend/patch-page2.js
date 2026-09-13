const fs = require('fs');
let code = fs.readFileSync('app/page.jsx', 'utf8');

code = code.replace(/if \(response\.data\.valid\) \{/, "if (response.data && response.data.id) {");
code = code.replace(/console\.log\('User is authenticated:', response\.data\.user\)/, "console.log('User is authenticated:', response.data)");

fs.writeFileSync('app/page.jsx', code);
