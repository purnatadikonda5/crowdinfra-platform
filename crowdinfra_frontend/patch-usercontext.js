const fs = require('fs');
let code = fs.readFileSync('app/components/user_context.jsx', 'utf8');

code = code.replace(/if \(response\.data\.valid\) \{[\s\S]*?setUser\(response\.data\.user\)/, `if (response.data && response.data.id) {
          setUser(response.data)`);

fs.writeFileSync('app/components/user_context.jsx', code);
