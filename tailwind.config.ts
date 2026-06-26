import type { Config } from 'tailwindcss';

/**
 * Design system NaturalMe
 * Palette : vert sauge, beige, blanc cassé, accents verts, dégradés doux.
 * Esprit : moderne, épuré, minimaliste, beaucoup d'espace blanc.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Vert menthe « Glow » — couleur de marque #85ff9c (niveau 300)
        sage: {
          50: '#effdf3',
          100: '#d6fbe1',
          200: '#a8f6c0',
          300: '#85ff9c', // ← couleur de marque
          400: '#45dd74',
          500: '#16a34a', // accent (icônes, traits)
          600: '#0f7a37', // texte/accent lisible
          700: '#0c6230',
          800: '#0b4f28',
          900: '#08331a', // texte foncé
        },
        // Noir signature de la refonte landing « premium » (N&B + accent unique).
        // L'accent reste sage-300 (#85ff9c) — identique aux boutons de l'app.
        ink: {
          DEFAULT: '#0A0A0A',
          900: '#0A0A0A',
          800: '#141414',
          700: '#1f1f1f',
        },
        // Beige / sable — surfaces secondaires
        beige: {
          50: '#faf8f3',
          100: '#f3ede1',
          200: '#e9ddc8',
          300: '#dcc9a8',
          400: '#cbb083',
        },
        // Blanc cassé — fond principal
        cream: '#faf9f5',
        // ── Palette Landing « Glow » (style premium Cal AI)
        mint: { DEFAULT: '#b6ffc4', soft: '#dcffe3', deep: '#8df0a3' },
        forest: { DEFAULT: '#2E5D4B', dark: '#244a3c', light: '#3c7560' },
        gold: { DEFAULT: '#F2C14E', soft: '#f9dd92' },
        sand: '#F5F1E8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Titres hero « premium » plus légers (poids 300/400)
        montserrat: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(16, 80, 40, 0.12)',
        'soft-lg': '0 12px 40px -12px rgba(16, 80, 40, 0.18)',
        // Lueur menthe pour les CTA principaux
        glow: '0 1px 0 0 rgba(255,255,255,0.6) inset, 0 18px 50px -16px rgba(69, 221, 116, 0.65)',
        // Lueur accent #85ff9c discrète (éléments mis en valeur sur fond sombre)
        'accent-glow': '0 0 0 1px rgba(133,255,156,0.5), 0 14px 50px -14px rgba(133,255,156,0.45)',
      },
      backgroundImage: {
        'sage-gradient': 'linear-gradient(135deg, #d6fbe1 0%, #f3ede1 100%)',
        'hero-gradient':
          'radial-gradient(1200px 600px at 50% -10%, #d6fbe1 0%, #faf9f5 55%)',
        // Dégradé « mesh » organique pour les fonds premium
        mesh:
          'radial-gradient(40rem 30rem at 12% 8%, rgba(133,255,156,0.35), transparent 60%),' +
          'radial-gradient(36rem 28rem at 88% 0%, rgba(220,201,168,0.40), transparent 55%),' +
          'radial-gradient(48rem 36rem at 50% 110%, rgba(69,221,116,0.26), transparent 60%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Flottement lent des blobs de fond
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0) scale(1)' },
          '50%': { transform: 'translateY(-18px) translateX(10px) scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
        'float-slow': 'float 14s ease-in-out infinite',
        'float-slower': 'float 20s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
