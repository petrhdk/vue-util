import antfu from '@antfu/eslint-config';

export default antfu(

  /* options for antu config - https://github.com/antfu/eslint-config */
  {},

  /* override antfu config */
  {
    rules: {
      /* use semicolons at the end of the line */
      'style/semi': ['error', 'always'], // https://eslint.style/rules/js/semi

      /* use single quotes for strings */
      'style/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }], // https://eslint.style/rules/js/quotes

      /* always wrap the arguments of an arrow function in parenthesis */
      'style/arrow-parens': ['error', 'always'], // https://eslint.style/rules/js/arrow-parens

      /* put operators at the end of the former line if there is a line break (especially the `=`) */
      'style/operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }], // https://eslint.style/rules/js/operator-linebreak
      'vue/operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }], // https://eslint.vuejs.org/rules/operator-linebreak.html

      /* allow fully customized use of curly braces and line breaks after 'if', 'else', 'which', 'for', ... */
      'curly': ['off'], // https://eslint.org/docs/latest/rules/curly
      'antfu/if-newline': 'off', // https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/if-newline.md

      /* use commas to delimit properties in typescript object type and interface declarations */
      'style/member-delimiter-style': ['error', { // https://eslint.style/rules/ts/member-delimiter-style
        multiline: {
          delimiter: 'comma',
          requireLast: true,
        },
        singleline: {
          delimiter: 'comma',
          requireLast: false,
        },
      }],

      /* custom code order inside vue setup scripts */
      'vue/define-macros-order': 'off', // https://eslint.vuejs.org/rules/define-macros-order.html

      /* custom structuring of the "class" html attribute in vue templates */
      'vue/prefer-separate-static-class': 'off', // https://eslint.vuejs.org/rules/prefer-separate-static-class.html

      /* allow manipulation of object properties */
      'vue/no-mutating-props': 'off', // https://eslint.vuejs.org/rules/no-mutating-props.html

      /* disable because doesn't behave as expected and has no documentation */
      'antfu/indent-binary-ops': 'off',
    },
  },
);
