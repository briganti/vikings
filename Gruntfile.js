module.exports = function(grunt) {
  // configure tasks
  grunt.initConfig({
  
    /* This will load in our package.json file so we can have access to the project name and appVersion number. */
    pkg: grunt.file.readJSON('package.json'),
    
    /* Constants for the Gruntfile so we can easily change the path for our environments. */
    BASE_PATH: '',
    RESSOURCE_PATH: 'tmp/',
    DEVELOPMENT_PATH: 'dev/',
    PRODUCTION_PATH: 'prod/',
    
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
    
     /* The different constant names that will be use to build our html files. */
    env: {
        dev: { NODE_ENV : 'DEVELOPMENT'},
        prod : { NODE_ENV : 'PRODUCTION'}
    },
    
    /* remove old deployments */
    clean: {
        dev : ['<%= DEVELOPMENT_PATH %>'],
        prod: ['<%= PRODUCTION_PATH %>'],
        prodDone : [
            '<%= PRODUCTION_PATH %>' + 'public/js/internal',
            '<%= PRODUCTION_PATH %>' + 'public/js/external',
            '<%= PRODUCTION_PATH %>' + 'public/js/<%= pkg.name %>.js'
        ],
    },
    
    /* Generate css */
    compass: {
      dev: {
        options: {
          require: ['susy', 'animation'],
          sassDir: '<%= RESSOURCE_PATH %>' + 'public/css/sass',
          cssDir: '<%= DEVELOPMENT_PATH %>' + 'public/css'
        }
      },
      prod: {
        options: {
          require: ['susy', 'animation'],
          sassDir: '<%= RESSOURCE_PATH %>' + 'public/css/sass',
          cssDir: '<%= PRODUCTION_PATH %>' + 'public/css',
          outputStyle: 'compressed'
        }
      }
    },
    
    /* copy main files */
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
            {src: '<%= RESSOURCE_PATH %>' + 'app.js', dest: '<%= DEVELOPMENT_PATH %>' + 'app.js'},
            {src: '<%= RESSOURCE_PATH %>' + 'vikings.js', dest: '<%= DEVELOPMENT_PATH %>' + 'vikings.js'}
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
            { expand: true, cwd: '<%= RESSOURCE_PATH %>', src: ['views/*'], dest: '<%= PRODUCTION_PATH %>'},
            {src: '<%= RESSOURCE_PATH %>' + 'app.js', dest: '<%= PRODUCTION_PATH %>' + 'app.js'},
            {src: '<%= RESSOURCE_PATH %>' + 'vikings.js', dest: '<%= PRODUCTION_PATH %>' + 'vikings.js'}
        ]
      }
    },
    
    /* preprocess Js and Jade files */
    preprocess: {
        dev: {
            src: ['<%= DEVELOPMENT_PATH %>' + 'public/js/**/*.js'],
            options: {
                inline: true,
                context: {
                    production: false
                }
            }
        },
        prod: {
            src: ['<%= PRODUCTION_PATH %>' + 'public/js/**/*.js'],
            options: {
                inline: true,
                context: {
                    production: true
                }
            }
        }
    },
    
    /* concat JsFile */
    concat: {
        options: {
            separator: ';'
        },
        prod: {
            src: ['<%= PRODUCTION_PATH %>' + 'public/js/**/*.js'],
            dest: '<%= PRODUCTION_PATH %>' + 'public/js/<%= pkg.name %>.js'
        }
    },

    /* minify Js Files **/
    uglify: {
        options: {
             banner: '<%= banner.join("\\n") %>'
        },
        prod: {
            files: [{
                src: '<%= PRODUCTION_PATH %>' + 'public/js/<%= pkg.name %>.js',
                dest: '<%= PRODUCTION_PATH %>' + 'public/js/<%= pkg.name %>.min.js'
            }]
        }
    },

    
    
    /** Other **/
    prompt: {
      sftp: {
        options: {
          questions: [
            {
              config: 'sshconfig.dev.passphrase',
              type: 'password',
              message: 'Enter your passphrase :'
            }
          ]
        }
      },
    },
  
    
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        }
      },
      all: ['client/js/internal/*.js']
    },
    
    /*sshconfig: {
      dev: {
        host: "www01.vdev.pooll.s1.p.fti.net",
        port: 22,
        username: "mvial",
        privateKey: grunt.file.read("id_rsa"),
        passphrase: "",
      }
    },*/
    sshexec: {
      uptime: {
        command: "ls -alh",
      }
    },
    sftp: {
      deploy: {
        files: {
          "./": "secret.js"
        },
        options: {
          path:'/home/mvial/',
          createDirectories: true
        }
      }
    },
	imagemin: {
	  png: {
        options: {
		  optimizationLevel: 7
		},
		files: [{
          expand: true,
          cwd: 'client/',
          src: ['**/*.png'],
          dest: 'client/'
        }]
      },
      jpg: {
        options: {
          progressive: true
        },
        files: [{
          expand: true,
          cwd: 'client/img/',
	      src: ['**/*.jpg'],
          dest: 'project-directory/img/compressed/',
          ext: '.jpg'
        }]
      }
    },
    
    watch: {
      sass: {
        files: ['client/css/sass/partials/*.scss'],
        tasks: ['compass'],
        options: {
            livereload: true,
        }
      }
    }

  });

  // load plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-preprocess');
  //grunt.loadNpmTasks('grunt-prompt');
  

  // Default task.
  grunt.registerTask('default', ['clean:dev', 'copy:dev', 'compass:dev', 'preprocess:dev']);
  grunt.registerTask('build', ['clean:prod', 'copy:prod', 'compass:prod', 'preprocess:prod', 'concat:prod', 'uglify:prod', 'clean:prodDone']);
  //grunt.registerTask('deploy', ['prompt:sftp', 'sftp:deploy', 'sshexec:uptime']);
  //grunt.registerTask('imagemin', ['imagemin']);
};
