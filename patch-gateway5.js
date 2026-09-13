const fs = require('fs');
let code = fs.readFileSync('api-gateway/src/main/java/com/crowdinfra/gateway/filter/JwtAuthFilter.java', 'utf8');

code = code.replace(/boolean isPublicPath/, `if (request.getMethod().name().equals("OPTIONS")) {
            return chain.filter(exchange);
        }

        boolean isPublicPath`);

fs.writeFileSync('api-gateway/src/main/java/com/crowdinfra/gateway/filter/JwtAuthFilter.java', code);
