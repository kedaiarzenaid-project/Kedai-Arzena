const fs = require('fs');
let c = fs.readFileSync('src/router/index.js', 'utf8');

const oldRoutes = `{ path: '/kasir', component: () => import('../views/kasir/DashboardView.vue'), meta: { requiresAuth: true, role: 'kasir' } },`;
const newRoutes = `{ path: '/kasir', component: () => import('../views/kasir/DashboardView.vue'), meta: { requiresAuth: true, role: 'kasir' } },
  { path: '/kasir/pos', component: () => import('../views/kasir/PosView.vue'), meta: { requiresAuth: true, role: 'kasir' } },`;

c = c.replace(oldRoutes, newRoutes);

fs.writeFileSync('src/router/index.js', c, 'utf8');
