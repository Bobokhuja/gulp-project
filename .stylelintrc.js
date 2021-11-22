module.exports = {
  "extends": ["stylelint-config-standard", "stylelint-config-recess-order"],
  "rules": {
    "at-rule-empty-line-before": null,
    "no-invalid-position-at-import-rule": null,
    "selector-class-pattern": null,
    "indentation": 2,
    "at-rule-no-unknown": [true, {
      "ignoreAtRules": ["import", "include", "mixin", "if", "return", "use"]
    }]
  }
};
