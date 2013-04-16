require([
    "schematic/ModelFactory",
    "schematic/plugins/SchemaValidationPlugin",
    "schematic/plugins/LuhnValidationPlugin",
    "schematic/plugins/RegExpValidationPlugin",
    "schematic/plugins/FutureDateValidationPlugin",
    "TestData/SimpleTestModelSchema",
    "TestData/ExtendedSchema"
], function (
    ModelFactory,
    SchemaValidationPlugin,
    LuhnValidationPlugin,
    RegExpValidationPlugin,
    FutureDateValidationPlugin,
    SimpleTestModelSchema,
    ExtendedModelSchema
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
                    limited = 0,
                    model,
                    validator = {
                        propertyPattern: /.*/,
                        modelPattern: /.*/,
                        validate: function (name, model, newValue, schema) {
                            count += 1;
                        }
                    },
                    limitedValidator = {
                        propertyPattern: /modelNumber/,
                        modelPattern: /.*/,
                        validate: function (name, model, newValue, schema) {
                            limited += 1;
                        }
                    };
                this.factory.addValidator(validator);
                this.factory.addValidator(limitedValidator);
                model = this.factory.getModel(SimpleTestModelSchema);
                model.modelNumber = "12345";
                model.optionalprop = "optional";
                // validator should have been called twice.
                assertEquals(2, count);
                // limitedValidator should have been called only once.
                assertEquals(1, limited);
            },
    
            //Test the SchemaValidatorPlugin validation for required
            testSchemaValidationPluginRequired: function () {
                var model;
                this.factory.addValidator(
                    new SchemaValidationPlugin({
                            propertyPattern: /.*/,
                            modelPattern: /.*/,
                            requiredMessage: {
                                code: 333,
                                message: "Required fool..."
                            }
                        }
                    ));
                model = this.factory.getModel(ExtendedModelSchema);
                // should succeed.
                model.modelNumber = "12345";
                assertEquals("12345", model.modelNumber);
                // should not succeed because model number is required.
                model.modelNumber = "";
                assertEquals("12345", model.modelNumber);
                assertEquals(1, model.lastErrors.length);
                // test validate method directly
                assertEquals(1, model.validate("modelNumber", "").length);
                assertEquals(333, model.validate("modelNumber", "")[0].code);
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

                // should not succeed because credit card number does not pass the Luhn test
                model.creditCardNumber = "1234123412341234";
                assertEquals(model.creditCardNumber, "4111111111111111");
                assertEquals(model.lastErrors.length, 1);

                // should not succeed because credit card number is not numeric
                model.creditCardNumber = "abcd";
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
            },

            //Test the RegexpValidationPlugin
            testFutureDateValidationPlugin: function () {
                var model, ret, date;
                this.factory.addValidator(
                    new FutureDateValidationPlugin({
                            propertyPattern: /.*/,
                            modelPattern: /.*/,
                            message: {code: 12345, message: "failed."}
                        }
                    ));
                model = this.factory.getModel(SimpleTestModelSchema);

                // should succeed.
                date = new Date(
                    new Date().getFullYear() + 1,
                    1,
                    1,
                    0,
                    0,
                    0);
                ret = model.validate("optionalprop", date);
                assertUndefined(ret);

                date = new Date(
                    new Date().getFullYear() - 1,
                    1,
                    1,
                    0,
                    0,
                    0);
                // should not succeed
                ret = model.validate("optionalprop", date);
                assertNotUndefined(ret);
                assertEquals(12345, ret[0].code);
            }
        });
    
    });
