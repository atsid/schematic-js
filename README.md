#schematic-js
JSON-schema-based model support library.

## Overview
Schematic-js adds JSON schema support to model-based javascript applications. JSON Schema (http://json-schema.org) provides declarative structure and validation to data models making their behavior in an application more predictable.

## Usage

Schematic uses AMD for module support and that is its only strict dependency. The tests, which are also good examples of how to use schematic, use the requirejs loader (https://github.com/jrburke/requirejs.git), and the single-file minified versions (schematic-x.x.x-min.js) use requirejs' optimizer, but any AMD compliant loader should work.
Below is some sample code from the BackboneSchemaExample demonstrating the use of a validated model.
```
// Use AMD to define and load the resources we depend on.
require([
    "schematic/ModelFactory",
    "schema/ExampleSchema"
], function (
        ModelFactory,
        ExampleSchema
) {
    // Create a model factory.
    var mfact = new ModelFactory({
            // "resolver" is used by the factory to find schemas based on names.
            // resolve schema by mapping it to the dependency where it was already loaded.
            resolver: function (name) {
                if (name === "schema/ExampleSchema") {
                    return ExampleSchema;
                }
            }
        }),
        // Create a model based on the schema
        model = mfact.getModel("schema/ExampleSchema"),
        msg = document.getElementsByName("message")[0],
        btn = document.getElementsByName("Increment")[0];

    model.num = 1;
    // update the model.
    // Should fail after 10, because the schema defines a maximum of 10 for the num property.
    btn.onclick = function (evt) {
        model.num = model.num + 1;
        msg.innerHTML = "Model.num equals " + model.num;
    }

 });
```