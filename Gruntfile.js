module.exports = function(grunt) {
    grunt.initConfig({
  
        /* Package.json Info */
        pkg: grunt.file.readJSON('package.json'),
        
        /* Constants for the Gruntfile */
        BASE_PATH        : '',
        
        /* A code block that will be added to our minified code files. */
        banner: [
            '/******************************',
            '* Project: <%= pkg.name %>',
            '* Version: <%= pkg.appVersion %> (<%= pkg.version %>)',
            '* Development By: <%= pkg.developedBy %>',
            '* Copyright(c): <%= grunt.template.today("yyyy") %>',
            '******************************/',
            ''
        ],
    
         /* Env variables */
        env: {
            dev  : { NODE_ENV : 'DEVELOPMENT'},
            prod : { NODE_ENV : 'PRODUCTION'}
        },
    
        /* Generate css */
        compass: {
            dev: {
                options: {
                    require : ['susy', 'animation'],
                    sassDir : '<%= BASE_PATH %>' + 'public/css/sass',
                    cssDir  : '<%= BASE_PATH %>' + 'public/css'
                }
            },
            prod: {
                options: {
                    require     : ['susy', 'animation'],
                    sassDir     : '<%= BASE_PATH %>' + 'public/css/sass',
                    cssDir      : '<%= BASE_PATH %>' + 'public/css',
                    outputStyle : 'compressed'
                }
            }
        },
    
        /* Concat Js files */
        concat: {
            options: {
                separator: ';'
            },
            prod: {
                src  : [
                '<%= BASE_PATH %>' + 'public/js/**/*.js',
                '<%= BASE_PATH %>' + 'public/js/app.js',
                '<%= BASE_PATH %>' + 'public/js/controllers.js',
                '<%= BASE_PATH %>' + 'public/js/directives.js'
                ],
                dest : '<%= BASE_PATH %>' + 'public/js/<%= pkg.name %>.js'
            }
        },

        /* Minify Js Files **/
        uglify: {
            options: {
                 banner: '<%= banner.join("\\n") %>'
            },
            prod: {
                files: [{
                    src  : '<%= BASE_PATH %>' + 'public/js/<%= pkg.name %>.js',
                    dest : '<%= BASE_PATH %>' + 'public/js/<%= pkg.name %>.min.js'
                }]
            }
        }
    });

    /* load plugins */
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    /* Tasks */
    grunt.registerTask('default', ['compass:dev']);
    grunt.registerTask('production', ['compass:prod', 'concat:prod', /*'uglify:prod',*/]);
};
