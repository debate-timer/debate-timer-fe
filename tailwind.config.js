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
          main: '#F8B62D',   
          sub1: '#01204E',
          sub2: '#028391',  
          sub3: '#37474F',   
          sub4: '#FF5622'
        },
        neutral: {
          900: '#121212',
          700: '#3C3C3C',
          500: '#B9B9B9',
          300: '#E5E5E5',
          0: '#FFFFFF',
        },
        system: {
          warning: '#FFBF40',
          success: '#4BD964',
          danger: '#FF3F2F',
        },
        camp : {
          red : '#FF3B2F',
          blue: '#007AFF'
        },
        background: {
          default: '#FFFFFF',
          secondary: '#FFF3DD',
        },
      },
    },
  },
  plugins: [],
};
