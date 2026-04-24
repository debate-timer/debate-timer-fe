# 번들링 (Bundling) 상세 가이드

출처: https://frontend-fundamentals.com/bundling/

## 번들링이란

번들링(Bundling)은 여러 개의 파일(JavaScript, CSS, 이미지 등)을 하나 또는 몇 개의 파일로 묶는 작업이다. 묶인 파일을 번들(Bundle)이라고 부른다.

### 번들링의 목적
1. **요청 수 감소**: 수십~수백 개 파일을 하나로 묶어 브라우저 요청 횟수를 줄인다
2. **캐싱 최적화**: 묶인 파일 하나만 캐시하면 되어 효율적이다
3. **유지보수성과 배포 효율성**: 개발 시 모듈화를 유지하면서 배포 시 성능 최적화가 가능하다

### 번들링 과정 한눈에 보기
1. 여러 개의 JS 파일이 있다 (index.js, utils.js, auth.js, dashboard.js)
2. 파일들이 서로 의존한다 (의존성 관계)
3. 번들러가 파일 관계를 분석한다 (시작 지점부터 의존성 그래프를 그린다)
4. 하나의 파일로 묶는다 → bundle.js
5. 추가 최적화: 트리 셰이킹, 코드 스플리팅, 미니피케이션
6. 최종 결과물을 배포한다

---

## 번들러란

번들러는 번들링을 수행하는 도구다. 대표적인 번들러:
- **Webpack**: 가장 널리 사용되는 번들러, 풍부한 생태계
- **Rollup**: 라이브러리 번들링에 최적화, ESM 지원 우수
- **Vite**: 개발 서버에서 ESM 네이티브 활용, 빠른 HMR
- **esbuild**: Go로 작성, 매우 빠른 빌드 속도

---

## Webpack 튜토리얼 (핵심 단계)

### 1. 첫 번들 만들기
```bash
npm init -y
npm install webpack webpack-cli --save-dev
```

`webpack.config.js`:
```js
const path = require('path');
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```

### 2. 모듈로 코드 구조화하기
ESM의 `import`/`export`로 모듈 간 의존성을 관리한다. Webpack은 이를 분석해 의존성 그래프를 만든다.

### 3. TypeScript 적용하기
`ts-loader` 또는 `babel-loader`로 TypeScript를 처리한다. `tsconfig.json` 설정이 필요하다.

### 4. React 적용하기
`babel-loader` + `@babel/preset-react`로 JSX를 변환한다.

### 5. 스타일 관리하기
`css-loader` + `style-loader`로 CSS를 번들에 포함시킨다. CSS Modules, PostCSS, Sass 등도 로더로 처리 가능하다.

### 6. 이미지 등 정적 자원 다루기
Webpack 5부터는 Asset Modules(`type: 'asset'`)로 이미지, 폰트 등을 직접 처리할 수 있다.

### 7. 플러그인으로 빌드 확장하기
- `HtmlWebpackPlugin`: HTML 자동 생성
- `MiniCssExtractPlugin`: CSS 별도 파일로 추출
- `CleanWebpackPlugin`: 빌드 전 출력 디렉토리 정리

### 8. 개발 서버로 생산성 높이기
`webpack-dev-server`로 HMR(Hot Module Replacement)이 가능한 개발 서버를 띄운다.

---

## 심화: 번들링 동작 이해하기

### 진입점 (Entry)
번들러가 의존성 그래프를 만드는 시작점. 기본값은 `./src/index.js`.

```js
module.exports = {
  entry: './src/index.js', // 단일 진입점
  // 또는 다중 진입점:
  entry: {
    main: './src/index.js',
    admin: './src/admin.js',
  },
};
```

### 경로 탐색 (Resolution)
`import` 경로를 실제 파일 경로로 변환하는 과정. `resolve.extensions`, `resolve.alias` 등으로 커스터마이징한다.

### 로더 (Loader)
Webpack은 기본적으로 JS/JSON만 이해한다. 로더를 통해 다른 파일 유형(TS, CSS, 이미지 등)을 모듈로 변환한다.

