const fs = require('fs');
let code = fs.readFileSync('app/components/login.jsx', 'utf8');

code = code.replace(/process\.env\.NEXT_PUBLIC_BACKEND_URL/g, "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'");
code = code.replace(/if \(response\.data && response\.data\.success\) \{/, "if (response.data && response.data.accessToken) {");

fs.writeFileSync('app/components/login.jsx', code);
