// esbuild.config.js
const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  entryPoints: [path.join(__dirname, 'app/javascript/application.js')],
  outdir: path.join(__dirname, 'app/assets/builds'),
  bundle: true,
  sourcemap: true,
  watch: process.argv.includes('--watch')
}).catch(() => process.exit(1));
