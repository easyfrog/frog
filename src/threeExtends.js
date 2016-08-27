/////////////////////////////////
// Component stuff
/////////////////////////////////
THREE.Object3D.prototype.addComponent = function(com, params) {
    var s = this;
    s.components = s.components || [];
    params = params || {};
    params.enabled = params.enabled == undefined ? true : params.enabled;

    var _com = new com(params);

    _com.object = this;
    _com.enabled = params.enabled;

    s.components.push(_com);
    Game.instance.components.push(_com);

    // 调用 start
    if (_com.enabled && _com.start) {
        _com.start();
    }

    return _com;
};

THREE.Object3D.prototype.removeComponent = function(com) {
    if (this.components) {
        if (com.enabled && com.onRemove) {
            com.onRemove();
        }

        var index = this.components.indexOf(com);
        index > -1 && this.components.splice(index, 1);
        index = Game.instance.components.indexOf(com);
        index > -1 && Game.instance.components.splice(index, 1);
    }
};

/////////////////////////////////
// OrbitControl extends 
/////////////////////////////////
THREE.OrbitControls.prototype.getDistance = function() {
    return this.target.clone().distanceTo(this.object.position);
};

THREE.OrbitControls.prototype.setDistance = function(distance) {
    var vec = this.object.position.clone().sub(this.target).normalize();
    this.object.position.copy(this.target.clone().add(vec.multiplyScalar(distance)));
};