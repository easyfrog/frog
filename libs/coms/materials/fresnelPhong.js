var replaceCode = function( src, target, replace ) {
    var index = src.indexOf( target )
    if (index > -1) {
        src = src.substring( 0, index ) + replace + src.substring( index + target.length );
    }

    return src;
};

var replaceCodeList = function( src, target, replace ) {
    for ( var i = 0; i < target.length; i ++ ) {
        src = replaceCode( src, target[ i ], replace[ i ] );
    }

    return src;
};

// support fresnel envMap
THREE.ShaderChunk.envmap_pars_vertex_fresnel = replaceCode(THREE.ShaderChunk.envmap_pars_vertex, 
    'varying vec3 vWorldPosition;', 

    'varying float vReflectionFactor;\n' + 
    'uniform float fresnelBias;\n' +
    'uniform float fresnelScale;\n' +
    'uniform float fresnelPower;\n' + 
    'varying vec3 vWorldPosition;\n'
);

THREE.ShaderChunk.envmap_vertex_fresnel = replaceCode(THREE.ShaderChunk.envmap_vertex, 
    'vWorldPosition = worldPosition.xyz;',

    'vWorldPosition = worldPosition.xyz;\n' +
    'vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );' +
    'vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );' +
    'vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( cameraToVertex, worldNormal ), fresnelPower );\n'
);

THREE.ShaderChunk.envmap_pars_fragment_fresnel = replaceCode(THREE.ShaderChunk.envmap_pars_fragment, 
    'uniform float reflectivity;',

    'uniform float reflectivity;\n' + 
    'uniform vec3 fresnelColor;\n' + 
    'varying float vReflectionFactor;\n'
);

THREE.ShaderChunk.envmap_fragment_fresnel = replaceCodeList(THREE.ShaderChunk.envmap_fragment, [
    'envColor = envMapTexelToLinear( envColor );',
    'outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );',
    'outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );',
    'outgoingLight += envColor.xyz * specularStrength * reflectivity;'
], [
    'envColor = envMapTexelToLinear( envColor );\n' +
    'float fresnelVal = 1.0;\n' + 
    '#ifdef USE_FRESNEL_ENVMAP\n' + 
    'fresnelVal = vReflectionFactor;\n' +
    '#endif\n',
    'outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity * fresnelVal);', 
    'outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity * fresnelVal );',
    'outgoingLight += envColor.xyz * specularStrength * reflectivity * fresnelVal;'
]);

var vertexShader = THREE.ShaderLib.phong.vertexShader;
var fragmentShader = THREE.ShaderLib.phong.fragmentShader;

vertexShader   = vertexShader.replace('#include <envmap_pars_vertex>', THREE.ShaderChunk.envmap_pars_vertex_fresnel);
vertexShader   = vertexShader.replace('#include <envmap_vertex>', THREE.ShaderChunk.envmap_vertex_fresnel);
fragmentShader = fragmentShader.replace('#include <envmap_pars_fragment>', THREE.ShaderChunk.envmap_pars_fragment_fresnel);
fragmentShader = fragmentShader.replace('#include <envmap_fragment>', THREE.ShaderChunk.envmap_fragment_fresnel);
fragmentShader = fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );',
    'vec4 diffuseColor = vec4( diffuse, opacity );\n' +
    '#ifdef USE_FRESNEL_COLOR\n' + 
    'vec3 _delta = fresnelColor - diffuseColor.rgb;\n' + 
    'diffuseColor.rgb += _delta * vec3(vReflectionFactor, vReflectionFactor, vReflectionFactor);\n' + 
    '#endif'
);

/**
 * ps:
 *     color,
 *     map,
 *     side,             // THREE.FrontSide
 *     envMap,
 *     reflectivity,     // 总体的反射强度, 默认 0.5
 *     
 *     fresnelBias,      // .1
 *     fresnelScale,     // 1.5 可以简单的改此值, 越大反射的面积越大
 *     fresnelPower,     // 3.0
 *
 *     useFresnelEnvMap, // true  使环境光反射受Fresnel影响
 *     useFresnelColor,  // false 使颜色爱Fresnel影响
 *
 *     fresnelColor,     // fresnel 颜色颜色值
 *     fresnelColorScale,// 如果不设置fresnelColor, 那么就简单的使用Color乘以这个值, 默认 0.5
 */
module.exports = function( ps ) {
    ps = ps || {};
    var fb = ps.fresnelBias || .1;
    var fs = ps.fresnelScale || 1.5;
    var fp = ps.fresnelPower || 3.0;

    ps.useFresnelEnvMap = ps.useFresnelEnvMap == undefined ? true : ps.useFresnelEnvMap;
    ps.useFresnelColor = ps.useFresnelColor == undefined ? false : ps.useFresnelColor;

    var phongMat = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsUtils.clone(THREE.ShaderLib.phong.uniforms), {
                fresnelBias:  { type: 'f', value: fb },
                fresnelScale: { type: 'f', value: fs },
                fresnelPower: { type: 'f', value: fp },
                fresnelColor: { type: 'c', value: new THREE.Color(0xffffff) }
            }]),
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        lights: true,
        fog: true,
        side: ps.side || 0
    });

    phongMat.uniforms.envMap.value       = ps.envMap;
    phongMat.uniforms.map.value          = ps.map;
    phongMat.uniforms.diffuse.value      = ps.color;
    phongMat.uniforms.fresnelColor.value = ps.fresnelColor || ps.color.clone().multiplyScalar(ps.fresnelColorScale || .5);
    phongMat.uniforms.reflectivity.value = ps.reflectivity || .5;

    phongMat.defines = {
        USE_MAP: ps.map != undefined,
        USE_ENVMAP: ps.envMap != undefined,
        ENVMAP_TYPE_CUBE: ps.envMap != undefined,
        ENVMAP_MODE_REFLECTION: true,
        ENVMAP_BLENDING_MIX: true,
        USE_FRESNEL_ENVMAP: ps.useFresnelEnvMap,
        USE_FRESNEL_COLOR: ps.useFresnelColor           // 颜色的Fresnel变化
    }

    return phongMat;
};
