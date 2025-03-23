import globals from 'globals'
import standard from '@sequencemedia/eslint-config-standard/configs/recommended/merge'
import typescript from '@sequencemedia/eslint-config-typescript/configs/recommended/merge'

export default [
  /**
   *  Standard config
   */
  standard({
    files: [
      '**/*.{mjs,cjs,mts,cts}'
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.mocha
      }
    }
  }),
  typescript({
    files: [
      '**/*.{mts,cts}'
    ],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off'
    }
  })
]
