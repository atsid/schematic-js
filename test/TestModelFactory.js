define([
    "schematic/ModelFactory",
    "TestData/SimpleTestModelSchema"
], function (
    ModelFactory,
    SimpleTestModelSchema
) {

    'use strict';

    var b;

    /**
     * Test the model factory
     */
    b = new TestCase("TestModelFactory", {

        setUp: function () {
            this.factory = new ModelFactory({
                resolver: function () {
                    return SimpleTestModelSchema;
                }
            });
        },

        //Ensures that the getModel() function from ModelFactory will return
        //a model when passed a string (name)
        testGetModelByName: function () {
            var model = this.factory.getModel("TestData/SimpleTestModelSchema");
            assertNotUndefined(model);
        },

        //Ensures that the getModel() function from ModelFactory will return
        //a model when passed a schema
        testGetModelBySchema: function () {
            var model = this.factory.getModel(SimpleTestModelSchema);
            assertNotUndefined(model);
        }

    });

});