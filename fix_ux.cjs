const fs = require('fs');

// 1. Fix HomeView.vue
let home = fs.readFileSync('src/views/pembeli/HomeView.vue', 'utf8');

// Allow opening empty cart
home = home.replace(/if \(cartStore\.totalItems === 0\) return;/, '');

// Fix image aspect ratio
home = home.replace(
  /<div class='relative h-32 md:h-48 bg-gray-200 overflow-hidden'>/g,
  `<div class='relative aspect-[4/3] w-full bg-gray-50 overflow-hidden'>`
);
// Make sure object-cover is there, or switch to object-contain if they want no cropping. I will use object-contain and aspect-square so it never crops and is perfectly proportional.
home = home.replace(
  /class='w-full h-full object-cover'/g,
  `class='w-full h-full object-cover'` // I'll stick to cover but with 4:3 aspect ratio, it usually looks best.
);

fs.writeFileSync('src/views/pembeli/HomeView.vue', home, 'utf8');


// 2. Fix CheckoutView.vue
let checkout = fs.readFileSync('src/views/pembeli/CheckoutView.vue', 'utf8');

// Remove the redirect on empty cart
checkout = checkout.replace(
  /if \(cartStore\.items\.length === 0\) \{\s*router\.push\('\/'\)\s*\}/,
  `// allowed empty cart`
);

fs.writeFileSync('src/views/pembeli/CheckoutView.vue', checkout, 'utf8');
