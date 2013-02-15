require(["schematic/ModelFactory", "TestData/SimpleTestModelSchema", "schematic/BackboneExtension"],
        function (ModelFactory, SimpleTestModelSchema) {
    
        var b;
    
        /**
         * Test the model directly
         */
        b = new TestCase("TestBackboneModel", {
    
            setUp: function () {
                this.factory = new ModelFactory();
                this.model = this.factory.getModel(SimpleTestModelSchema);
            },

            testIsBackboneModel: function () {
                assertNotUndefined(Backbone);
                assertNotUndefined(this.model);
                assertTrue((this.model instanceof Backbone.SchematicModel));
                assertTrue(this.model.isNew());
            },

            testBackboneModelSchemaSupport: function () {
                var success = true;

                // should not be able to set an attribute that isn't on the schema
                this.model.set("noattr", "shouldntset", {validate: true});
                assertNotEquals("shouldntset", this.model.get("noattr"));
                assertFalse(this.model.isValid());

                // required attributes should be set before save.
                success = this.model.save({"noattr": "shouldntset"}, {
                    validate: true
                });
                assertFalse(success);

                // should be able to get and set all attributes that are in the
                // schema.
                this.model.set("modelNumber", "1111");
                assertEquals("1111", this.model.get("modelNumber"));
                assertEquals("1111", this.model.modelNumber);

                this.model.modelNumber = "2222";
                assertEquals("2222", this.model.get("modelNumber"));
                assertEquals("2222", this.model.modelNumber);

                this.model.set("optionalprop", "optional");
                assertEquals("optional", this.model.get("optionalprop"));
                assertEquals("optional", this.model.optionalprop);

                // shouldn't be able to set longer than 4 chars for modelNumber.
                this.model.set("modelNumber", "55555", {validate: true});
                assertNotEquals("55555", this.model.get("modelNumber"));
                this.model.modelNumber = "55555";
                assertNotEquals("55555", this.model.modelNumber);

            }
        });
    
    });
