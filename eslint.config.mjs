// Lint de correction (pas de style) : le jeu est assemblé par build.sh en un seul script,
// on vérifie donc le paquet complet dist/bundle.js (les modules src/*.js partagent leurs globales).
import globals from "globals";
const bugs = {
  "no-undef": "error", "no-dupe-keys": "error", "no-unreachable": "error", "no-redeclare": "error",
  "no-dupe-else-if": "error", "no-self-assign": "error", "no-unsafe-finally": "error", "no-const-assign": "error",
  "no-func-assign": "error", "no-unsafe-negation": "error", "use-isnan": "error", "valid-typeof": "error",
  "no-cond-assign": ["error", "except-parens"], "no-sparse-arrays": "error", "no-compare-neg-zero": "error",
  "getter-return": "error", "no-setter-return": "error", "no-dupe-class-members": "error", "no-unused-labels": "error",
  "no-eval": "error", "no-implied-eval": "error", "no-new-func": "off"
};
export default [
  { ignores: ["node_modules/**", "archive/**", "src/**", "dist/site/**", "dist/test.html"] },
  {
    files: ["dist/bundle.js"],
    languageOptions: {
      ecmaVersion: 2022, sourceType: "script",
      globals: { ...globals.browser, screen: "off", THREE: "readonly", PokiSDK: "readonly", CrazyGames: "readonly", adBreak: "readonly", adConfig: "readonly", sdk: "readonly", claude: "readonly" }
    },
    rules: bugs
  },
  {
    files: ["server/**/*.js", "tests/**/*.js", "eslint.config.mjs"],
    languageOptions: { ecmaVersion: 2022, sourceType: "commonjs", globals: { ...globals.node, ...globals.browser, __ll: "readonly", THREE: "readonly" } },
    rules: { ...bugs, "no-undef": "off" }
  }
];
