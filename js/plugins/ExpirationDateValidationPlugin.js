/**
 * @class schematic-js/ExpirationDateValidationPlugin
 * Validate that the given field is a date and hasn't expired.
 * Added minMatch configuration 
 */
define([
    '../util'
], function (
    util
) {

    'use strict';

    var module = function (config) {
        this.message = {code: 0, message: 'Expiration date has expired'};
        util.mixin(this, config);

        this.validate = function (property, instance, newValue, schema) {
            var ret = [],
                value = newValue === undefined ? instance[property] : newValue,
                date = new Date(value),
                now = new Date(),
                expMonth = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth().toString(),
                nowMonth = now.getMonth() < 10 ? '0' + now.getMonth() : now.getMonth().toString(),
                expInt = parseInt(date.getFullYear().toString() + expMonth),
                nowInt = parseInt(now.getFullYear().toString() + nowMonth);

            if (nowInt > expInt) {
                ret.push(this.message);
            }

            return ret.length ? ret : undefined;
        };
    };
    return module;
});
