window.util = window.util || {};

/**
 * 得到相机的方向向量
 */
util.cameraDirection = function(camera) {
    camera = camera || Game.instance.camera;
    var vector = new THREE.Vector3(0, 0, -1);
    vector.applyEuler(camera.rotation, camera.rotation.order);
    return vector;
};
