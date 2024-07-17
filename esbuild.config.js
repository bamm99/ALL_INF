const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  entryPoints: [path.join(__dirname, 'app/javascript/application.js')],
  outdir: path.join(__dirname, 'app/assets/builds'),
  bundle: true,
  sourcemap: true,
  loader: { '.css': 'file', '.js': 'jsx' },
  watch: process.argv.includes('--watch'),
  plugins: [
    {
      name: 'css',
      setup(build) {
        build.onResolve({ filter: /\.css$/ }, args => {
          if (args.path.startsWith('./') || args.path.startsWith('../')) {
            return { path: path.resolve(args.resolveDir, args.path), namespace: 'file' };
          }
          return {
            path: require.resolve(args.path, { paths: [args.resolveDir] }),
            namespace: 'file'
          };
        });
        build.onLoad({ filter: /\.css$/, namespace: 'file' }, async args => {
          const css = await require('fs').promises.readFile(args.path, 'utf8');
          return {
            contents: css,
            loader: 'css',
          };
        });
      },
    },
  ],
}).catch(() => process.exit(1));
