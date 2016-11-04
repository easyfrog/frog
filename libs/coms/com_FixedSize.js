/**
 * Events:
 *     start, update, onMouseDown, onMouseUp, onMouseMove onPicked, onRemove, onKeyDown, onKeyUp
 * properties:
 *        name, enabled, object
 *
 * params: 
 * 		game,
 * 		controller,
 * 		multiply,    // scale 的增量
 * 		fixedHeight, // 高度会根据大小的变化而变化. 1 0 -1
 */
function com_FixedSize(params) {
    this.name = 'com_FixedSize';

    Object.assign(this, params);
    
    this.game = this.game || Game.instance;
    this.controller = this.controller || this.game.controller;
    this.multiply = this.multiply || 1;

};

com_FixedSize.prototype = {
    constructor: com_FixedSize, 

    start: function() {
		this.originScale = this.object.scale.clone();
		this.originPosition = this.object.position.clone();
    },

    update: function() {
    	if (this.game && this.controller) {
    		var _s = this._getScale();
    		this.object.scale.set(this.originScale.x * _s * this.multiply, this.originScale.y * _s * this.multiply, 1);

    		// fixedHeight: 1, 0, -1
    		if (this.fixedHeight) {
    			this.object.position.y = this.originPosition.y + this.fixedHeight * (this.originScale.y - this.object.scale.y);
    		}
    	}
    },

    _getScale: function() {
    	var fov = this.controller.object.fov * THREE.Math.DEG2RAD / 2;
    	var dis = this.controller.object.position.distanceTo(this.object.position);

    	return Math.tan(fov) * dis / this.game.height;
    }
};

module.exports = com_FixedSize;