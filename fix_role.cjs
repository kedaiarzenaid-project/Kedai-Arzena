const fs = require('fs');

// 1. Update auth.js
let authCode = fs.readFileSync('src/stores/auth.js', 'utf8');
authCode = authCode.replace(/role: 'pembeli'/g, "role: 'user'");
fs.writeFileSync('src/stores/auth.js', authCode, 'utf8');

// 2. Update router/index.js
let routerCode = fs.readFileSync('src/router/index.js', 'utf8');
routerCode = routerCode.replace(/role: 'pembeli'/g, "role: 'user'");
fs.writeFileSync('src/router/index.js', routerCode, 'utf8');

console.log("Updated codebase from pembeli to user");
