/**
 * @class schematic-js/ConditionallyRequiredValidationPlugin
 * Plugin to selectively validate properties against a json schema
 * based on the values of another property in the schema.
 * {
 *    requiredMessage: {code:123, message: "Field required");
 * }
 */
define([
    "../util"
], function (
    util
) {
    var findProperty = function (schema, prop) {
            var ret = schema && schema.properties && schema.properties[prop];
            if (!ret && schema["extends"]) {
                ret = findProperty(schema["extends"], prop);
            }
            return ret;
        },
        module = function (config) {
            var defaultMessage = {code: 0, message: "Fields are not equal"};
            util.mixin(this, config);

            this.validate = function (property, instance, newValue, schema) {
                var ret = [],
                    value = newValue === undefined ? instance[property] : newValue,
                    match = this.match;
                    
                if ((this.matchProperty && value === instance[this.matchProperty]) !== match)  {
                      if (this.message && this.message.message) {
                          ret.push(this.message);
                      }
                      else {
                          ret.push(defaultMessage);          
                      }
                }

                return ret.length ? ret : undefined;
            };
        };
    return module;
});
