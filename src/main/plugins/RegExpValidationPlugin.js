/**
 * @class schematic-js/RegexpValidationPlugin
 * Plugin to validate a field against a regular expression.
 */
define([
    "../util"
], function (
    util
) {
    var module = function (config) {
        var that = this;
        this.message = {code: 0, message: "Failed regular expression match"};
        util.mixin(this, config);

        this.validate = function (property, instance, newValue, schema) {
            var ret = [], 
                value = newValue === undefined ? instance[property] : newValue,
                regexp = new RegExp(this.pattern || ".*"),
                matchWhenValue = this.requiredWhen ? instance[this.requiredWhen.property] : '',
                matchWhenArray = this.requiredWhen ? this.requiredWhen.values : [''];

            if (util.indexOf(matchWhenValue, matchWhenArray) > -1) {                
                if (value !== "" && !regexp.test(value)) {
                    ret.push(that.message);
                }
            }
            return ret.length ? ret : undefined;
        };
    };
    return module;
});
