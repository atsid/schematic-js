/**
 * @class schematic-js/ConditionallyRequiredValidationPlugin
 * Plugin to selectively validate properties against a json schema
 * based on the values of another property in the schema.
 * {
 *    requiredMessage: {code:123, message: 'Field required');
 * }
 */
define([
    '../util'
], function (
    util
) {

    'use strict';

    var findProperty = function (schema, prop) {
            var ret = schema && schema.properties && schema.properties[prop];
            if (!ret && schema['extends']) {
                ret = findProperty(schema['extends'], prop);
            }
            return ret;
        },
        module = function (config) {
            var defaultMessage = {code: 0, message: 'Field is required.'};
            util.mixin(this, config);


            this.validate = function (property, instance, newValue, schema) {
                var ret = [],
                    value = newValue,
                    schemaProp = findProperty(schema, property),
                    reqWhenValue = instance[this.requiredWhen.property],
                    reqWhenArray = this.requiredWhen.values || [];

                if (util.indexOf(reqWhenValue, reqWhenArray) > -1) {
                    if (schemaProp && !value) {
                        if (this.message && this.message.message) {
                            ret.push(this.message);
                        }
                        else {
                            ret.push(defaultMessage);          
                        }
                    }
                }
                return ret.length ? ret : undefined;
            };
        };
    return module;
});
