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

    'use strict';

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
                    requiredFields = {},
                    value = newValue,
                    schemaProp = findProperty(schema, property);
                // support v3 required spec
                (schema.required || []).forEach(function (item) {
                    requiredFields[item] = true;
                });
                // required
                if (schemaProp) {
                    // require check
                    if ((schemaProp.required || requiredFields[property]) && !value && schemaProp.type != "boolean") {
                        ret.push(this.requiredMessage);
                    } else if (value && schemaProp.maxLength && (value.length > schemaProp.maxLength)) {
                        ret.push(this.maxLengthMessage);
                    } else if (value && schemaProp.minLength && (value.length < schemaProp.minLength)) {
                        ret.push(this.minLengthMessage);
                    }
                }
                return ret.length ? ret : undefined;
            };
            
        };
    return module;
});
