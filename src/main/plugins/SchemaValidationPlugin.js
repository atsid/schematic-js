/**
 * @class schematic-js/SchemaValidationPlugin
 * Plugin to selectively validate properties against a json schema.
 * {
 *    requiredMessage: {code:123, message: "Field required");
 * }
 */
define([
    "../util"
], function (
    util
     ) {
    var module = function (config) {
        this.requiredMessage = {code: 0, message: "Field is required."};
        util.mixin(this, config);

        this.validate = function (property, instance, newValue, schema) {
            var ret = [], value = newValue || instance[property],
                schemaProp = schema && schema.properties && schema.properties[property];
            // required
            if (schemaProp) {
                // require check
                if (schemaProp.required && !value) {
                    ret.push(this.requiredMessage);
                }
            }
            return ret.length ? ret : undefined;
        };
    };
    return module;
});
