define([
    "./Validator"
], function (
    Validator
) {
    var ret;
    // Add a schema-supported backbone model.
    if (typeof (Backbone) !== 'undefined') {
        Backbone.SchematicModel = Backbone.Model.extend({

            initialize: function (attributes, options) {
                var that = this,
                    schema = this.jsonschema = (options && options.schema);
                /*
                 * Define known properties that delegate to get and set.
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
