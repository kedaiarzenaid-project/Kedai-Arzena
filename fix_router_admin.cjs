const fs = require('fs');
let c = fs.readFileSync('src/router/index.js', 'utf8');

c = c.replace(
  /if \(to\.meta\.role === 'kasir' && authStore\.role !== 'kasir'\) return next\('\/'\)/,
  "if (to.meta.role === 'kasir' && authStore.role !== 'kasir' && authStore.role !== 'admin') return next('/')"
);

fs.writeFileSync('src/router/index.js', c, 'utf8');
