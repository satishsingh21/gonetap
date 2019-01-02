const gulp = require('gulp');
const nodemon = require('nodemon');

gulp.task('default', () =>
    nodemon({
        script: 'server.js',
        ext: 'js',
        env: { PORT: 3000 },
        ignore: ['./node_modules/**']
    })
        .on('restart', () => console.log('Restarting...'))
);