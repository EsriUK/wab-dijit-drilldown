/*global grunt, module, require */
var fs = require('fs'),
    path = require('path'),
    Zip = require('adm-zip');

module.exports = function (grunt) {

    var gruntconfig = {
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        clean: {
            pre: {
                options: { force: true },
                src: ["build/", "dist/"]
            },
            post: {
                options: { force: true },
                src: ["dist/Drilldown.js"]
            }
        },
        bower: {
            install: {
                options: {
                    targetDir: './',
                    layout: 'byComponent',
                    install: true,
                    verbose: false,
                    copy: false,
                    cleanTargetDir: false,
                    cleanBowerDir: false,
                    bowerOptions: {}
                }
            }
        },
        uglify: {
            locators: {
                options: {
                    compress: true,
                    mangle: true,
                    sourceMap: false
                },
                files: [{
                    expand: true,
                    cwd: 'js/',
                    src: ['Locators/*.js'],
                    dest: 'build/'
                }]
            },
            widget: {
                options: {
                    compress: true,
                    mangle: true,
                    sourceMap: false
                },
                files: [{
                    expand: true,
                    cwd: 'js/',
                    src: ['*.js'],
                    dest: 'build/'
                }]
            }
        },
        copy: {
            drill: {
                files: [{
                    src: ['DrilldownSrc/drilldown/build/*.js'],
                    dest: 'Drilldown/Drilldown/',
                    flatten: true,
                    expand: true
                }]
            },
            locators: {
                files: [{
                    src: ['DrilldownSrc/drilldown/build/Locators/*.js'],
                    dest: 'Drilldown/Drilldown/Locators',
                    flatten: true,
                    expand: true
                }]
            }
        }
    };


    // Project configuration.
    grunt.initConfig(gruntconfig);

    // Load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-preen');

    // Add default task(s)

    grunt.registerTask('default', ['bower:install', 'preen']);


    grunt.registerTask('build', ['bower:install', 'preen', 'copy']);


};








