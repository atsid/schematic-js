define([
    'schematic/ModelFactory',
    'TestData/SimpleTestModelSchema',
    'TestData/EmbeddedSchema',
    'TestData/ExtendedSchema',
    'TestData/BaseSchema'
], function (
    ModelFactory,
    SimpleTestModelSchema,
    EmbeddedSchema,
    ExtendedSchema,
    BaseSchema
) {

    'use strict';

    describe('Model', function () {

        var factory, model;

        beforeEach(function () {
            factory = new ModelFactory({
                resolver: function () {
                    return SimpleTestModelSchema;
                },
                ignoreBackbone: true
            });
            model = factory.getModel(SimpleTestModelSchema);
        });

        it('constructor sets schemaId and freezes the object properties', function () {

            var prop = model.modelNumber;

            assert.isDefined(model);
            assert.equal(model.schemaId, SimpleTestModelSchema.id);

            //testing that the Model is frozen after creation
            assert.throws(function () { model.modelNumber = '9999'; }, 'Attempted to assign to readonly property.');
            assert.isFalse(prop === '9999');

        });

        it('setter/getter', function () {

            model.set('modelNumber', '1234');
            var prop = model.get('modelNumber');

            assert.equal('1234', prop);
        });

        it('property accessors', function () {

            model.modelNumber = '1234';
            var prop = model.modelNumber;

            assert.equal('1234', prop);
        });

        it('initialize method uses existing model as template', function () {

            var model2 = factory.getModel(SimpleTestModelSchema);

            model2.set('modelNumber', '4567');
            model.initialize(model2);

            assert.equal('4567', model.modelNumber);
        });

        it('serialized model (JSON.stringify) contains expected properties from schema', function () {

            model.modelNumber = '1234';
            model.optionalprop = 'optional';

            var serialized = JSON.stringify(model);
            assert.equal('{\'schemaId\':\'TestData/SimpleTestModelSchema\',\'modelNumber\':\'1234\',\'optionalprop\':\'optional\'}', serialized);

        });

        it('serialized model leaves out unset optional properties', function () {

            model.modelNumber = '1234';

            var serialized = JSON.stringify(model);
            assert.equal('{\'schemaId\':\'TestData/SimpleTestModelSchema\',\'modelNumber\':\'1234\'}', serialized);

        });

        it('schema extension includes new properties', function () {

            var factory = new ModelFactory({
                    resolver: function (name) {
                        if (name.indexOf('ExtendedSchema') > -1) {
                            return ExtendedSchema;
                        } else {
                            return BaseSchema;
                        }
                    },
                    ignoreBackbone: true
                }),
                extendedModel = factory.getModelByName('ExtendedSchema');

            extendedModel.modelNumber = '1234';
            assert.equal('1234', extendedModel.modelNumber);
            extendedModel.optionalprop = 'optional';
            assert.equal('optional', extendedModel.optionalprop);
            extendedModel.explanation = 'explanation';
            assert.equal('explanation', extendedModel.explanation);
            extendedModel.comment = 'comment';
            assert.equal('comment', extendedModel.comment);
            
        });

        it('embedded models are correctly created within schemas', function () {

            var factory = new ModelFactory({
                    resolver: function (name) {
                        if (name.indexOf('EmbeddedSchema') > -1) {
                            return EmbeddedSchema;
                        } else if (name.indexOf('BaseSchema') > -1) {
                            return BaseSchema;
                        } else {
                            return SimpleTestModelSchema;
                        }
                    },
                    ignoreBackbone: true
                }),
                embeddedModel = factory.getModelByName('EmbeddedSchema', undefined, {createSubModels: true});

            assert.equal('TestData/SimpleTestModelSchema', embeddedModel.embedded.schemaId);

        });

        it('copyFrom model operation replicates across models', function () {

            var factory = new ModelFactory({
                    resolver: function (name) {
                        if (name.indexOf('EmbeddedSchema') > -1) {
                            return EmbeddedSchema;
                        } else if (name.indexOf('BaseSchema') > -1) {
                            return BaseSchema;
                        } else {
                            return SimpleTestModelSchema;
                        }
                    },
                    ignoreBackbone: true
                }),
                modelChanged = false,
                embeddedChanged = false,
                model = factory.getModelByName('EmbeddedSchema', undefined, {createSubModels: true}),
                modelCopy = factory.getModelByName('EmbeddedSchema', undefined, {createSubModels: true});

            model.explanation = 'Should be over-written';
            modelCopy.explanation = 'Should over-write';
            model.embedded.modelNumber = '1111';
            modelCopy.embedded.modelNumber = '2222';

            model.onChange('explanation', function () {
                modelChanged = true;
            });
            model.embedded.onChange('modelNumber', function () {
                embeddedChanged = true;
            });

            assert.equal('Should be over-written', model.explanation);
            assert.equal('1111', model.embedded.modelNumber);
            assert.isFalse(modelChanged);
            assert.isFalse(embeddedChanged);

            model.copyFrom(modelCopy);

            assert.equal('Should over-write', model.explanation);
            assert.equal('2222', model.embedded.modelNumber);
            assert.isTrue(modelChanged);
            assert.isTrue(embeddedChanged);

        });

        it('copyFrom object operations replicates to new model', function () {

            var factory = new ModelFactory({
                    resolver: function (name) {
                        if (name.indexOf('EmbeddedSchema') > -1) {
                            return EmbeddedSchema;
                        } else if (name.indexOf('BaseSchema') > -1) {
                            return BaseSchema;
                        } else {
                            return SimpleTestModelSchema;
                        }
                    },
                    ignoreBackbone: true
                }),
                modelChanged = false,
                embeddedChanged = false,
                model = factory.getModelByName('EmbeddedSchema', undefined, {createSubModels: true}),
                objectCopy = {
                    modelNumber: '1234',
                    explanation: 'It is a model',
                    embedded: {
                        modelNumber: '4321'
                    }
                };

            model.onChange('explanation', function () {
                modelChanged = true;
            });
            model.embedded.onChange('modelNumber', function () {
                embeddedChanged = true;
            });

            assert.isFalse(modelChanged);
            assert.isFalse(embeddedChanged);

            model.copyFrom(objectCopy);

            assert.equal('It is a model', model.explanation);
            assert.equal('1234', model.modelNumber);
            assert.equal('4321', model.embedded.modelNumber);
            assert.isTrue(modelChanged);
            assert.isTrue(embeddedChanged);

        });

    });

});
