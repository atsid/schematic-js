define([
    "schematic/ModelFactory",
    "TestData/SimpleTestModelSchema"
], function (
    ModelFactory,
    SimpleTestModelSchema
) {

    'use strict';

    describe('ModelFactory', function () {

        var factory;

        beforeEach(function () {
            factory = new ModelFactory({
                resolver: function () {
                    return SimpleTestModelSchema;
                }
            });
        });

        it('get model by name', function () {
            var model = factory.getModel("TestData/SimpleTestModelSchema");
            assert.isDefined(model);
        });

        it('get model by schema instance', function () {
            var model = factory.getModel(SimpleTestModelSchema);
            assert.isDefined(model);
        });

    });

});