define([
    'schematic/ModelFactory',
    'schematic/plugins/SchemaValidationPlugin',
    'schematic/plugins/LuhnValidationPlugin',
    'schematic/plugins/RegExpValidationPlugin',
    'schematic/plugins/FutureDateValidationPlugin',
    'TestData/SimpleTestModelSchema',
    'TestData/ExtendedSchema',
    'TestData/BaseSchema'
], function (
    ModelFactory,
    SchemaValidationPlugin,
    LuhnValidationPlugin,
    RegExpValidationPlugin,
    FutureDateValidationPlugin,
    SimpleTestModelSchema,
    ExtendedModelSchema,
    BaseSchema
) {

    'use strict';

    describe('validators', function () {

        var factory;

        beforeEach(function () {
            factory = new ModelFactory({
                resolver: function (name) {
                    if (name.indexOf('ExtendedSchema') > -1) {
                        return ExtendedModelSchema;
                    } else if (name.indexOf('BaseSchema') > -1) {
                        return BaseSchema;
                    } else {
                        return SimpleTestModelSchema;
                    }
                },
                ignoreBackbone: true,
                validatedSet: true
            });
        });

        describe('validator execution matching', function () {

            it('validators get injected properly by factory', function () {

                var count = 0,
                    limited = 0,
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
                    },
                    model;

                factory.addValidator(validator);
                factory.addValidator(limitedValidator);

                model = factory.getModel(SimpleTestModelSchema);
                model.set('modelNumber', '12345');
                model.set('optionalprop', 'optional');

                // validator should have been called twice.
                assert.equal(2, count);
                // limitedValidator should have been called only once.
                assert.equal(1, limited);

            });

        });

        describe('SchemaValidationPlugin', function () {

            it('property requirements are enforced', function () {

                factory.addValidator(
                    new SchemaValidationPlugin({
                        propertyPattern: /.*/,
                        modelPattern: /.*/,
                        requiredMessage: {
                            code: 333,
                            message: 'Required fool...'
                        }
                    })
                );

                var model = factory.getModel(ExtendedModelSchema);
                // should succeed.
                model.set('modelNumber', '1234');
                assert.equal('1234', model.modelNumber);
                // should not succeed because model number is required.
                model.set('modelNumber', '');
                assert.equal('1234', model.modelNumber);
                assert.equal(1, model.lastErrors.length);
                // test validate method directly
                assert.equal(1, model.validate('modelNumber', '').length);
                assert.equal(333, model.validate('modelNumber', '')[0].code);

            });

        });

        describe('LuhnValidationPlugin', function () {

            it('property requirements are enforced', function () {

                factory.addValidator(
                    new LuhnValidationPlugin({
                        propertyPattern: /.*/,
                        modelPattern: /.*/
                    })
                );

                var model = factory.getModel(SimpleTestModelSchema);

                // should succeed.
                model.set('creditCardNumber', '4111111111111111');
                assert.equal(model.creditCardNumber, '4111111111111111');

                // should not succeed because credit card number does not pass the Luhn test
                model.set('creditCardNumber', '1234123412341234');
                assert.equal(model.creditCardNumber, '4111111111111111');
                assert.equal(model.lastErrors.length, 1);

                // should not succeed because credit card number is not numeric
                model.set('creditCardNumber', 'abcd');
                assert.equal(model.creditCardNumber, '4111111111111111');
                assert.equal(model.lastErrors.length, 1);

            });

        });

        describe('RegexpValidationPlugin', function () {

            it('property requirements are enforced', function () {

                factory.addValidator(
                    new RegExpValidationPlugin({
                        propertyPattern: /.*/,
                        modelPattern: /.*/,
                        pattern: /^[\d]*$/,
                        message: {code: 12345, message: 'failed.'}
                    })
                );

                var model = factory.getModel(SimpleTestModelSchema),
                    ret = model.validate('creditCardNumber', '1234567');

                assert.isUndefined(ret);

                // should not succeed because credit card number is not valid
                ret = model.validate('creditCardNumber', '1234567A');
                assert.isDefined(ret);
                assert.equal(12345, ret[0].code);

            });

        });

        describe('FutureDateValidationPlugin', function () {

            it('property requirements are enforced', function () {

                var model, ret, date;
                factory.addValidator(
                    new FutureDateValidationPlugin({
                        propertyPattern: /.*/,
                        modelPattern: /.*/,
                        message: {code: 12345, message: 'failed.'}
                    })
                );
                model = factory.getModel(SimpleTestModelSchema);

                // should succeed.
                date = new Date(
                    new Date().getFullYear() + 1,
                    1,
                    1,
                    0,
                    0,
                    0);

                ret = model.validate('optionalprop', date);

                assert.isUndefined(ret);

                date = new Date(
                    new Date().getFullYear() - 1,
                    1,
                    1,
                    0,
                    0,
                    0);

                // should not succeed
                ret = model.validate('optionalprop', date);
                assert.isDefined(ret);
                assert.equal(12345, ret[0].code);

            });

        });

    });

});
