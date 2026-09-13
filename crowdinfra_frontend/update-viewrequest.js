const fs = require('fs');
let code = fs.readFileSync('app/viewrequest/page.js', 'utf8');

code = code.replace(/process\.env\.NEXT_PUBLIC_BACKEND_URL/g, "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'");

// The API path is already `/api/demands/${requestId}` which is correct for the new backend scaffold!
// The vote is `/api/demands/${request.id}/vote` which is also correct.
// The analysis is `/api/demands/${requestData.id}/analysis` which is also correct.

// Just save it back with the env var changed.
fs.writeFileSync('app/viewrequest/page.js', code);
