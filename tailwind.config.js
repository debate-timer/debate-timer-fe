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
