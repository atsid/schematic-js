define([
    'external/validate'
], function (
    Validator
) {

    'use strict';

    /**
     * Validation function for use with schematic. The module can be remapped
     * to a custom validator. The method returns an error object.
     * @param schema the schema to validate against.
     * @param instance the instance to validate.
     * @param properties the set of properties to limit validation to.
     */
    return function (schema, instance, properties) {
        var ret = Validator.validate(instance, schema);
        if (ret && ret.valid) {
            ret = undefined;
        }
        return ret;
    };
});