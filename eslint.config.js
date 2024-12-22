// JavaScript 기본 설정
import js from '@eslint/js';

// 글로벌 변수 환경 설정
import globals from 'globals';

// React 관련 규칙 및 플러그인
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';

// 웹 접근성 관련 규칙
import jsxA11y from 'eslint-plugin-jsx-a11y';

// Tailwind CSS 클래스 검사를 위한 플러그인
import tailwindcss from 'eslint-plugin-tailwindcss';

// Prettier 관련 설정
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

// TypeScript 관련 플러그인 및 설정
import tseslint from 'typescript-eslint';

// ESLint 구성 내보내기
export default tseslint.config(
  // 기본 설정 옵션
  {
    ignores: ['dist'], // 배포 디렉터리(dist) 제외
  },
  {
    // 확장 규칙 설정
    extends: [
      js.configs.recommended, // JavaScript 권장 규칙
      ...tseslint.configs.recommended, // TypeScript 권장 규칙
      prettierConfig, // Prettier 관련 규칙 적용
    ],

    // 적용 파일 패턴
    files: ['**/*.{ts,tsx}'], // TypeScript 파일만 대상으로 설정

    // 언어 옵션
    languageOptions: {
      ecmaVersion: 2020, // 최신 ECMAScript 문법 사용
      globals: globals.browser, // 브라우저 환경 글로벌 변수 설정
    },

    // 플러그인 등록
    plugins: {
      react: react, // React 관련 규칙
      'react-hooks': reactHooks, // React Hooks 관련 규칙
      'react-refresh': reactRefresh, // React Refresh 관련 규칙
      'jsx-a11y': jsxA11y, // 웹 접근성 관련 규칙
      prettier: prettier, // Prettier 규칙
      tailwindcss: tailwindcss, // Tailwind CSS 클래스명 검사
    },

    // 규칙 설정
    rules: {
      ...react.configs.recommended.rules, // React 권장 규칙
      ...reactHooks.configs.recommended.rules, // React Hooks 권장 규칙
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }, // React Refresh 관련 규칙
      ],
      'jsx-a11y/alt-text': 'warn', // 접근성: alt 속성 검사
      'prettier/prettier': 'warn', // Prettier 관련 규칙 적용
      'tailwindcss/classnames-order': 'warn', // Tailwind CSS 클래스명 정렬 검사
      'react/react-in-jsx-scope': 'off',
    },

    // 설정 추가 (예: import-resolver)
    settings: {
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
      react: {
        version: 'detect',
      },
      tailwindcss: {
        config: './tailwind.config.js', // Tailwind 설정 파일 위치 지정
      },
    },
  },
);
