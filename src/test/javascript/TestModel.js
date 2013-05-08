require([
    "schematic/ModelFactory",
    "TestData/SimpleTestModelSchema",
    "TestData/EmbeddedSchema",
    "TestData/ExtendedSchema",
    "TestData/BaseSchema"
], function (
    ModelFactory,
    SimpleTestModelSchema,
    EmbeddedSchema,
    ExtendedSchema,
    BaseSchema
) {
        var b;
    
        /**
         * Test the model directly
         */
        b = new TestCase("TestModel", {
    
            setUp: function () {
                this.factory = new ModelFactory();
                this.model = this.factory.getModel(SimpleTestModelSchema);
            },
    
            //Ensures that the model constructor correctly sets the schemaId and
            //that it freezes the object so properties can only be modified using the
            //set() function
            testConstructor: function () {
                var prop = this.model.modelNumber;
                
                assertNotUndefined(this.model);
                assertEquals(this.model.schemaId, SimpleTestModelSchema.id);
                
                //testing that the Model is frozen after creation
                assertException(function () { this.model.modelNumber = "9999"; });
                assertFalse(prop === "9999");
            },
            
            // Test simple set and get for properties
            testSimpleSetGet: function () {
                var prop;
    
                this.model.set("modelNumber", "1234");
                prop = this.model.get("modelNumber");
    
                assertTrue(prop === "1234");
    
            },
    
            // Test natural property access.
            testSimplePropertyAccessors: function () {
                var prop;
    
                this.model.modelNumber = "1234";
                prop = this.model.modelNumber;
    
                assertTrue(prop === "1234");
            },
    
            // Test initialize
            testModelInitialize: function () {
                var model2 = this.factory.getModel(SimpleTestModelSchema);
    
                model2.set("modelNumber", "4567");
                this.model.initialize(model2);
    
                assertEquals("4567", this.model.modelNumber);
            },
    
            // Test serializing a model
            testSerialization: function () {
                var serialized;
    
                this.model.modelNumber = "1234";
                this.model.optionalprop = "optional";
    
                serialized = JSON.stringify(this.model);
                assertEquals("{\"schemaId\":\"TestData/SimpleTestModelSchema\",\"modelNumber\":\"1234\",\"optionalprop\":\"optional\"}", serialized);
            },
    
            // Test serializing a model
            testOptionalSerialization: function () {
                var serialized;
    
                this.model.modelNumber = "1234";
    
                serialized = JSON.stringify(this.model);
                assertEquals("{\"schemaId\":\"TestData/SimpleTestModelSchema\",\"modelNumber\":\"1234\"}", serialized);
            },

            // Test extended Models.
            testExtension: function () {
                var factory = new ModelFactory({
                   resolver: function (name) {
                       if (name.indexOf("ExtendedSchema") > -1) {
                           return ExtendedSchema;
                       } else {
                           return BaseSchema;
                       }
                   }
                }),
                extendedModel = factory.getModelByName("ExtendedSchema");

                extendedModel.modelNumber = "1234";
                assertEquals("1234", extendedModel.modelNumber);
                extendedModel.optionalprop = "optional";
                assertEquals("optional", extendedModel.optionalprop);
                extendedModel.explanation = "explanation";
                assertEquals("explanation", extendedModel.explanation);
                extendedModel.comment = "comment";
                assertEquals("comment", extendedModel.comment);
            },

            // Test embedded Models.
            testEmbedded: function () {
                var factory = new ModelFactory({
                        resolver: function (name) {
                            if (name.indexOf("EmbeddedSchema") > -1) {
                                return EmbeddedSchema;
                            } else if (name.indexOf("BaseSchema") > -1) {
                                return BaseSchema;
                            } else {
                                return SimpleTestModelSchema;
                            }
                        }
                    }),
                    embeddedModel = factory.getModelByName("EmbeddedSchema", undefined, {createSubModels: true});
                assertEquals("TestData/SimpleTestModelSchema", embeddedModel.embedded.schemaId);
            },

            // Test copyFrom operation with another model
            testCopyFromModel: function () {
                var factory = new ModelFactory({
                        resolver: function (name) {
                            if (name.indexOf("EmbeddedSchema") > -1) {
                                return EmbeddedSchema;
                            } else if (name.indexOf("BaseSchema") > -1) {
                                return BaseSchema;
                            } else {
                                return SimpleTestModelSchema;
                            }
                        }
                    }),
                    modelChanged = false,
                    embeddedChanged = false,
                    model = factory.getModelByName("EmbeddedSchema", undefined, {createSubModels: true}),
                    modelCopy = factory.getModelByName("EmbeddedSchema", undefined, {createSubModels: true});

                model.explanation = "Should be over-written";
                modelCopy.explanation = "Should over-write";
                model.embedded.modelNumber = "1111";
                modelCopy.embedded.modelNumber = "2222";

                model.onChange("explanation", function () {
                    modelChanged = true;
                });
                model.embedded.onChange("modelNumber", function () {
                    embeddedChanged = true;
                });

                assertEquals("Should be over-written", model.explanation);
                assertEquals("1111", model.embedded.modelNumber);
                assertFalse(modelChanged);
                assertFalse(embeddedChanged);

                model.copyFrom(modelCopy);

                assertEquals("Should over-write", model.explanation);
                assertEquals("2222", model.embedded.modelNumber);
                assertTrue(modelChanged);
                assertTrue(embeddedChanged);
            },

            // Test copyFrom operation with a simple object
            testCopyFromObject: function () {
                var factory = new ModelFactory({
                        resolver: function (name) {
                            if (name.indexOf("EmbeddedSchema") > -1) {
                                return EmbeddedSchema;
                            } else if (name.indexOf("BaseSchema") > -1) {
                                return BaseSchema;
                            } else {
                                return SimpleTestModelSchema;
                            }
                        }
                    }),
                    modelChanged = false,
                    embeddedChanged = false,
                    model = factory.getModelByName("EmbeddedSchema", undefined, {createSubModels: true}),
                    objectCopy = {
                        modelNumber: "1234",
                        explanation: "It is a model",
                        embedded: {
                            modelNumber: "4321"
                        }
                    };

                model.onChange("explanation", function () {
                    modelChanged = true;
                });
                model.embedded.onChange("modelNumber", function () {
                    embeddedChanged = true;
                });

                assertFalse(modelChanged);
                assertFalse(embeddedChanged);

                model.copyFrom(objectCopy);

                assertEquals("It is a model", model.explanation);
                assertEquals("1234", model.modelNumber);
                assertEquals("4321", model.embedded.modelNumber);
                assertTrue(modelChanged);
                assertTrue(embeddedChanged);
            }
        });
});
