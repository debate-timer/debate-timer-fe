import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  staticDirs: ['../public'],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    builder: '@storybook/builder-vite',
  },
  async viteFinal(config, { configType }) {
    console.log(`# configType = ${configType}`);

    // Storybook의 실행 모드를 테스트 모드로 고정하여
    // msw가 잘 동작할 수 있게 준비
    config.define = {
      ...config.define,
      'import.meta.env.MODE': JSON.stringify('test'),
    };

    return config;
  },
};
export default config;
