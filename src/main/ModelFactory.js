/**
 * @class ModelFactory
 * Factory for creating schema-based models. If Backbone exists, the factory
 * will create a schema-based Backbone model.
 */
define([
    "./Logger",
    "./SchemaResolver",
    "./BackboneExtension"
], function (
    Logger,
    SchemaResolver,
    BackboneModel
) {

    var logger = new Logger("debug");

    return function (config) {
        var thisFactory = this,
            onchanges = {},
        // internal model wrapper class.
            ModelWrapper = function (schema, obj) {

                var basedOn = obj, _data = obj || {}, that = this, i, getF, setF,
                /*
                 * Validate a .get() call. Ensures requested property is in the schema.
                 * @param string Property name
                 * @param boolean return boolean instead of throw.
                 * @return boolean valid
                 * @throws Property not defined exception
                 * @private
                 */
                    _isValidProperty = function (prop, noThrow) {

                        var success = false;
                        if (schema.properties[prop]) {
                            logger.debug("schema: " + schema.id + " contains property: " + prop);
                            success = true;
                        } else {
                            logger.debug("schema: " + schema.id + " does not contain property: " + prop);
                            if (!noThrow) {
                                throw new Error(prop + " not defined in  " + schema.id);
                            }
                        }
                        return success;
                    },

                /*
                 * Validate a .set() call. Ensures set property is valid.
                 * @param string Property name
                 * @param value
                 * @param boolean return boolean instead of throw.
                 * @return boolean valid
                 * @throws Property not defined
                 * @throws Invalid type
                 * @private
                 */
                    _isValidSet = function (prop, value, noThrow) {

                        var property = schema.properties[prop],
                            success = false;

                        logger.debug("Checking if property: " + prop + " is valid to set");
                        if (_isValidProperty(prop, noThrow)) {
                            if (value.schemaId) {//another model object
                                logger.debug("The value has a defined schema ID: " + value.schemaId);
                                success = value.schemaId === property.schemaId;
                            } else if (typeof value === property.type) {                                    //string/boolean/number
                                logger.debug("The value matches property type: " + property.type);
                                success = true;
                            } else if (typeof value === "object") {                                         //array
                                logger.debug("Value is an object, checking if type is array...");
                                success = value.length && property.type === "array";
                            } else if (typeof value === "number" && value % 1 === 0) {                      //integer
                                logger.debug("Value is an integer, checking if property type is integer..");
                                success = property.type === "integer";
                            } else if (!noThrow) {
                                throw new Error("Expected '" + (property.schemaId || property.type) +
                                    "' but received '" + (value.schemaId || typeof value) +
                                    "' for ModelObject '" + schema.id + "'");
                            }
                        }

                        return success;
                    };

                /*
                 * Takes id from schema
                 */
                this.schemaId = schema.id;

                /*
                 * Returns value for requested property
                 * @param string Property name
                 * @return value for property
                 */
                this.get = function (prop) {
                    var ret, property = schema.properties[prop];
                    if (_isValidProperty(prop)) {
                        if (property.type === "array" && basedOn) {
                            ret = [];
                            _data[prop].forEach(function (obj, idx) {
                                if (obj) {
                                    ret.push(thisFactory.getModel(property.items, obj));
                                }
                            }, this);
                        } else {
                            if (_data[prop]) {
                                ret = (basedOn && property.type === "object" ? thisFactory.getModel(property, _data[prop]) : _data[prop]);
                            }
                        }
                        return ret;
                    }
                };

                /*
                 * Sets value for requested property
                 * @param string Property name
                 * @param value Value to set
                 * @return boolean success
                 */
                this.set = function (prop, value) {
                    if (_isValidSet(prop, value)) {
                        onchanges[prop] && onchanges[prop].forEach(function (val, idx, obj) {
                            val(_data[prop], value);
                        });
                        _data[prop] = value;
                        return true;
                    }
                };

                this.onChange = function (field, callback) {
                    if (!onchanges[field]) {
                        onchanges[field] = [];
                    }
                    onchanges[field].push(callback);
                };

                /*
                 * Get raw JS data object recursively
                 * @return {object} raw JS data.
                 */
                this.getRaw = function () {
                    return _data;
                };

                /*
                 * Initialize this model with the passed instance.
                 * If a property on the instance refers to another model, then an new model
                 * is created and initialized with that model. All other valid properties are cloned.
                 * @param {object} instance the instance to initialize from.
                 */
                this.initialize = function (instance) {
                    Object.keys(instance).forEach(function (val, idx, obj) {
                        var anotherModel;
                        if (instance[val]) {
                            if (instance[val].schemaId) {
                                logger.debug("Getting and initializing model with schema ID: " + instance[val].schemaId);
                                anotherModel = thisFactory.getModel(instance[val].schemaId);
                                anotherModel.initialize(instance[val]);
                                that.set(val, anotherModel);
                            } else {
                                if (_isValidSet(val, instance[val], true)) {
                                    that.set(val, JSON.parse(JSON.stringify(instance[val])));
                                }
                            }
                        }
                    });
                };

                /*
                 * Define known properties that delegate to get and set.
                 */
                Object.keys(schema.properties).forEach(function (val, idx, obj) {
                    Object.defineProperty(that, val, {
                        get: function () {
                            return that.get(val);
                        },
                        set: function (value) {
                            return that.set(val, value);
                        },
                        enumerable: true
                    });
                });

                /*
                 * Freezes itself to prevent modification to ModelObject without using get/set.
                 */
                return Object.freeze(this);
            };

        this.config = config || {
            resolver: function (modelName) {
                var ret;
                require([modelName], function (Obj) {
                    if (Obj) {
                        if (typeof (Obj) === 'function') {
                            ret = new Obj();
                        } else {
                            ret = Obj;
                        }
                    }
                });
                return ret;
            }
        };

        this.resolvers = [this.config.resolver];

        this.addResolver = function (newResolver) {
            this.resolvers.push(newResolver);
        };

        /**
         * Retrieve an empty model based on the passed schema.
         * @param {Object} schema the schema object to base the creation on.
         * @param {Object} obj an object to use as a basis instead of an empty object.
         */
        this.getModelBySchema = function (schema, obj) {
            var model;
            logger.debug("Getting new model with schema ID: " + schema.id);
            if (typeof BackboneModel === "function") {
                model = new BackboneModel(obj, {
                    validate: true,
                    'schema': schema,
                    serviceFactory: this.config.serviceFactory
                });
            } else {
                model = new ModelWrapper(schema, obj);
            }
            return model;
        };

        /**
         * Retrieve an empty model by name or schema.
         * @param {Object|String} model the schema object or name recognized by the
         * configured resolver to base the creation on.
         * @param {Object} obj an object to use as a basis instead of an empty object.
         */
        this.getModel = function (model, obj) {
            var ret;
            if (typeof (model) === 'string') {
                ret = this.getModelByName(model, obj);
            } else {
                ret = this.getModelBySchema(model, obj);
            }
            return ret;
        };

        /**
         * Retrieve a fully resolved schema using configured name resolvers
         * and schema ref resolver.
         * @param name - the name of the schema.
         * @return the loaded schema.
         */
        this.getSchema = function (name) {
            var schema, refResolver = new SchemaResolver(this.resolvers);
            this.resolvers.some(function (res) {
                schema = res(name);
                return schema;
            });
            refResolver.resolveRefs(schema, null, null);
            return schema;
        };

        /**
         * Retrieve an empty model by name using the configured resolver.
         * @param {String} name the name of the model as understood by the resolver.
         * @param {Object} obj an object to use as a basis instead of an empty object.
         */
        this.getModelByName = function (name, obj) {
            var schema = this.getSchema(name);
            logger.debug("Getting new model by name: " + name + " using schema: " + schema);
            //return new ModelWrapper(schema, obj);
            return this.getModelBySchema(schema, obj);
        };

        /**
         * Retrieve a model initialized by a passed instance.
         * @param {Object} instance the instance to initialize the new model with.
         * @param {String|Object} model (optional) the name or schema of the model to create.
         */
        this.getModelInitialized = function (instance, model) {
            var newModel;
            if (instance.schemaId) {
                newModel = this.getModel(instance.schemaId);
            } else {
                newModel = this.getModel(model);
            }
            logger.debug("Initializing new model with schema ID: " + newModel.schemaId);
            newModel.initialize(instance);
            return newModel;
        };
    };
});