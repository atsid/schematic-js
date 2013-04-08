require([
    "schematic/ModelFactory",
    "schematic/plugins/SchemaValidationPlugin",
    "TestData/SimpleTestModelSchema"
], function (
    ModelFactory,
    SchemaValidationPlugin,
    SimpleTestModelSchema
) {
        var b;
    
        /**
         * Test the model directly
         */
        b = new TestCase("TestValidators", {
    
            setUp: function () {
                this.factory = new ModelFactory();
                this.model = this.factory.getModel(SimpleTestModelSchema);
            },

            // test validator plumbing
            testValidatorPlumbing: function () {
                var count = 0,
                    model,
                    validator = {
                    propertyPattern: /.*/,
                    modelPattern: /.*/,
                    validate: function (name, model, newValue, schema) {
                        count += 1;
                    }
                };
                this.factory.addValidator(validator);
                model = this.factory.getModel(SimpleTestModelSchema);
                model.modelNumber = "12345";
                model.optionalprop = "optional";
                // validator should have been called twice.
                assert(count == 2);
            },
    
            //Test the SchemaValidatorPlugin validation for required
            testSchemaValidationPluginRequired: function () {
                var model;
                this.factory.addValidator(
                    new SchemaValidationPlugin({
                            propertyPattern: /.*/,
                            modelPattern: /.*/
                        }
                    ));
                model = this.factory.getModel(SimpleTestModelSchema);
                // should succeed.
                model.modelNumber = "12345";
                assertEquals(model.modelNumber, "12345");
                // should not succeed because model number is required.
                model.modelNumber = "";
                assertEquals(model.modelNumber, "12345");
                assertEquals(model.lastErrors.length, 1);
            }
            
        });
    
    });
