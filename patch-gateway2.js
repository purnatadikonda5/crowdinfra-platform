const fs = require('fs');
let code = fs.readFileSync('api-gateway/src/main/java/com/crowdinfra/gateway/filter/JwtAuthFilter.java', 'utf8');

code = code.replace(
    /if \(!request.getHeaders\(\).containsKey\(HttpHeaders.AUTHORIZATION\)\) \{\s*exchange.getResponse\(\).setStatusCode\(HttpStatus.UNAUTHORIZED\);\s*return exchange.getResponse\(\).setComplete\(\);\s*\}/,
    `// removed early authorization check`
);

fs.writeFileSync('api-gateway/src/main/java/com/crowdinfra/gateway/filter/JwtAuthFilter.java', code);
