(function () {
    require.config({
        baseUrl: "/test/src",
        paths: {
            schematic: "main",
            external: "test/javascript/third-party",
            test: "test/javascript",
            TestData: "test/data"
        },
        map: {
            "*": {
                "schematic/Validator": "test/Validator"
            }
        }
    });
}());
