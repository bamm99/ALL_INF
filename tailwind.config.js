module.exports = {
  content: [
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/assets/stylesheets/**/*.css',
    './app/javascript/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        // Define tus colores personalizados
        'russian-violet': '#452867',
        'dark-violet': '#9409c3',
        'mountbatten-pink': '#94849b',
        'alabaster': '#e0e2db',
        'ghost-white': '#fef9ff',
        'mauve': '#eec5fc',
      },
    },
  },
}
