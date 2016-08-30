window.utils = window.utils || {};

/**
 * 得到相机的方向向量
 */
utils.getDirection = function(camera) {
    camera = camera || Game.instance.camera;
    var vector = new THREE.Vector3(0, 0, -1);
    vector.applyEuler(camera.rotation, camera.rotation.order);
    return vector;
};

/**
 * 相同的位置及角度
 */
utils.sameTransform = function(source, target, scale) {
    source.position.copy(target.getWorldPosition());
    source.rotation.copy(target.getWorldRotation());
    if (scale) {
        source.scale.copy(target.getWorldScale());
    }
};