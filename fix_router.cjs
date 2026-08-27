const fs = require('fs');
let c = fs.readFileSync('src/router/index.js', 'utf8');

const oldRoutes = `{ path: '/checkout', component: () => import('../views/pembeli/CheckoutView.vue'), meta: { requiresAuth: true, role: 'pembeli' } },`;
const newRoutes = `{ path: '/checkout', component: () => import('../views/pembeli/CheckoutView.vue'), meta: { requiresAuth: true, role: 'pembeli' } },
  { path: '/profil', component: () => import('../views/pembeli/ProfilView.vue'), meta: { requiresAuth: true, role: 'pembeli' } },`;

c = c.replace(oldRoutes, newRoutes);

fs.writeFileSync('src/router/index.js', c, 'utf8');
