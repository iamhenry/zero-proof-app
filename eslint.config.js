// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
// Import other plugins and configurations as needed by the project if known
// For example, if using Prettier, React Hooks plugin, etc.

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  reactRecommended,
  // Add other configurations here
  {
    rules: {
      // Add any project-specific rule overrides here
      // e.g. "no-unused-vars": "warn"
    }
  },
  {
    ignores: ["node_modules/", "build/", "dist/", "*.config.js", "*.config.mjs", "*.config.cjs"]
    // Add other ignored patterns if necessary
  }
);
