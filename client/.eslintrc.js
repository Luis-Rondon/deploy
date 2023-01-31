module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'react/jsx-filename-extension': [
      2,
      {
        extensions: [
          '.js',
          '.jsx',
        ],
      },
    ],
    'linebreak-style': 0,
    'no-underscore-dangle': 0,
    'arrow-body-style': 0,
    'no-shadow': 0,
    'consistent-return': 0,
    'no-nested-ternary': 0,
    'no-console': 0,
    'no-case-declarations': 0,
    'import/prefer-default-export': 0,
    'import/named': 0,
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'react/forbid-prop-types': 0,
    'no-param-reassign': 0,
    radix: 0,
    'prefer-promise-reject-errors': 0,
    'react/jsx-props-no-spreading': 0,
  },
  plugins: ['prettier'],
};
