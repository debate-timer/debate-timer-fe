/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        rotate: {
          '0%': { transform: 'rotate(0deg) scale(10)' },
          '100%': { transform: 'rotate(-360deg) scale(10)' },
        },
        gradient: {
          '0%, 100%': {
            'background-size': '300% 300%',
            'background-position': 'left center',
          },
          '33%': {
            'background-size': '300% 300%',
            'background-position': 'center center',
          },
          '66%': {
            'background-size': '300% 300%',
            'background-position': 'right center',
          },
        },
        colorTransition: {
          '0%, 100%': {
            backgroundColor: '#ffa2a2',
          },
          '50%': {
            backgroundColor: '#ff6467',
          },
        },
      },
      animation: {
        rotate: 'rotate 5s linear infinite',
        gradient: 'gradient 10s ease infinite',
        'color-transition': 'colorTransition 5s ease-in-out infinite',
      },
      fontFamily: {
        pretendard: [
          '"Pretendard Variable"',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          '"Helvetica Neue"',
          '"Segoe UI"',
          '"Apple SD Gothic Neo"',
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          'sans-serif',
        ],
      },
      fontSize: {
        'display-raw': ['72px'],
        'title-raw': ['28px'],
        'subtitle-raw': ['24px'],
        'detail-raw': ['20px'],
        'body-raw': ['16px'],
        'timer-raw': ['110px'],
      },
      boxShadow: {
        'camp-blue': `0 0 30px #FF3B2F`,
        'camp-red': `0 0 30px #007AFF`,
        'camp-neutral': `0 0 30px #737373`,
      },
      colors: {
        camp: {
          red: '#E14666',
          blue: '#1E91D6',
        },
        brand: {
          DEFAULT: '#FECD4C',
          hover: '#DBA822',
        },
        default: {
          'disabled/hover': '#D6D7D9',
          neutral: '#A3A3A3',
          dim: '#222222',
          border: '#79747E',
          timeout: '#4F4F4F',
          white: '#FFFFFF',
          black: '#222222',
          black2: '#404040',
        },
        semantic: {
          warning: '#FF8B87',
          error: '#D70000',
          table: '#FF5622',
          material: '#6750A4',
        },
      },
    },
    screens: {
      md: '768px',
      lg: '1280px',
      xl: '1450px',
    },
  },
};
