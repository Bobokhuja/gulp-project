module.exports = {
  "extends": ["stylelint-config-standard", "stylelint-config-recess-order"],
  "rules": {
    "at-rule-empty-line-before": null,
    "indentation": 2,
    "at-rule-no-unknown": [true, {
      "ignoreAtRules": ["import", "include", "mixin", "if", "return", "use"]
    }]
  }
};