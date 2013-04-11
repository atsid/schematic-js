/**
 * @class schematic-js/LuhnValidationPlugin
 * Plugin to validate a number using the Luhn algorithm.
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
                sum = 0,
                numdigits = value.length,
                parity = numdigits % 2,
                i,
                digit;

            if (value && isNumeric(value)) {
                for(i = 0; i < numdigits; i += 1) {
                    digit = parseInt(value.charAt(i));
                    if(i % 2 == parity) digit *= 2;
                    if(digit > 9) {
                        digit -= 9;
                    }
                    sum += digit;
                }
                if ((sum % 10) !== 0) {
                    ret.push(this.message);
                }
            } else {
                ret.push("Property " + property + " is invalid");
            }
            return ret.length ? ret : undefined;
        }

        function isNumeric (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
    };
    return module;
});
