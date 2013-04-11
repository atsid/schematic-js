require([
    "schematic/ModelFactory",
    "schematic/plugins/SchemaValidationPlugin",
    "schematic/plugins/LuhnValidationPlugin",
    "schematic/plugins/RegExpValidationPlugin",
    "TestData/SimpleTestModelSchema"
], function (
    ModelFactory,
    SchemaValidationPlugin,
    LuhnValidationPlugin,
    RegExpValidationPlugin,
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
                // test validate method direclty
                assertEquals(1, model.validate("modelNumber", "").length);
            },

            //Test the LuhnValidationPlugin
            testLuhnValidationPlugin: function () {
                var model;
                this.factory.addValidator(
                    new LuhnValidationPlugin({
                            propertyPattern: /.*/,
                            modelPattern: /.*/
                        }
                    ));
                model = this.factory.getModel(SimpleTestModelSchema);
                // should succeed.
                model.creditCardNumber = "4111111111111111";
                assertEquals(model.creditCardNumber, "4111111111111111");
                // should not succeed because credit card number is not valid
                model.creditCardNumber = "1234123412341234";
                assertEquals(model.creditCardNumber, "4111111111111111");
                assertEquals(model.lastErrors.length, 1);
            },

            //Test the RegexpValidationPlugin
            testRegexpValidationPlugin: function () {
                var model, ret;
                this.factory.addValidator(
                    new RegExpValidationPlugin({
                            propertyPattern: /.*/,
                            modelPattern: /.*/,
                            pattern: /^[\d]*$/,
                            message: {code: 12345, message: "failed."}
                        }
                    ));
                model = this.factory.getModel(SimpleTestModelSchema);
                // should succeed.
                ret = model.validate("creditCardNumber", "1234567");
                assertUndefined(ret);

                // should not succeed because credit card number is not valid
                ret = model.validate("creditCardNumber", "1234567A");
                assertNotUndefined(ret);
                assertEquals(12345, ret[0].code);
            }
        });
    
    });