```js
module: {
  rules: [
    { test: /\.tsx?$/, use: 'ts-loader' },
    { test: /\.css$/, use: ['style-loader', 'css-loader'] },
  ],
},
```

로더 체인은 **오른쪽에서 왼쪽**(아래에서 위)으로 실행된다.

### 플러그인 (Plugin)
로더가 파일 단위 변환이라면, 플러그인은 번들링 전체 프로세스에 개입한다. 번들 최적화, 환경 변수 주입, HTML 생성 등.

### 출력 (Output)
번들된 결과물의 위치와 이름을 설정한다.

```js
output: {
  filename: '[name].[contenthash].js',
  path: path.resolve(__dirname, 'dist'),
},
```

---

## 심화: 개발 환경

### 개발 서버 (Dev Server)
파일 변경을 감지해 자동으로 빌드하고 브라우저에 반영한다. 메모리 기반으로 동작하여 디스크 I/O 없이 빠르다.

### HMR (Hot Module Replacement)
전체 페이지를 새로고침하지 않고 변경된 모듈만 교체한다. 애플리케이션 상태를 유지하면서 개발 가능. React에서는 React Fast Refresh와 결합하여 컴포넌트 상태를 보존한다.

### 소스맵 (Source Map)
빌드된 코드와 원본 소스 코드 사이의 매핑 정보. 브라우저 DevTools에서 원본 코드 기준으로 디버깅 가능.

설정: `devtool: 'source-map'` (프로덕션), `devtool: 'eval-source-map'` (개발).

---

## 심화: 번들 최적화

### 코드 스플리팅 (Code Splitting)
하나의 큰 번들을 여러 개의 작은 청크로 분리한다. 사용자가 필요한 코드만 먼저 로드하여 초기 로딩 속도를 개선한다.

방법:
1. **다중 진입점**: 페이지별 진입점 분리
2. **동적 import**: `import()`를 사용해 필요 시점에 로드
3. **SplitChunksPlugin**: 공통 의존성을 별도 청크로 추출

```tsx
// 동적 import 예시 (React.lazy)
const AdminPage = React.lazy(() => import('./AdminPage'));
```

### 트리 셰이킹 (Tree Shaking)
사용되지 않는 코드(Dead Code)를 번들에서 제거하는 최적화 기법.

**핵심 조건**: ESM(ES Modules) 기반이어야 한다.

#### ESM vs CJS
- **ESM**: `import`/`export`는 정적 분석 가능. 재할당 불가. 최상단에만 위치 가능. → 트리 셰이킹 효과적
- **CJS**: `require`는 동적. 조건문 안에서 사용 가능. 몽키패칭 가능. → 트리 셰이킹 어려움

#### ESM 기반 라이브러리 사용하기
```js
// Bad: lodash는 CJS → 전체가 번들에 포함될 수 있음
import { deepEqual } from "lodash";

// Good: es-toolkit은 ESM → 필요한 함수만 포함
import { isEqual } from "es-toolkit";
```

#### 사이드 이펙트와 트리 셰이킹
- **사이드 이펙트가 없는 코드**: 순수 함수, 원본 비변경 내장 함수 등 → 안전하게 제거 가능
- **사이드 이펙트가 있는 코드**: 전역 상태 변경, DOM 조작, getter 부수효과 등 → 제거 시 문제 발생 가능

#### `/*@__PURE__*/` 주석
번들러에게 "이 코드는 사이드 이펙트 없음"을 명시적으로 알린다:
```js
const Icon = /*@__PURE__*/ React.createElement(...);
```

#### `package.json`의 `sideEffects` 필드
```json
{ "sideEffects": false }          // 모든 파일에 사이드 이펙트 없음
{ "sideEffects": ["*.css", "./src/global.js"] }  // 특정 파일만 보호
```

### 번들 분석 (Bundle Analyzer)
번들 내용을 시각적으로 분석하여 불필요하게 큰 모듈이나 중복된 의존성을 찾는다. `webpack-bundle-analyzer` 플러그인 사용.
