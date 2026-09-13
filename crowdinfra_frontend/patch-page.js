const fs = require('fs');
let code = fs.readFileSync('app/page.jsx', 'utf8');

code = code.replace(/\/api\/auth\/verify/, "/api/users/me");
code = code.replace(/if \(response\.data\.valid\) \{[\s\S]*?console\.log\('User is authenticated:', response\.data\.user\)[\s\S]*?setUser\(response\.data\.user\)/, `if (response.data && response.data.id) {
          console.log('User is authenticated:', response.data)
          setUser(response.data)`);

fs.writeFileSync('app/page.jsx', code);
