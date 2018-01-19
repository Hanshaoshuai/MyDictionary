
var gulp = require("gulp");
var less = require("gulp-less");
var scss = require("gulp-sass");
var connect = require("gulp-connect");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var minifyCss = require("gulp-minify-css"); 
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var autoprefixer=require("gulp-autoprefixer");

gulp.task("server",function(){
	connect.server({
		root:"dist",
		livereload:true
	})
	
})

gulp.task("concatJS",function(){
	gulp.src("js/*.js")
		.pipe(concat("index.js"))
		.pipe(gulp.dest("dist/js"))
		.pipe(rename("index.min.js"))
		.pipe(uglify())
		.pipe(gulp.dest("dist/js"))
})

gulp.task("concatLESS",function(){
	gulp.src("src/less/*.less")
		.pipe(concat("c.less"))
		.pipe(gulp.dest("src/less"))
		.pipe(less())
		.pipe(gulp.dest("dist/css"))
		.pipe(rename("c.min.css"))
		.pipe(minifyCss())
		.pipe(gulp.dest("dist/css"))
})

gulp.task("less",function(){
	gulp.src("src/less/test.less")
		.pipe(less())
		.pipe(gulp.dest("src/css"))
})

gulp.task("scss",function(){
	gulp.src("src/scss/index.scss")
		.pipe(scss())
		.pipe(gulp.dest("src/css"))
})

gulp.task("copy-index",function(){
	gulp.src("index.html")
		.pipe(gulp.dest("dist"))
		.pipe(connect.reload())
})

gulp.task("copy-data",function(){
//	gulp.src(["json/*.json","xml/*.xml"])
	gulp.src(["json/*.json","xml/*.xml","!json/c.json"])
		.pipe(gulp.dest("dist/data"))
})

gulp.task("copy-image",function(){
//	gulp.src("images/*.jpg")
//	gulp.src("images/*.{jpg,png}")
	gulp.src("images/**/*")
		.pipe(imagemin())
		.pipe(gulp.dest("dist/images"))
})

gulp.task('testAutoFx', function () {
    //找到src目录下app.css，为其补全浏览器兼容的css
    return gulp.src('src/css/*.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        //输出到dist文件夹
        .pipe(gulp.dest('dist/css'));
});

gulp.task("build",["concatJS","concatLESS","copy-index","copy-image","copy-data","testAutoFx"],function(){
	console.log("ok")
})

gulp.task("watch",function(){
	gulp.watch("js/*",["concatJS"]);
	gulp.watch("src/css/*",["concatLESS"]);
	gulp.watch("index.html",["copy-index"]);
	gulp.watch("images/**/*",["copy-image"]);
	gulp.watch("src/css/*",["testAutoFx"]);
	gulp.watch(["json/*.json","xml/*.xml","!json/c.json"],["copy-data"]);
})

gulp.task("default",["build","watch","server"]);
