'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib: {
                src: ['lib/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            },
        },
        watch: {
            all: {
                files: ['lib/**/*.js', 'test/**/*.js'],
                tasks: ['jshint', 'buster:unit']
            }
        },

        buster: {
            unit: {
            },
            integration: {
                test: {
                    config: 'test_integration/buster.js'
                }
            }
        },
        shell: {
            multiple: {
                command: [
                    'rm -rf artifact',
                    'mkdir -p artifact',
                    'mv node_modules ../node_modules2',
                    'npm install --production',
                    'tar -zcf artifact/spid-client-node.tar.gz .',
                    'rm -rf node_modules',
                    'mv ../node_modules2 node_modules'
                ].join('&&')
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-buster');

    // Default task.
    grunt.registerTask('default', ['jshint', 'buster:unit']);
    grunt.registerTask('test', 'buster:unit');
    grunt.registerTask('integration', 'buster:integration');
    grunt.registerTask('check', ['watch']);
    grunt.registerTask('artifact', ['shell']);

};
