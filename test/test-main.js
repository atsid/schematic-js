"use strict";

var allTestFiles = [],
    pathToModule = function (path) {
        var fixed = path.replace(/^\/base\//, '').replace(/\.js$/, '');
        return fixed;
    };

Object.keys(window.__karma__.files).forEach(function (file) {
    console.log(file);
    if (/Test.*\.js$/.test(file)) {
        // Normalize paths to RequireJS module names.
        allTestFiles.push(pathToModule(file));
    }
});

console.log(allTestFiles);

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base',

    paths: {
        schematic: "main",
        external: "test/lib",
        test: "test",
        TestData: "test/data"
    },
    map: {
        "*": {
            "schematic/Validator": "test/Validator"
        }
    },

    // ask Require.js to load these files (all our tests)
    deps: allTestFiles,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});