define({
    'id': 'TestData/EmbeddedSchema',
    'description': 'A simple model for testing',
    '$schema': 'http://json-schema.org/draft-03/schema',
    'type': 'object',
    'extends': {
        '$ref': 'TestData/BaseSchema'
    },
    'properties': {
        'explanation': {
            'type': 'string',
            'description': 'The number of the model.',
            'required': true
        },
        'comment': {
            'type': 'string',
            'description': 'an optional property.'
        },
        'embedded': {
            '$ref': 'TestData/SimpleTestModelSchema'
        }
    }
});