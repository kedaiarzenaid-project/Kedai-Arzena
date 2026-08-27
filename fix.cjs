const fs = require('fs');
let c = fs.readFileSync('src/views/pembeli/CheckoutView.vue', 'utf8');

// Replace calcError
c = c.replace(/calcError\.value = .*/, 'calcError.value = `${distKm.toFixed(1)} KM: Melebihi batas maksimal pengantaran (${settings.value.max_delivery_radius_km} KM).`');

// Replace orderNumber
c = c.replace(/const orderNumber = .*/, 'const orderNumber = `ORZ-${dateStr}-${randomNum}`');

fs.writeFileSync('src/views/pembeli/CheckoutView.vue', c, 'utf8');
