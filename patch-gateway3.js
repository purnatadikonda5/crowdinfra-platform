const fs = require('fs');
let code = fs.readFileSync('api-gateway/src/main/java/com/crowdinfra/gateway/filter/JwtAuthFilter.java', 'utf8');

code = code.replace(/path\.startsWith\("\/api\/properties"\)/, 'path.startsWith("/api/properties") || path.startsWith("/api/comments")');

fs.writeFileSync('api-gateway/src/main/java/com/crowdinfra/gateway/filter/JwtAuthFilter.java', code);
