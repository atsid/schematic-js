#schematic-js
An ES5 JSON-schema-based model support library.

## Overview
Schematic-js adds JSON schema support to model-based javascript applications. JSON Schema (http://json-schema.org) provides declarative structure and validation to data models making their behavior in an application more predictable.

## Usage

Schematic uses AMD for module support and that is its only strict dependency. The tests, which are also good examples of how to use schematic, use the requirejs loader (https://github.com/jrburke/requirejs.git), and the single-file minified versions (schematic-x.x.x-min.js) use requirejs' (https://github.com/jrburke/r.js.git) optimizer, but any AMD compliant loader should work.
Below is sample code from the BackboneSchemaExample demonstrating the use of a validated model.
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
            // Resolve schema by mapping it to the dependency where it was already loaded.
            resolver: function (name) {
                if (name === "schema/ExampleSchema") {
                    return ExampleSchema;
                }
            }
        }),
        // Create a model based on the example schema.
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

## Integration
### Validation
The current version of Schematic-js relies on third party validators to supply JSONSchema validation. The examples use a reference implementation from json-schema (https://github.com/kriszyp/json-schema.git), but other validators can easily be injected via AMD's module mapping.
### Backbone
The library provides backbone (https://github.com/documentcloud/backbone.git) integration by creating a Backbone.SchematicModel that extends Backbone.Model. SchematicModel implements validation and add property definitions defined on the schema to the model.