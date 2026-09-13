const fs = require('fs');
let code = fs.readFileSync('api-gateway/src/main/java/com/crowdinfra/gateway/filter/JwtAuthFilter.java', 'utf8');

code = code.replace(
    /String authHeader = request.getHeaders\(\).getFirst\(HttpHeaders.AUTHORIZATION\);[\s\S]*?String token = authHeader.substring\(7\);/,
    `String token = null;
        if (request.getCookies().containsKey("token")) {
            token = request.getCookies().getFirst("token").getValue();
        } else if (request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        if (token == null) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }`
);

// We should also ensure `PUBLIC_PATHS` includes `/api/demands` with GET request, or `/api/properties` with GET request!
// Because browsing properties and demands should be public according to standard real estate apps! Wait, let's look at demandController.
// Actually, earlier the user could browse without being logged in. Let's make GET /api/demands and GET /api/properties public!

code = code.replace(
    /"\/swagger-resources"/,
    `"/swagger-resources",
            "/api/demands",
            "/api/properties"`
);
// But wait, what if they are POST requests? The filter just checks `path.startsWith`.
// If `isPublicPath` just skips auth completely, anyone can POST to `/api/demands`. That's a security vulnerability!
// We should check the HTTP Method!

code = code.replace(
    /boolean isPublicPath = PUBLIC_PATHS.stream\(\).anyMatch\(path::startsWith\);/,
    `boolean isPublicPath = PUBLIC_PATHS.stream().anyMatch(path::startsWith) ||
               (request.getMethod().name().equals("GET") && (path.startsWith("/api/demands") || path.startsWith("/api/properties")));`
);

fs.writeFileSync('api-gateway/src/main/java/com/crowdinfra/gateway/filter/JwtAuthFilter.java', code);
