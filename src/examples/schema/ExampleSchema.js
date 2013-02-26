define([
], function (
) {
    
    return {
        "id": "schema/ExampleSchema",
        "description": "A simple model for testing",
        "$schema": "http://json-schema.org/draft-03/schema",
        "type": "object",
        "properties": {
            "num": {
                "type": "integer",
                "description": "an optional property.",
                "maximum": 10,
                "required": true
            }
        }
    };
});