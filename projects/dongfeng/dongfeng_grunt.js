module.exports = function(grunt) {

	grunt.config.merge({
		// uglify插件的配置信息
		uglify: {
			dongfeng: {
				files: [ 
					{
						src: [
							 "libs/extra/OrbitControls_ztc.js",
							 "libs/edgeToolsBase.js",
							 "libs/src/**.js",
						],
						dest: 'E:/EdgeWorks/dongfeng/publish/web/libs/frog.js'
					}, {
						src: [
							"build/dongfeng.browserify.js" // 合入模块后的 project.js
						],
						dest: 'E:/EdgeWorks/dongfeng/publish/web/main.js'
					}
				]
			}
		},

		// browserify
		browserify: {
			dongfeng: {
				src: "projects/dongfeng/dongfeng.js",
				dest: "build/dongfeng.browserify.js" 
			}
		}
	});

	(function(project, path) {
		grunt.registerTask(project, '', function( version ) {
			// 先判断项目是否存在或已关闭?
			if (!grunt.file.exists('projects/' + project)) {
				grunt.log.writeln('project "' + project + '" NOT EXISTS. OR is CLOSED! use grunt --no-color open:"' + project + '" first.' );
				return;
			}
			// 设置项目目录位置
			grunt.projectFolder = path;
			// 设置grunt项目名
			grunt.project = project;
			// 设置当前任务(可以为单任务或数组)
			grunt.currentTask = ['browserify:' + project, 
								'uglify:' + project,
								'deletefile:build/dongfeng.browserify.js'];
			// 是否需要3D库文件
			grunt.needLibs = true;

			var targetVersion = '';
			if (targetVersion == '') {targetVersion = 'r79';}

			// 库文件版本 r72 | r76
			grunt.needLibsVersion = version || targetVersion;

			// 先执行将libs文件Copy到工程目录libs/下
			grunt.task.run('withlibs');
		});
	})(
		'dongfeng',				// project name
		'E:/EdgeWorks/dongfeng/publish/web'		// project path
	);
};