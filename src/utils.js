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