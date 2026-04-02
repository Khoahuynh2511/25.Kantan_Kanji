export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './shared/**/*.{ts,tsx}',
    './core/**/*.{ts,tsx}',
    './static/styles.ts',
    './static/info.tsx'
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        listItem: '35px 1fr',
        body: '200px 1fr',
        itemsSentences: '399px 1fr',
        blogSideLeft: '48px 1fr 40px',
        blogSideRight: '48px 1fr 120px',
        blogs: '1fr 200px',
        closeBlogs: '1fr 80px'
      },
      keyframes: {
        aurora: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        }
      },
      animation: {
        aurora: 'aurora 6s ease-in-out infinite'
      }
    }
  },
  plugins: []
};