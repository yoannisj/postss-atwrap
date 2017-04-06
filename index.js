var postcss = require('postcss');

function findStart(endRule, ruleName)
{
  var ruleName = ruleName || endRule.params,
    prev = endRule.prev();

  // loop over previous rules
  while (prev)
  {
    // if previous rule is a '@at-start' rule
    if (prev.type == 'atrule' && prev.name == 'at-start')
    {
      // and matches given '@at-end' rule
      if (prev.params.startsWith(ruleName)) {
        return prev;
      }
    }

    prev = prev.prev();
  }
}

module.exports = postcss.plugin('atwrap', function atwrap(opts) {

  return function(css, res) {

    opts = opts || {};

    css.walkAtRules('at-end', function(endRule) {

      // find matching '@at-start' rule before current '@at-end' rule
      var ruleName = endRule.params,
        startRule = findStart(endRule, ruleName);

      // throw warning and interrupt if no '@at-start' rule was found
      if (startRule === undefined) {
        endRule.warn(res, "Couldn't find '@at-start' rule matching '@at-end' rule.");
        return;
      }

      var parent = endRule.parent,
        wrapped = [];

      // collect sibling rules between '@at-start' and '@at-end'
      parent.each(function(rule) {

        var index = rule.parent.index(rule);
        if (index > startRule.parent.index(startRule) && index < endRule.parent.index(endRule))  {
          // collect rule
          wrapped.push(rule.clone());
          // remove it from parent
          rule.remove();
        }

      });

      // remove ruleName from params given to '@at-start' rule
      var ruleParams = startRule.params.replace( ruleName, '' ).trim(),
        // create new atRule to contain selected children
        atRule = postcss.atRule({
          name: ruleName,
          params: ruleParams
        });

      // add new at-rule to the parent
      parent.insertAfter(endRule, atRule);

      // re-inject wrapped rules
      wrapped.forEach(function(rule) {
        atRule.append(rule);
      });

      // remove old '@at-start' and '@at-end' rules
      startRule.remove();
      endRule.remove();
    });

    return css;

  };

});