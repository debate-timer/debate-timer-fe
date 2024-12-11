module.exports = {
  extends: ["stylelint-config-recommended"],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'apply',
          'layer',
          'responsive',
          'screen',
          'tailwind',
          'variants',
        ],
      },
    ],
    "color-no-invalid-hex": true, // 유효하지 않은 HEX 값 금지
  },
};