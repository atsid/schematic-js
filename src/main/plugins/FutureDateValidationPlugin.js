/**
 * @class schematic-js/FutureDateValidationPlugin
 * Validate that the given field is a date and is in the future.
 */
define([
    "../util"
], function (util) {
    var module = function (config) {
        this.message = {code: 0, message: "Date is not in the future"};
        util.mixin(this, config);

        this.validate = function (property, instance, newValue, schema) {
            var ret = [],
                value = newValue || instance[property],
                date = Date.parse(value),
                now = Date.now();

            if (now >= date) {
                ret.push(this.message);
            }
            return ret.length ? ret : undefined;
        };
    };
    return module;
});
