const fs = require('fs');
let c = fs.readFileSync('src/views/kasir/DashboardView.vue', 'utf8');

c = c.replace(/const waUrl = \$.*/, 'const waUrl = `https://wa.me/${phoneStr}?text=${encodeURIComponent(msg)}`');

fs.writeFileSync('src/views/kasir/DashboardView.vue', c, 'utf8');
