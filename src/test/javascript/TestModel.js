require(["schematic/ModelFactory", "TestData/SimpleTestModelSchema", "TestData/ExtendedSchema", "TestData/BaseSchema"],
        function (ModelFactory, SimpleTestModelSchema, ExtendedSchema, BaseSchema) {

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
            }
        });

});
