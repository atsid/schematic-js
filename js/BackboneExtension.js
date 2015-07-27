/**
 * A module that modifies the Backbone global if it exists to add a Backbone.SchematicModel
 * that extends Backbone.Model and adds json schema support.
 */
define([
    './Validator',
    './log'
], function (
    Validator,
    logger
) {

    'use strict';

    var ret, sync;
    // Add a schema-supported backbone model.1234567qwertyuasdfghjzxcvbn
    if (typeof (Backbone) !== 'undefined') {
        sync = Backbone.sync;
        Backbone.sync = function (method, model, options) {
            if (model instanceof Backbone.SchematicModel) {
                logger.debug(method + ' : ' + model + ' : ' + options);
            } else {
                return sync(method, model, options);
            }
        };

        Backbone.SchematicModel = Backbone.Model.extend({

            initialize: function (attributes, options) {
                var that = this,
                    schema = this.jsonschema = (options && options.schema);
                /*
                 * Define known properties based on the schema that delegate to get and set.
                 */
                Object.keys(schema && schema.properties).forEach(function (val, idx, obj) {
                    Object.defineProperty(that, val, {
                        get: function () {
                            return that.get(val);
                        },
                        set: function (value) {
                            return that.set(val, value, {validate: true});
                        },
                        enumerable: true
                    });
                });

            },

            /**
             * Override Backbone model validation method to do valiation
             * based on JSON Schema.
             * @param attributes - specific attributes to validate
             * @param options
             * @return error object
             */
            validate: function (attributes, options) {
                // apply attributes to a temporary model because schema
                // validation needs to apply to the whole model.
                var instance = new Backbone.Model(this.toJSON());
                instance.set(attributes);
                return Validator(this.jsonschema, instance.toJSON(), attributes);
            }

        });
        ret = Backbone.SchematicModel;
    }

    return ret;
});
