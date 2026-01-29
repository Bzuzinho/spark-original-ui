import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
        './resources/js/**/*.ts',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                neutral: {
                    1: "var(--color-neutral-1)",
                    2: "var(--color-neutral-2)",
                    3: "var(--color-neutral-3)",
                    4: "var(--color-neutral-4)",
                    5: "var(--color-neutral-5)",
                    6: "var(--color-neutral-6)",
                    7: "var(--color-neutral-7)",
                    8: "var(--color-neutral-8)",
                    9: "var(--color-neutral-9)",
                    10: "var(--color-neutral-10)",
                    11: "var(--color-neutral-11)",
                    12: "var(--color-neutral-12)",
                },
                accent: {
                    1: "var(--color-accent-1)",
                    2: "var(--color-accent-2)",
                    3: "var(--color-accent-3)",
                    4: "var(--color-accent-4)",
                    5: "var(--color-accent-5)",
                    6: "var(--color-accent-6)",
                    7: "var(--color-accent-7)",
                    8: "var(--color-accent-8)",
                    9: "var(--color-accent-9)",
                    10: "var(--color-accent-10)",
                    11: "var(--color-accent-11)",
                    12: "var(--color-accent-12)",
                    contrast: "var(--color-accent-contrast)",
                },
                fg: {
                    DEFAULT: "var(--color-fg)",
                    secondary: "var(--color-fg-secondary)",
                },
                bg: {
                    DEFAULT: "var(--color-bg)",
                    inset: "var(--color-bg-inset)",
                    overlay: "var(--color-bg-overlay)",
                },
            },
        },
    },

    plugins: [forms],
};
