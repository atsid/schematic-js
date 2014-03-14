/**
 * User: kevin.convy
 * Date: 1/28/14
 * Time: 10:48 AM
 * Grunt build for library upkeep tasks
 */

module.exports = function (grunt) {
    grunt.initConfig({
        // Require js optimizer
        requirejs: {
            compile: {
                options: {
                    baseUrl: "./src/main",
                    paths: {
                        schematic: "."
                    },
                    name: "schematic/fullpack",
                    out: "schematic-1.0.4-min.js"
                }
            }
        },

        // test server
        connect: {
            test : {
                options: {
                    port : 9001
                }
            }
        },

        // jasmine template
        jasmine: {
            test: {
                src: '',
                options: {
                    specs: './src/test/specs/*.spec.js',
                    helpers: '',
                    host: 'http://127.0.0.1:9001/',
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        baseUrl: "./src",
                        paths: {
                            schematic: "main",
                            external: "./src/test/javascript/third-party",
                            test: "./src/test/javascript",
                            TestData: "./src/test/data"
                        },
                        map: {
                            "*": {
                                "schematic/Validator": "test/Validator"
                            }
                        }
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('test', [
        'connect',
        'jasmine'
    ]);
};
