define([
    'schematic/ModelFactory',
    'TestData/SimpleTestModelSchema',
    'schematic/BackboneExtension'
], function (
    ModelFactory,
    SimpleTestModelSchema
) {

    'use strict';

    describe('BackboneModel', function () {

        var factory, model;

        beforeEach(function () {
            factory = new ModelFactory({
                resolver: function () {
                    return SimpleTestModelSchema;
                }
            });
            model = factory.getModel(SimpleTestModelSchema);
        });
        
        it('model is a Backbone model', function () {

            assert.isDefined(Backbone);
            assert.isDefined(model);
            assert.isTrue((model instanceof Backbone.SchematicModel));
            assert.isTrue(model.isNew());

        });

        it('Backbone model respects schema rules', function () {

            var success = true;

            // should not be able to set an attribute that isn't on the schema
            model.set('noattr', 'shouldntset', {validate: true});
            assert.notEqual('shouldntset', model.get('noattr'));
            assert.isFalse(model.isValid());

            // required attributes should be set before save.
            success = model.save({'noattr': 'shouldntset'}, {
                validate: true
            });
            assert.isFalse(success);

            // should be able to get and set all attributes that are in the
            // schema.
            model.set('modelNumber', '1111');
            assert.equal('1111', model.get('modelNumber'));
            assert.equal('1111', model.modelNumber);

            //direct assignment is disallowed with get/set in place
            model.modelNumber = '2222';
            assert.equal('1111', model.get('modelNumber'));
            assert.equal('1111', model.modelNumber);

            model.set('optionalprop', 'optional');
            assert.equal('optional', model.get('optionalprop'));
            assert.equal('optional', model.optionalprop);

            // shouldn't be able to set longer than 4 chars for modelNumber.
            model.set('modelNumber', '55555', {validate: true});
            assert.notEqual('55555', model.get('modelNumber'));
            model.modelNumber = '55555';
            assert.notEqual('55555', model.modelNumber);

        });

        it('model uses services for save', function () {

            var success = true;

            // should be able to get and set all attributes that are in the
            // schema.
            model.set('modelNumber', '1111');
            assert.equal('1111', model.get('modelNumber'));
            assert.equal('1111', model.modelNumber);

            model.set('optionalprop', 'optional');
            assert.equal('optional', model.get('optionalprop'));
            assert.equal('optional', model.optionalprop);

            // should be able to save...
            success = model.save({'noattr': 'shouldntset'}, {
                validate: true
            });
            assert.isDefined(success);

        });

    });

});
