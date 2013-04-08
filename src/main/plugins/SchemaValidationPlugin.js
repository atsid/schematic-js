/**
 * @class schematic-js/SchemaValidationPlugin
 * Plugin to selectively validate properties against a json schema.
 */
define([
    "../util"
], function (
    util
     ) {
    var module = function (config) {
        util.mixin(this, config);

        this.validate = function (property, instance, newValue, schema) {
            var ret = [], value = newValue || instance[property],
                schemaProp = schema && schema.properties && schema.properties[property];
            // required
            if (schemaProp) {
                // require check
                if (schemaProp.required && !value) {
                    ret.push("Property " + property + " is require");
                }
            }
            return ret.length ? ret : undefined;
        }
    };
    return module;
});
