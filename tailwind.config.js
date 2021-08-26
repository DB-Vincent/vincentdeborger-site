module.exports = {
  purge: [],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      // typography: {
      //   DEFAULT: {
      //     css: {
      //       color: 'white',
      //       h1: {
      //         color: 'white'
      //       },
      //       h2: {
      //         color: 'white'
      //       },
      //       h3: {
      //         color: 'white'
      //       },
      //       h4: {
      //         color: 'white'
      //       },
      //       blockquote: {
      //         color: 'white'
      //       },
      //       th: {
      //         color: 'white'
      //       },
      //       strong: {
      //         color: 'white'
      //       },
      //       code: {
      //         color: 'white'
      //       }
      //     },
      //   },
      // }
    },
  },
  variants: {
    marginBottom: ({ after }) => after(["last-of-type"]),
  },
  corePlugins: {
    container: false
  },
  plugins: [
    require('@tailwindcss/typography'),
    function ({ addComponents }) {
      addComponents({
        '.container': {
          maxWidth: '100%',
          '@screen sm': {
            maxWidth: '600px',
          },
          '@screen md': {
            maxWidth: '700px',
          },
          '@screen lg': {
            maxWidth: '800px',
          },
          '@screen xl': {
            maxWidth: '900px',
          },
        }
      })
    },function ({ addVariant, e }) {
      addVariant("last-of-type", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`last-of-type${separator}${className}`)}:last-of-type`;
        });
      });
    },
  ]
}