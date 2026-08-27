const fs = require('fs');
let content = fs.readFileSync('src/views/pembeli/HomeView.vue', 'utf8');

// Update animation speed
content = content.replace(/all 0\.6s/g, 'all 0.9s');
content = content.replace(/}, 600\)/g, '}, 900)');

// Add transition-transform to product card
content = content.replace(
  /<div v-for='prod in filteredProducts' :key='prod\.id' class='bg-white/g,
  `<div :id="'prod-card-' + prod.id" v-for='prod in filteredProducts' :key='prod.id' class='bg-white transition-transform duration-200`
);

// Add card bounce logic to addToCartWithAnim
const oldLogic = `  if (imgEl && cartIconEl) {`;
const newLogic = `  const cardEl = document.getElementById('prod-card-' + prod.id)
  if (cardEl) {
    cardEl.style.transform = 'scale(0.95)'
    setTimeout(() => cardEl.style.transform = 'scale(1)', 200)
  }

  if (imgEl && cartIconEl) {`;

content = content.replace(oldLogic, newLogic);

fs.writeFileSync('src/views/pembeli/HomeView.vue', content, 'utf8');
