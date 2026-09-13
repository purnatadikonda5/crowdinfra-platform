const fs = require('fs');
let code = fs.readFileSync('app/search-demands/page.js', 'utf8');

// 1. Update BACKEND_URL to API_URL
code = code.replace(/process\.env\.NEXT_PUBLIC_BACKEND_URL/g, "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'");

// 2. Change /api/demands to /api/demand (Actually wait, we decided the backend uses /api/demands for GET !
// So we ONLY change it for the upvote and comment POST endpoints because demandController uses /api/demand/{id}/vote etc?
// Wait, api-gateway routes /api/demands/** to demand-service. So /api/demands/{id}/vote is correct if demand-service handles it!
// Let's check demand-service controller mappings!
