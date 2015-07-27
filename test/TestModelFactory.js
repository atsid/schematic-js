define([
    'schematic/ModelFactory',
    'schematic/plugins/SchemaValidationPlugin',
    'TestData/BaseSchema',
    'TestData/SimpleTestModelSchema'
], function (
    ModelFactory,
    SchemaValidationPlugin,
    BaseSchema,
    SimpleTestModelSchema
) {

    'use strict';

    describe('ModelFactory', function () {

        describe('get models', function () {

            var factory;

            beforeEach(function () {
                factory = new ModelFactory({
                    resolver: function () {
                        return SimpleTestModelSchema;
                    }
                });
            });

            it('get model by name', function () {
                var model = factory.getModel('TestData/SimpleTestModelSchema');
                assert.isDefined(model);
            });

            it('get model by schema instance', function () {
                var model = factory.getModel(SimpleTestModelSchema);
                assert.isDefined(model);
            });

        });
        
        describe('validate models', function () {

            var factory, model;

            beforeEach(function () {
                factory = new ModelFactory();
                factory.addValidator(new SchemaValidationPlugin({
                    propertyPattern: /.*/,
                    modelPattern: /.*/
                }));
                model = factory.getModel(BaseSchema);
            });

            it('can return a model based on a schema.', function () {
                model.set('modelNumber', '1234');
                assert.equal('1234', model.modelNumber);
            });

            it('allows unvalidated set by default', function () {
                model.set('modelNumber', '12345678');
                assert.equal('12345678', model.modelNumber);
            });

            it('can be configured to disallow "set" based on validation.', function () {
                factory = new ModelFactory({
                    validatedSet: true
                });
                factory.addValidator(new SchemaValidationPlugin({
                    propertyPattern: /.*/,
                    modelPattern: /.*/
                }));
                model = factory.getModel(BaseSchema);
                model.set('modelNumber', '1234');
                assert.equal('1234', model.modelNumber);
                model.set('modelNumber', '12345678');
                assert.equal('1234', model.modelNumber);
            });

            it('allows explicit validation of the entire model', function () {
                model.set('modelNumber', '12345678');
                assert.equal('12345678', model.modelNumber);
                model.validate();
                assert.isDefined(model.lastErrors.modelNumber);
            });
            
        });
        
    });



});