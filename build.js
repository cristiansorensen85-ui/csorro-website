const fs = require('fs');
const path = require('path');

const root = __dirname;
const dist = path.join(root, 'dist');
const pub = path.join(root, 'public');
const copyDir = (name) => {
  const src = path.join(root, name);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(dist, name), { recursive: true });
};

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
if (fs.existsSync(pub)) fs.cpSync(pub, dist, { recursive: true });
copyDir('styles');
fs.copyFileSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));
['product','solutions','resources','pricing','about','founder','os'].forEach(copyDir);
// Also mirror standalone CSS files into public/styles for Pages/static deployments that serve root files.
const rootStyles = path.join(root, 'styles');
const publicStyles = path.join(root, 'public', 'styles');
if (fs.existsSync(rootStyles)) {
  fs.mkdirSync(publicStyles, { recursive: true });
  fs.cpSync(rootStyles, publicStyles, { recursive: true });
}
console.log('Built Sorro V1.0 Brand Foundation static site to dist/.');
