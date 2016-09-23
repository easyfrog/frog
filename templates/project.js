window.glo = window.glo || {};

// 项目名称
var _projectName = '<%= grunt.project %>';

var stage, game;
// Edge Loaded 
AdobeEdge.bootstrapCallback(function(compId) {
    stage = AdobeEdge.getComposition(compId).getStage();

    // scale to fix screen
    var innerWidth = window.innerWidth < 640 ? 640 : window.innerWidth;
    t.scaleToFixScreen(stage.getSymbolElement(), innerWidth);
    // 统计
    t.analyze(_projectName);

    glo.pf = t.getPlatform();

    // yepnope async load libs
    yepnope({
		load:[
			'libs/th.js',
			'libs/frog.js'
		],
		complete:function() {
			init();
		}
    });
});

function init() {
	// create game instance
	game = new Game(glo.container);

    // default use SEA3D file
    var loaderCom = require('../../libs/coms/seaLoader');
    glo.loader = new loaderCom(game.currentScene);

    glo.loader.load(['./models/<%= grunt.project %>.tjs.sea'], '<%= grunt.project %>', onLoadComplete);

    glo.loader.on('progress', function(p) {
        console.log(p.progress + '%');

        /*
        glo.progressText.html((p.progress * 100).toFixed(1) + '%');
        if (p.type == 'sea3d_download') {
            glo.progressStatus.text('下载中...');
        } else {
            glo.progressStatus.text('场景构建中...');
        }
        //*/
    });
}

// 更新控制器
game.on('update', function(dt) {
    // game.controller.autoRotateSpeed = -10 * game.deltaTime;
    game.controller.update();
});

function onLoadComplete(group, remain) {
	// scene load complete

}


