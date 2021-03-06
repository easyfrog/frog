/**
 * Events:
 *     start, update, onMouseDown, onMouseUp, onMouseMove onPicked, onRemove, onKeyDown, onKeyUp
 * properties:
 *        name, enabled, object
 */
var g;
var delta;

/**
 * params:
 *     game,
 *     controls,
 *     direction,
 *     directionInverse, // direction iverse use to panorama from center look outter
 *     horizontalOnly,
 *     friends,         // default opacity do together
 *     min,             // angle begin
 *     max,             // angle to 1
 *     minValue,        // opacity or other property min value
 *     maxValue,        // opacity or other property max value
 *     stepMode,        // is true action(bool), is false action(0~1)
 *     action           // function handler your self
 *     fadeToTime,      // fade to time 0.6
 */

function com_Angel(params) {
    this.name = 'com_Angel';

    Object.assign(this, params);
    
    g = params.game || Game.instance;
    this.controller = params.controller || g.controller;
    this.camera = g.controller.object;

    params.friends = params.friends || [];

    this.friends = [].concat(params.friends);

    this.direction = params.direction;

    this.min = params.min || .85;
    this.max = params.max || .92;

    this.fadeToTime = utils.fmg(params, 'fadeToTime', .6);

    this.action = params.action;
    this.isIn = undefined;
    this.stepMode = params.stepMode;

    this.minValue = params.minValue || 0;
    this.maxValue = params.maxValue || 1;

    this.mats = [];

    this.horizontalOnly = params.horizontalOnly;

};

// Start
com_Angel.prototype.start = function() {
    console.log(this.name, 'start');
    // collect materials
    cm(this);

    if (!this.direction) {
        this.updateDirection();
    }
};

com_Angel.prototype.updateDirection = function() {
    var from = this.object.getWorldPosition().clone();
    var to = this.controller.target.clone();

    if (this.directionInverse) {
        this.direction = from.sub(to).normalize();
    } else {
        this.direction = to.sub(from).normalize();
    }

    if (this.horizontalOnly) {
        this.direction = new THREE.Vector3(this.direction.x, 0, this.direction.z).normalize();
    }
};

var cm = function(f) {
    f.mats = utils.collectMaterials(f.object);
    for (var i = 0; i < f.friends.length; i++) {
        var o = f.friends[i];
        f.mats = f.mats.concat(utils.collectMaterials(o));
    };
}

com_Angel.prototype.addFriends = function(friends) {
    this.friends = this.friends.concat(friends);
    cm(this);
};

// Update
com_Angel.prototype.update = function() {
    var s = this;
    delta = s.max - s.min;
    var dir = utils.getDirection(s.camera).normalize();

    if (s.horizontalOnly) {
        dir = new THREE.Vector3(dir.x, 0, dir.z).normalize();
    }

    var v = dir.dot(s.direction);

    function work(_b) {
        s.isIn = _b;
        if (s.action) {
            s.action(_b);
        } else {
            utils.fade(s.object, {
                mats: s.mats,
                min: s.minValue,
                max: s.maxValue,
                inout: _b,
                time: s.fadeToTime
            });
        }

        // 状态改变的回调
        if (s.onChanged) {
            s.onChanged(_b);
        }
    }

    var op = 1;
    if (v <= s.min) {
        op = s.minValue;                    
        if (s.stepMode && (s.isIn || s.isIn == undefined)) {
            work(false);
        }
    } else if (v >= s.max) {
        op = 1;
        if (s.stepMode && !s.isIn) {
            work(true);
        }
    } else {
        op = s.minValue + (v - s.min) / delta * ( 1- s.minValue );
        if (s.stepMode && !s.isIn) {
            work(true);
        }
    }

    if (!s.stepMode) {
        if (s.action) {
            s.action(op);
        } else {
            utils.setOpacity(s.mats, op);
        }
    }
};

module.exports = com_Angel;
