const fs = require('fs');
let c = fs.readFileSync('src/views/kasir/DashboardView.vue', 'utf8');

c = c.replace(/@click='router.push\("\\/"\)'/, "@click='router.push(\"/kasir/pos\")'");

fs.writeFileSync('src/views/kasir/DashboardView.vue', c, 'utf8');
