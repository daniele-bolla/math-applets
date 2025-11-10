/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },

  extends: [
    "eslint:recommended",
    "plugin:astro/recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],

  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },

  settings: {
    react: {
      version: "detect"
    }
  },

  plugins: ["react", "@typescript-eslint"],

  rules: {
    "react/react-in-jsx-scope": "off",  
    "@typescript-eslint/no-unused-vars": ["warn"],
    "no-undef": "off"
  }
};
