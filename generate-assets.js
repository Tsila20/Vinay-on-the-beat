const fs = require('fs');
const path = require('path');

const srcIcon = path.join(__dirname, '..', 'branding', 'app-icon-1024.png');
const srcSplash = path.join(__dirname, '..', 'branding', 'splash-2732.png');

console.log('App icon:', srcIcon);
console.log('Splash:', srcSplash);
console.log('Run this after android is added:');
console.log('npx @capacitor/assets generate --android');
console.log('Then replace splash/logo manually if needed inside android resources.');
