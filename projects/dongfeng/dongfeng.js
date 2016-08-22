glo = glo || {};

// 项目名称
var _projectName = 'dongfeng';

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
    game = new Game(glo.container, {
        rendererConfig: {
            antialias: true,
            alpha: true
        },
        debug: true
    });

    // load scene
    game.load('models/dongfeng.sea', 'inno');

    // loading progress
    game.addEventListener(Game.PROGRESS, function(p) {
        console.log((p.progress * 100).toFixed(1) + '%');
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

function onLoadComplete() {
    // scene load complete

}