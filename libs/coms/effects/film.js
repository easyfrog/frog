require('../../extra/shaders/CopyShader');
require('../../extra/shaders/FilmShader');
require('../../extra/postprocessing/FilmPass');
require('../../extra/postprocessing/ShaderPass');

module.exports = function( ps ) {
    ps = ps || {};
    
    var noise = ps.noise || .5;
    var line = ps.line || .1;
    var lineCount = ps.lineCount || 648;
    var gray = ps.gray == undefined || false;
    
    var effect = new THREE.FilmPass(noise, line, lineCount, gray);
    effect.renderToScreen = true;

    effect.name = 'film';

    return effect;
};

