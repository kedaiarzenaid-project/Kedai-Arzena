const fs = require('fs');
let c = fs.readFileSync('src/views/kasir/PosView.vue', 'utf8');

// Reduce cart header padding
c = c.replace(
  /<div class='p-4 bg-gray-50 border-b flex justify-between items-center'>/,
  "<div class='p-3 px-4 bg-gray-50 border-b flex justify-between items-center'>"
);

// Reduce checkout panel padding
c = c.replace(
  /<div class='p-4 bg-gray-50 border-t'>/,
  "<div class='p-3 px-4 bg-gray-50 border-t'>"
);

// Reduce big button padding
c = c.replace(
  /font-bold py-3 rounded-xl/,
  "font-bold py-2.5 rounded-lg"
);

fs.writeFileSync('src/views/kasir/PosView.vue', c, 'utf8');
