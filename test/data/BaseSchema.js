define({
    "id": "TestData/BaseSchema",
    "description": "A simple model for testing",
    "$schema": "http://json-schema.org/draft-03/schema",
    "type": "object",
    "properties": {
        "modelNumber": {
            "type": "string",
            "maxLength": 4,
            "description": "The number of the model.",
            "pattern": "[0-9]",
            "required": true
        },
        "optionalprop": {
            "type": "string",
            "description": "an optional property."
        }
    }
});