/**
 * Created by easyfrog on 2014/7/22.
 */

// Tween NameSpace
Tween = {};

Tween.easeInOutQuad = function(val) {
    val /= 0.5;
    var sta = 0;
    var end = 1;
    if (val < 1) return end / 2 * val * val + sta;
    val--;
    return -end / 2 * (val * (val - 2) - 1) + sta;
};

Tween.easeInQuad = function(val) {
    var sta = 0;
    var end = 1;
    return end * val * val + sta;
};

Tween.easeOutQuad = function(val) {
    var sta = 0;
    var end = 1;
    return -end * val * (val - 2) + sta;
};

Tween.linear = function(val) {
    return val;
};

// easeOutBack
Tween.easeOutBack = function(val) {
    var v = val - 1.0;
    return v * v * ((1.70158 + 1) * v + 1.70158) + 1.0;
};

Tween.pingPongSin = function(val) {
    return Math.sin(val * Math.PI);
};

Tween.pingPongLinear = function(val) {
    return (val > .5 ? 1 - val : val) * 2;
};

Tween.kill = function(id) {
    clearInterval(id);
};

Tween.fadeTo = function(time,todo,cvFunc,over,update) {
    if(cvFunc == null) cvFunc = Tween.easeOutQuad;

    var val = 0;
    var rate;
    var intervalID = 0;

    if(time == 0) {
        todo(1);
        if (update != undefined) { update(1); };
        // invoke complete function
        if(over != undefined) over();
    } else {
        // 这里需要使用闭包,因为如果同时调用多次此方法
        // lastTime 会被覆盖,造成动画时间计算不准确,动画出现跳动的问题
        (function() {
            var currentTime;
            var lastTime = Date.now();

            intervalID = setInterval(function() {
                currentTime = Date.now();
                val += (currentTime - lastTime) / 1000;
                lastTime = currentTime;

                if(val >= time) val = time;
                rate = val / time;
                // invoke todo function
                var _v = cvFunc(rate);
                todo(_v);

                // invoke update function
                if(update != undefined) update(_v);
                if(rate == 1) {
                    // clear interval function
                    clearInterval(intervalID);
                    // invoke complete function
                    if(over != null) over();
                }
            },1);
        })();
    }

    return intervalID;
};

Tween._getValue = function(prop, arr, target, attr) {
    var res = {
        obj: target,
        prop: prop,
        old: target[prop]
    };

    if (typeof res.old == 'number') {
        res.delta = attr[prop] - target[prop];
    } else if (res.old instanceof Vector3 || res.old instanceof Color || res.old instanceof Quaternion) {
        res.old = res.old.clone();
        res.delta = attr[prop].clone();
    }

    arr.push(res);
}

Tween._setValue = function(target, oldValue, f) {
    var old   = oldValue.old;
    var prop  = oldValue.prop;
    var delta = oldValue.delta;

    if (typeof old == 'number') {
        target[prop] = old + f * delta;
    } else if (old instanceof Vector3 || old instanceof Color) {
        target[prop].copy(old.clone().lerp(delta, f));
    } else if (old instanceof Quaternion) {
        target[prop].copy(old.clone().slerp(delta, f));
    }
}

Tween.action = function(target,time,attr,cvFunc,over,update) {
    var oldValue = [];

    for(var i in attr) {
        Tween._getValue(i, oldValue, target, attr)
    }
    
    // 动作
    var _id = Tween.fadeTo(time,function(f) {
        for(var i = 0;i < oldValue.length;i ++ ) {
            Tween._setValue(target, oldValue[i], f);
        } 
    },cvFunc,over,update);

    return _id;
};

Tween.actionArray = function(targets,time,attr,cvFunc,over,update) {
    var oldValue = [];

    for(var i in attr) {
        for (var target in targets) {
            Tween._getValue(i, oldValue, targets[target], attr);
        }
    }
    
    var _id = Tween.fadeTo(time,function(f) {
        for(var i = 0;i < oldValue.length;i++) {
            var item = oldValue[i];
            Tween._setValue(item.obj, item, f);
        }
    },cvFunc,over,update);

    return _id;
};

Tween.actionArrayProps = function(targets,time,attrs,cvFunc,over,update) {
    var all = [];

    for(var i in targets) {
        var oldValue = [];
        for(var j in attrs[i]) {
            Tween._getValue(j, oldValue, targets[i], attrs[i]);
        }
        all.push(oldValue);
    }
    
    var _id = Tween.fadeTo(time,function(f) {
        for(var i in targets) {
            for(var j in all[i]) {
                Tween._setValue(targets[i], all[i][j], f);
            }
        }
    },cvFunc,over,update);

    return _id;
};
