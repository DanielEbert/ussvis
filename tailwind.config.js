const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content : [
        './src/renderer/**/*.{js,jsx,ts,tsx}',
        './node_modules/react-tailwindcss-datepicker/dist/index.esm.js'
    ],
    theme : {
        extend: {
            fontFamily: {
                'sans': ['Inter', ...defaultTheme.fontFamily.sans]
            }
        }
    },
    variants : {},
    plugins : [],
};