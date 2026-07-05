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
fs.copyFileSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));
['product','solutions','resources','pricing','about','founder','os'].forEach(copyDir);
console.log('Built CSorro OS static site to dist/ with marketing pages and OS app.');
