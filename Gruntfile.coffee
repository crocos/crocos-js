module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"
    banner: """
            /*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>
             * <%= pkg.homepage %>
             * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */
            """

    qunit:
      files: ["test/*.html"]

    concat:
      options:
        stripBanners: true
        banner: "<%= banner %>"
      dist:
        src: [
          "src/crocos.js"
          "src/modules/compatible.js"
          "src/modules/deferred.js"
          "src/modules/logger.js"
          "src/modules/util.js"
          "src/modules/cache.js"
          "src/modules/facebook.js"
          "src/modules/beacon.js"
        ]
        dest: 'dist/crocos.js'

    uglify:
      options:
        banner: "<%= banner %>"
      dist:
        src: 'dist/crocos.js'
        dest: 'dist/crocos.min.js'

    watch:
      scripts:
        files: "src/**/*.js"
        tasks: ["default"]

    clean:
      files: ["dist"]

  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-contrib-qunit"
  grunt.loadNpmTasks "grunt-contrib-watch"

  grunt.registerTask "default", ["clean", "concat", "uglify", "qunit"]

