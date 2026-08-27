const fs = require('fs');
let c = fs.readFileSync('src/views/kasir/PosView.vue', 'utf8');

c = c.replace(/const orderNumber = \$.*/, "const orderNumber = `POS-${dateStr}-${randomNum}`");

fs.writeFileSync('src/views/kasir/PosView.vue', c, 'utf8');
