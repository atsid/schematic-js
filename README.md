[![Code Climate](https://codeclimate.com/github/atsid/schematic-js/badges/gpa.svg)](https://codeclimate.com/github/atsid/schematic-js)
[![Build Status](https://travis-ci.org/atsid/schematic-js.svg?branch=master)](https://travis-ci.org/atsid/schematic-js)
[![Dependency Status](https://david-dm.org/atsid/schematic-js.svg)](https://david-dm.org/atsid/schematic-js)
[![Dev Dependency Status](https://david-dm.org/atsid/schematic-js/dev-status.svg)](https://david-dm.org/atsid/schematic-js)

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
Schematic provides serveral lightweight plugins for field-level validation, including regular expression validation, conditional field values (not supported by JSON schema) and Luhn validation. However, the current version does relies on third party validators to supply full-model JSONSchema validation. The examples use a reference implementation from json-schema (https://github.com/kriszyp/json-schema.git), but other validators can easily be injected via AMD's module mapping.

### Backbone
The library provides backbone (https://github.com/documentcloud/backbone.git) integration by creating a Backbone.SchematicModel that extends Backbone.Model. SchematicModel implements validation and adds property definitions defined on the schema to the model.

## Development

Builds are done with grunt.

1. Install node.js if you don't have it
1. Install grunt-cli if you don't have it `npm install -g grunt-cli`
1. Install deps `npm install`
1. Run linter/tests `npm test`

##License
This software is licensed under the Apache 2.0 license (http://www.apache.org/licenses/LICENSE-2.0).
