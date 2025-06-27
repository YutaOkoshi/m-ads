import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  // Apply to all TypeScript files
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // Type Safety Rules (必須)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      
      // Null/Undefined Safety
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error', 
      '@typescript-eslint/no-non-null-assertion': 'error',
      
      // Function and Return Type Safety
      '@typescript-eslint/explicit-function-return-type': 'warn',
      
      // Import/Export Safety
      '@typescript-eslint/consistent-type-imports': 'error',
      
      // General Code Quality Rules
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
    },
  },
  // Ignore patterns
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.js',
    ],
  },
]; 