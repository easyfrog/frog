window.utils = window.utils || {};


/**
 * 得到json中的属性,并设置默认值
 */
utils.fmg = function(obj, prop, val) {
    var _res;

    for (var i = 1; i < arguments.length - 1; i++) {
        _res = obj[arguments[i]]
        if ( _res != undefined) {
            return _res;
        }
    }

    return arguments[arguments.length - 1];
}

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

/**
 * 淡入淡出
 * inout: true 淡入 | false 淡出
 * params:
 *      min, max, inout
 */
utils.fade = function(obj, params) {
    if (obj) {
        clearInterval(obj.fadeid);
    }

    params = params || {};
    var mats = params.mats || utils.collectMaterials(obj);
    params.min = params.min || 0;
    params.max = params.max || 1;
    params.time = params.time || .6;
    if (params.inout == undefined) {
        params.inout = true;
    }

    var delta = params.max - params.min;

    obj.fadeid = Tween.fadeTo(params.time, function(t) {
        for (var i = 0; i < mats.length; i++) {
            var mat = mats[i];
            mat.transparent = true;
            // mat.alphaTest = 0;
            mat.opacity = params.inout ? (params.min + t * delta) : params.max - t * delta;
        };
    }, Tween.easeOutQuad, function() {
        delete obj.fadeid;
        if (params.callback) {
            params.callback();
        }
    });
};

/**
 * 设置物体及其所有子物体的透明度
 */
utils.setOpacity = function( mats, opacity ) {
    // var mats = utils.collectMaterials(obj);

    for (var i = 0; i < mats.length; i++) {
        var mat = mats[i];
        mat.transparent = true;
        mat.opacity = opacity;
    };
}

/**
 * 收集自身及所有子物体的材质
 */
utils.collectMaterials = function(obj) {
    var mats = [];

    // collect function
    function cm(o) {
        if (o.type && o.type != 'Dummy') {
            if (o.material) {
                if (o.material instanceof THREE.MultiMaterial) {
                    for (var i = 0; i < o.material.materials.length; i++) {
                        pushMat(o.material.materials[i]);
                    };
                } else {
                    pushMat(o.material);        
                }
            }
        }

        for (var j = 0; j < o.children.length; j++) {
            var c = o.children[j];
            cm(c);
        };
    }

    // invoke collect function
    cm(obj);

    function pushMat(mat) {
        if (mats.indexOf(mat) < 0) {
            mats.push(mat);
        }
    }

    return mats;
};


/**
 * 模拟 Unity3D C# 中的 coroutine
 * var cor = utils.coroutine();
 * cor.push(fun (cb), cor.wait(2), fun ...);
 * cor.next();  // for one by one 
 * cor.start(); // for sequence
 * cor.stop();
 * cor.resume();
 * cor.reset();
 */
 utils.coroutine = function() {
    return (new function() {
        // 任务组
        this.works        = [];
        this.isWorking    = false;
        this.done         = false;
        this.doneCallback = null;
        this.index        = -1;
        this.isStop       = false;

        // 添加任务
        this.push = function(works) {
            var w = arguments;
            for (var i = 0; i < w.length; i++) {
                this.works.push( w[i] );
            };
        };

        // 下一个
        this.next = function() {
            var s = this;
            if (s.isWorking) {
                return;
            }
            s.index += 1;
            var w = s.works[s.index];
            if (w) {
                s.isWorking = true;
                s.done = false;
                w(s.workComplete.bind(s));  // cb( bool ); true: continue false: stop
            }
        };

        // 完成work后,调用的方法
        this.workComplete = function( next ) {
            this.isWorking = false;

            if (next == undefined) {
                next = true;
            }
            
            if (this.index == this.works.length - 1) {
                this.done = true;
                this.index = -1;
                if (this.doneCallback) {
                    this.doneCallback();
                }
            } else if (next) {
                if (!this.isStop) {
                    this.next();
                }
            }
        };

        // wait for seconds
        this.wait = function( seconds ) {
            var s = this;
            return function() {
                setTimeout(function() {
                    s.workComplete();
                }, seconds * 1e3);
            }
        };

        // 开始序列
        this.start = function() {
            this.next();
        };

        // 停止序列
        this.stop = function() {
            this.isStop = true;
        };

        // 恢复序列
        this.resume = function() {
            this.isStop = false;
            this.next();
        };

        this.restart = function() {
            this.index = -1;
            this.isWorking = false;
            this.isStop = false;
            this.next();
        };

        // 清空
        this.reset = function() {
            this.index     = -1;
            this.isWorking = false;
            this.works     = [];
            this.isStop    = false;
        };
    });
};
