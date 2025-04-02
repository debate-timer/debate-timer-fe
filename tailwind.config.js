/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'neon-pros': {
          '0%, 100%': {
            boxShadow: '0 0 12px #2B74E1, 0 0 24px #2B74E1, 0 0 36px #2B74E1',
          },
          '50%': {
            boxShadow: '0 0 4px #2B74E1, 0 0 16px #2B74E1, 0 0 24px #2B74E1',
          },
        },
        'neon-cons': {
          '0%, 100%': {
            boxShadow: '0 0 12px #F64740, 0 0 24px #F64740, 0 0 36px #F64740',
          },
          '50%': {
            boxShadow: '0 0 4px #F64740, 0 0 16px #F64740, 0 0 24px #F64740',
          },
        },
        'neon-neutral': {
          '0%, 100%': {
            boxShadow: '0 0 12px #737373, 0 0 24px #737373, 0 0 36px #737373',
          },
          '50%': {
            boxShadow: '0 0 4px #737373, 0 0 16px #737373, 0 0 24px #737373',
          },
        },
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
        'neon-blink-pros': 'neon-pros 3s infinite alternate',
        'neon-blink-cons': 'neon-cons 3s infinite alternate',
        'neon-blink-neutral': 'neon-neutral 3s infinite alternate',
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
      colors: {
        brand: {
          main: '#FECD4C',
          main501: '#FFF2B3',
          main502: '#FFD866',
          main504: '#E6B843',
          main505: '#C4A64C',

          sub1: '#FF5622',
          sub2: '#028391',
        },
        neutral: {
          1000: '#000000',
          0: '#FFFFFF',
        },
        system: {
          warning: '#FFBF40',
          success: '#4BD964',
          danger: '#FF3F2F',
          error: '#FF8B87',
        },
        camp: {
          red: '#F64740',
          blue: '#2B74E1',
        },
        background: {
          default: '#F6F5F4',
          secondary: '#FFF3DD',
        },
      },
    },
  },
  plugins: [],
};
