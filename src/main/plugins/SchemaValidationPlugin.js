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
    var findProperty = function (schema, prop) {
            var ret = schema && schema.properties && schema.properties[prop];
            if (!ret && schema["extends"]) {
                ret = findProperty(schema["extends"], prop);
            }
            return ret;
        },
        module = function (config) {
            this.requiredMessage = {code: 0, message: "Field is required."};
            this.maxLengthMessage = {code: 0, message: "Field length is greater than max allowable"};
            this.minLengthMessage = {code: 0, message: "Field length is less than minimum required"};
            util.mixin(this, config);

            this.validate = function (property, instance, newValue, schema) {
                var ret = [],
                    value = newValue,
                    schemaProp = findProperty(schema, property);
                // required
                if (schemaProp) {
                    // require check
                    if (schemaProp.required && !value) {
                        ret.push(this.requiredMessage);
                    } else if (value && schemaProp.maximum && (value.length > schemaProp.maximum)) {
                        ret.push(this.maxLengthMessage);
                    } else if (value && schemaProp.minimum && (value.length < schemaProp.minimum)) {
                        ret.push(this.minLengthMessage);
                    }
                }
                return ret.length ? ret : undefined;
            };
            
        };
    return module;
});
