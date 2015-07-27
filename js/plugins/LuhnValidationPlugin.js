/**
 * @class schematic-js/LuhnValidationPlugin
 * Plugin to validate a number using the Luhn algorithm.
 */
define([
    '../util'
], function (
    util
) {

    'use strict';

    var module = function (config) {

        this.message = {code: 0, message: 'Invalid number'};
        util.mixin(this, config);

        function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        this.validate = function (property, instance, newValue, schema) {
            var ret = [], 
                value = newValue === undefined ? instance[property] : newValue,
                sum = 0,
                numdigits = value && value.length,
                parity = numdigits % 2,
                i,
                digit;

            if (value && isNumeric(value)) {
                for (i = 0; i < numdigits; i += 1) {
                    digit = parseInt(value.charAt(i), 10);
                    if (i % 2 === parity) {
                        digit *= 2;
                    }
                    if (digit > 9) {
                        digit -= 9;
                    }
                    sum += digit;
                }
                if ((sum % 10) !== 0) {
                    ret.push(this.message);
                }
            } else {
                ret.push(this.message);
            }
            return ret.length ? ret : undefined;
        };
    };
    return module;
});
