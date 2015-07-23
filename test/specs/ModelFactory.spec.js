define([
'../../../js/ModelFactory',
'TestData/BaseSchema',
'../../../js/plugins/SchemaValidationPlugin',
'poly/object'
], function (factory, baseSchema, validationPlugin) {
    describe("Model Factory", function() {
        var modelFactory;
        var baseModel;
        beforeEach(function() {
            modelFactory = new factory();
            modelFactory.addValidator(new validationPlugin({
                propertyPattern: /.*/,
                modelPattern: /.*/
            }));
            baseModel = modelFactory.getModel(baseSchema);
        });

        it("can return a model based on a schema.", function() {
            baseModel.set('modelNumber', "1234");
            expect(baseModel.modelNumber).toBe("1234");
        });

        it("allows unvalidated set by default", function() {
            baseModel.set('modelNumber', "12345678");
            expect(baseModel.modelNumber).toBe("12345678");
        });

        it("can be configured to disallow 'set' based on validation.", function() {
            mFactory = new factory({
                validatedSet: true
            });
            mFactory.addValidator(new validationPlugin({
                propertyPattern: /.*/,
                modelPattern: /.*/
            }));
            bModel = mFactory.getModel(baseSchema);
            bModel.set('modelNumber', "1234");
            expect(bModel.modelNumber).toBe("1234");
            bModel.set('modelNumber', "12345678");
            expect(bModel.modelNumber).toBe("1234");
        });

        it("allows explicit validation of the entire model", function() {
            baseModel.set('modelNumber', "12345678");
            expect(baseModel.modelNumber).toBe("12345678");
            baseModel.validate();
            expect(baseModel.lastErrors.modelNumber).toBeDefined();
        });
    });
});
