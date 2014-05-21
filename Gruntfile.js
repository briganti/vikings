module.exports = function(grunt) {
    grunt.initConfig({
  
        /* Package.json Info */
        pkg: grunt.file.readJSON('package.json'),
        
        /* Constants for the Gruntfile */
        BASE_PATH        : '',
        RESSOURCE_PATH   : 'tmp/',
        DEVELOPMENT_PATH : 'dev/',
        PRODUCTION_PATH  : 'prod/',
        
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
    
        /* Remove files from development/production directories */
        clean: {
            dev : ['<%= DEVELOPMENT_PATH %>'],
            prod: ['<%= PRODUCTION_PATH %>'],
            prodDone : [
                '<%= PRODUCTION_PATH %>' + 'public/js/controllers',
                '<%= PRODUCTION_PATH %>' + 'public/js/directives',
                '<%= PRODUCTION_PATH %>' + 'public/js/external',
                '<%= PRODUCTION_PATH %>' + 'public/js/services',
                '<%= PRODUCTION_PATH %>' + 'public/js/app.js',
                '<%= PRODUCTION_PATH %>' + 'public/js/controllers.js',
                '<%= PRODUCTION_PATH %>' + 'public/js/directives.js'/*,
                '<%= PRODUCTION_PATH %>' + 'public/js/<%= pkg.name %>.js'*/
            ],
        },
    
        /* Generate css */
        compass: {
            dev: {
                options: {
                    require : ['susy', 'animation'],
                    sassDir : '<%= RESSOURCE_PATH %>' + 'public/css/sass',
                    cssDir  : '<%= DEVELOPMENT_PATH %>' + 'public/css'
                }
            },
            prod: {
                options: {
                    require     : ['susy', 'animation'],
                    sassDir     : '<%= RESSOURCE_PATH %>' + 'public/css/sass',
                    cssDir      : '<%= PRODUCTION_PATH %>' + 'public/css',
                    outputStyle : 'compressed'
                }
            }
        },
    
        /* Copy source files */
        copy: {
            dev: {
                files: [
                    { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['public/js/**'], dest: '<%= DEVELOPMENT_PATH %>'},
                    { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['public/img/**'], dest: '<%= DEVELOPMENT_PATH %>'},
                    { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['public/*'], dest: '<%= DEVELOPMENT_PATH %>'},
                    { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['controllers/*'], dest: '<%= DEVELOPMENT_PATH %>'},
                    { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['models/*'], dest: '<%= DEVELOPMENT_PATH %>'},
                    { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['routes/*'], dest: '<%= DEVELOPMENT_PATH %>'},
                    { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['views/**'], dest: '<%= DEVELOPMENT_PATH %>'},
                    { src: '<%= RESSOURCE_PATH %>' + 'app.js', dest: '<%= DEVELOPMENT_PATH %>' + 'app.js'}
                ]
            },
            prod: {
                files: [
                    { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['public/js/**'], dest: '<%= PRODUCTION_PATH %>'},
                    { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['public/img/**'], dest: '<%= PRODUCTION_PATH %>'},
                    { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['public/*'], dest: '<%= PRODUCTION_PATH %>'},
                    { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['controllers/*'], dest: '<%= PRODUCTION_PATH %>'},
                    { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['models/*'], dest: '<%= PRODUCTION_PATH %>'},
                    { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['routes/*'], dest: '<%= PRODUCTION_PATH %>'},
                    { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['views/**'], dest: '<%= PRODUCTION_PATH %>'},
                    { src: '<%= RESSOURCE_PATH %>' + 'app.js', dest: '<%= PRODUCTION_PATH %>' + 'app.js'}
                ]
            }
        },
    
        /* Preprocess Js files */
        preprocess: {
            dev: {
                src: ['<%= DEVELOPMENT_PATH %>' + 'views/layout.jade'],
                options: {
                    inline: true,
                    context: {
                        production: false
                    }
                }
            },
            prod: {
                src: ['<%= PRODUCTION_PATH %>' + 'views/layout.jade'],
                options: {
                    inline: true,
                    context: {
                        production: true
                    }
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
                '<%= PRODUCTION_PATH %>' + 'public/js/**/*.js',
                '<%= PRODUCTION_PATH %>' + 'public/js/app.js',
                '<%= PRODUCTION_PATH %>' + 'public/js/controllers.js',
                '<%= PRODUCTION_PATH %>' + 'public/js/directives.js'
                ],
                dest : '<%= PRODUCTION_PATH %>' + 'public/js/<%= pkg.name %>.js'
            }
        },

        /* Minify Js Files **/
        uglify: {
            options: {
                 banner: '<%= banner.join("\\n") %>'
            },
            prod: {
                files: [{
                    src  : '<%= PRODUCTION_PATH %>' + 'public/js/<%= pkg.name %>.js',
                    dest : '<%= PRODUCTION_PATH %>' + 'public/js/<%= pkg.name %>.min.js'
                }]
            }
        }
    });

    /* load plugins */
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-preprocess');

    /* Tasks */
    grunt.registerTask('default', ['clean:dev', 'copy:dev', 'compass:dev', 'preprocess:dev']);
    grunt.registerTask('build', ['clean:prod', 'copy:prod', 'compass:prod', 'preprocess:prod', 'concat:prod', /*'uglify:prod',*/ 'clean:prodDone']);
};
