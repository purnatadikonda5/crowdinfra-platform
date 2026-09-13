const fs = require('fs');
let code = fs.readFileSync('api-gateway/src/main/java/com/crowdinfra/gateway/filter/JwtAuthFilter.java', 'utf8');

code = code.replace(/if \(token == null\) \{/, `System.out.println("JWT FILTER: Path: " + path + " Method: " + request.getMethod().name());
        System.out.println("JWT FILTER: Cookie present: " + request.getCookies().containsKey("token"));
        System.out.println("JWT FILTER: Token value: " + token);
        if (token == null) {
            System.out.println("JWT FILTER: Rejecting because token is null!");`);

code = code.replace(/} catch \(Exception e\) \{/, `} catch (Exception e) {
            System.out.println("JWT FILTER: Rejecting because exception: " + e.getMessage());`);

fs.writeFileSync('api-gateway/src/main/java/com/crowdinfra/gateway/filter/JwtAuthFilter.java', code);
