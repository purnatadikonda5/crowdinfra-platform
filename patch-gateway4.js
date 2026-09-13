const fs = require('fs');
let code = fs.readFileSync('api-gateway/src/main/java/com/crowdinfra/gateway/filter/JwtAuthFilter.java', 'utf8');

code = code.replace(/,\s*\"\/api\/demands\"/g, "");
code = code.replace(/,\s*\"\/api\/properties\"/g, "");

fs.writeFileSync('api-gateway/src/main/java/com/crowdinfra/gateway/filter/JwtAuthFilter.java', code);
