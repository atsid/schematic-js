define([
'main/ModelFactory',
'TestData/BaseSchema',
'poly/object'
], function (factory, baseSchema) {
    describe("Model Factory", function() {
        var modelFactory;
        var baseModel;
        beforeEach(function() {
            modelFactory = new factory();
            baseModel = modelFactory.getModel(baseSchema);
        });
        it("can return a model based on a schema.", function() {
            baseModel.set('modelNumber', "1234");
            expect(baseModel.modelNumber).toBe("1234");
        });

    });
});
