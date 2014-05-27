/**
 * @class ModelFactory
 * Factory for creating schema-based models. If Backbone exists, the factory
 * will create a schema-based Backbone model.
 */
define([
    "./log",
    "./SchemaResolver",
    "./BackboneExtension",
    "./util"
], function (
    logger,
    SchemaResolver,
    BackboneModel,
    util
) {

    return function (config) {
        var thisFactory = this,
            validators = [],
            pertinentValidators = function (name) {
                var ret = [];
                validators.forEach(function (val) {
                    if (val.modelPattern.test(name)) {
                        ret.push(val);
                    }
                });
                return ret;
            },
        // internal model wrapper class.
            ModelWrapper = function (schema, obj, validators, options) {

                var basedOn = obj, data = obj || {}, that = this,
                    lastErrors,
                    createSubModels = options && options.createSubModels,
                    propertyCache = {},
                    onchanges = {},
                /*
                 * Validate a .get() call. Ensures requested property is in the schema.
                 * @param string Property name
                 * @param boolean return boolean instead of throw.
                 * @return boolean valid
                 * @throws Property not defined exception
                 * @private
                 */
                    isValidProperty = function (prop, noThrow) {

                        var success = false;
                        if (propertyCache[prop]) {
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
                 *   Adheres to the setting of config.validatedSet by
                 *   by applying all validators if it is truthy
                 * @param string Property name
                 * @param value
                 * @param boolean return boolean instead of throw.
                 * @return boolean validate regardless of configuration.
                 * @throws Property not defined
                 * @throws Invalid type
                 * @private
                 */
                    isValidSet = function (prop, value, noThrow, forceValidation) {

                        var property = propertyCache[prop],
                            lastError,
                            failure = true;

                        logger.debug("Checking if property: " + prop + " is valid to set");
                        // run through validators stopping at first failure
                        if (isValidProperty(prop, noThrow)) {
                            if (thisFactory.config.validatedSet || forceValidation) {
                                logger.debug("Running validators on " + prop);
                                failure = validators.some(function (val, idx, arr) {
                                    if (val.propertyPattern.test(prop)) {
                                        lastError = val.validate(prop, that, value, schema);
                                        return lastError;
                                    }
                                });
                                lastErrors = lastError;
                            } else {
                                failure = false;
                            }
                        }

                        return !failure;
                    },
                    cacheProperties = function (schema, cache) {
                        Object.keys(schema.properties).forEach(function (prop) {
                            if (schema.properties[prop]) {
                                cache[prop] = schema.properties[prop];
                            }
                        });
                    },
                    walkExtends = function (schema, operation) {
                        if (schema["extends"]) {
                            walkExtends(schema["extends"], operation);
                        }
                        operation(schema);
                    };

                // cache properties from all schemas.
                walkExtends(schema, function (schema) {
                    cacheProperties(schema, propertyCache);
                });

                /*
                 * Takes id from schema
                 */
                Object.defineProperty(that, "schemaId", {
                    get: function () {
                        return schema.id;
                    },
                    enumerable: true
                });

                /*
                 * Last Errors is protected and not visible.
                 */
                Object.defineProperty(that, "lastErrors", {
                    get: function () {
                        return lastErrors;
                    },
                    enumerable: false
                });

                /**
                 * Expose the validation meta-data for a property on the schema.
                 * @param prop - the name of the property to set
                 * @returns a copy of the schema properties defined for the model.
                 */
                this.getMeta = function (prop) {
                    if (isValidProperty(prop, false)) {
                        return util.mixin({}, propertyCache[prop]);
                    };
                };
                
                /**
                 * Expose validation function. If prop is undefined
                 *  validate the whole top-level model.
                 * After completion "lastErrors" will contain an object
                 * matching property names to errors.
                 *
                 * @param prop - the name of the property to set
                 * @param value - possible value.
                 * @returns set of errors or undefined
                 */
                this.validate = function (prop, value) {
                    var ret,
                        success = true;
                    if (!prop) {
                        errors = {};
                        Object.keys(propertyCache).forEach(function(key) {
                            logger.debug("Validating " + key + " with " + data[key]);
                            if (!isValidSet(key, data[key], true, true)) {
                                errors[key] = lastErrors;
                                success = false;
                            }
                        });
                        lastErrors = errors;
                    } else {
                        success = isValidSet(prop, value, true, true);
                    }

                    if (!success) {
                        ret = lastErrors;
                    }
                    logger.debug("success is " + success);
                    logger.debug("lastErrors is " + lastErrors);
                    logger.debug("returning " + ret);
                    return ret;
                };

                /*
                 * Returns value for requested property
                 * @param string Property name
                 * @return value for property
                 */
                this.get = function (prop) {
                    var ret, property = propertyCache[prop];
                    if (isValidProperty(prop)) {
                        if (property.type === "array" && basedOn) {
                            ret = [];
                            (data[prop] || []).forEach(function (obj, idx) {
                                if (obj) {
                                    if (typeof obj == "object" && !property.items.type) {
                                        ret.push(thisFactory.getModel(property.items, obj));
                                    } else {
                                        ret.push(obj);
                                    }
                                }
                            }, this);
                        } else {
                            ret = (basedOn && property.type === "object" ? thisFactory.getModel(property, data[prop]) : data[prop]);
                        }
                        return ret;
                    }
                };

                /*
                 * Sets value for requested property
                 * @param string Property name
                 * @param value Value to set
                 * @param opts options
                 * @return boolean success
                 */
                this.set = function (prop, value, opts) {
                    var opts = opts || {};
                    if (isValidSet(prop, value) || opts.ignoreIsValidSet) {
                        if (onchanges[prop]) {
                            onchanges[prop].forEach(function (val, idx, obj) {
                                val(data[prop], value);
                            });
                        }
                        data[prop] = value;
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
                    return data;
                };

                /*
                 * Copy the properties of another model into this model.
                 * @param {object} instance the instance to copy from.
                 * @param {object} options an object like:
                 * {
                 *    shallowModels: "true if sub-models should be copied by reference instead of recursively".
                 * }
                 */
                this.copyFrom = function (instance, options) {
                    var opts = options || {};
                    Object.keys(instance).forEach(function (val, idx, obj) {
                        var anotherModel;
                        if (instance[val]) {
                            var schemaid = instance[val].schemaId || (that[val] && that[val].schemaId);
                            if (schemaid) {
                                anotherModel = that[val];
                                if (!opts.shallowModels) {
                                    if (!anotherModel) {
                                        anotherModel = thisFactory.getModel(schemaid);
                                    }
                                    anotherModel.copyFrom(instance[val], options);
                                }
                                that.set(val, anotherModel);
                            } else {
                                if (isValidSet(val, instance[val], true) || opts.ignoreIsValidSet) {
                                    that.set(val, JSON.parse(JSON.stringify(instance[val])), opts);
                                }
                            }
                        }
                    });
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
                                if (isValidSet(val, instance[val], true)) {
                                    that.set(val, JSON.parse(JSON.stringify(instance[val])));
                                }
                            }
                        }
                    });
                };

                /*
                 * Define known properties that delegate to get and set and
                 * Create models for properties that are defined by a model.
                 */
                Object.keys(propertyCache).forEach(function (val, idx, obj) {
                    Object.defineProperty(that, val, {
                        get: function () {
                            return that.get(val);
                        },
                        set: function (value) {
                            return that.set(val, value);
                        },
                        enumerable: true
                    });
                    if (propertyCache[val].id && createSubModels) {// schema define property
                        that.set(val, thisFactory.getModel(propertyCache[val].id));
                    }
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
                        if (typeof Obj === 'function') {
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
         * @param {Object} options additional model creation options.
         */
        this.getModelBySchema = function (schema, obj, options) {
            var model;
            logger.debug("Getting new model with schema ID: " + schema.id);
            if (typeof BackboneModel === "function") {
                model = new BackboneModel(obj, {
                    validate: true,
                    'schema': schema,
                    serviceFactory: this.config.serviceFactory
                });
            } else {
                model = new ModelWrapper(schema, obj, pertinentValidators(schema.id), options);
            }
            return model;
        };

        /**
         * Retrieve an empty model by name or schema.
         * @param {Object|String} model the schema object or name recognized by the
         * configured resolver to base the creation on.
         * @param {Object} obj an object to use as a basis instead of an empty object.
         * @param {Object} options additional model creation options.
         */
        this.getModel = function (model, obj, options) {
            var ret;
            if (typeof model === 'string') {
                ret = this.getModelByName(model, obj, options);
            } else {
                ret = this.getModelBySchema(model, obj, options);
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
         * Add a validator plugin for models generated by this
         * factory.
         * @param validator
         * @returns {*}
         */
        this.addValidator = function (validator) {
            validators.push(validator);
        };

        /**
         * Retrieve an empty model by name using the configured resolver.
         * @param {String} name the name of the model as understood by the resolver.
         * @param {Object} obj an object to use as a basis instead of an empty object.
         * @param {Object} options additional creation options.
         */
        this.getModelByName = function (name, obj, options) {
            var schema = this.getSchema(name);
            logger.debug("Getting new model by name: " + name + " using schema: " + schema);
            return this.getModelBySchema(schema, obj, options);
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
