/**
 * Created by easyfrog on 2014/7/22.
 */

// Main NameSpace
// var fm = fm || {};

// Tween NameSpace
fm.Tween = {};

fm.Tween.easeInOutQuad = function(val) {
    val /= 0.5;
    var sta = 0;
    var end = 1;
    if (val < 1) return end / 2 * val * val + sta;
    val--;
    return -end / 2 * (val * (val - 2) - 1) + sta;
};

fm.Tween.easeInQuad = function(val) {
    var sta = 0;
    var end = 1;
    return end * val * val + sta;
};

fm.Tween.easeOutQuad = function(val) {
    var sta = 0;
    var end = 1;
    return -end * val * (val - 2) + sta;
};

fm.Tween.linear = function(val) {
    return val;
};

// easeOutBack
fm.Tween.easeOutBack = function(val) {
    var v = val - 1.0;
    return v * v * ((1.70158 + 1) * v + 1.70158) + 1.0;
};

fm.Tween.pingPongSin = function(val) {
    return Math.sin(val * Math.PI);
};

fm.Tween.pingPongLinear = function(val) {
    return (val > .5 ? 1 - val : val) * 2;
};

fm.Tween.kill = function(id) {
    clearInterval(id);
};

fm.Tween.fadeTo = function(time,todo,cvFunc,over,update) {
    if(cvFunc == null) cvFunc = fm.Tween.easeOutQuad;

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

                // force update map update_
                if (fm.Tween.map) {
                    fm.Tween.map.forceUpdate();
                }

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

fm.Tween._getValue = function(prop, arr, target, attr) {
    var res = {
        obj: target,
        prop: prop,
        old: target[prop]
    };

    if (typeof res.old == 'number') {
        res.delta = attr[prop] - target[prop];
    } else if (res.old instanceof fm.Vector3 || res.old instanceof fm.Color || res.old instanceof fm.Quaternion) {
        res.old = res.old.clone();
        res.delta = attr[prop].clone();
    }

    arr.push(res);
}

fm.Tween._setValue = function(target, oldValue, f) {
    var old   = oldValue.old;
    var prop  = oldValue.prop;
    var delta = oldValue.delta;

    if (typeof old == 'number') {
        target[prop] = old + f * delta;
    } else if (old instanceof fm.Vector3 || old instanceof fm.Color) {
        target[prop].copy(old.clone().lerp(delta, f));
    } else if (old instanceof fm.Quaternion) {
        target[prop].copy(old.clone().slerp(delta, f));
    }
}

fm.Tween.action = function(target,time,attr,cvFunc,over,update) {
    var oldValue = [];

    for(var i in attr) {
        // oldValue.push({prop:i,old:target[i],delta:(attr[i] - target[i])});
        fm.Tween._getValue(i, oldValue, target, attr)
    }
    
    // 动作
    var _id = fm.Tween.fadeTo(time,function(f) {
        for(var i = 0;i < oldValue.length;i ++ ) {
            // target[oldValue[i].prop] = oldValue[i].old + f * oldValue[i].delta;
            fm.Tween._setValue(target, oldValue[i], f);
        } 
    },cvFunc,over,update);

    return _id;
};

fm.Tween.actionArray = function(targets,time,attr,cvFunc,over,update) {
    var oldValue = [];

    for(var i in attr) {
        for (var target in targets) {
            fm.Tween._getValue(i, oldValue, targets[target], attr);
        }
    }
    
    var _id = fm.Tween.fadeTo(time,function(f) {
        for(var i = 0;i < oldValue.length;i++) {
            var item = oldValue[i];
            fm.Tween._setValue(item.obj, item, f);
        }
    },cvFunc,over,update);

    return _id;
};

fm.Tween.actionArrayProps = function(targets,time,attrs,cvFunc,over,update) {
    var all = [];

    for(var i in targets) {
        var oldValue = [];
        for(var j in attrs[i]) {
            // oldValue.push({prop:j,old:targets[i][j],delta:(attrs[i][j] - targets[i][j])});
            fm.Tween._getValue(j, oldValue, targets[i], attrs[i]);
        }
        all.push(oldValue);
    }
    
    var _id = fm.Tween.fadeTo(time,function(f) {
        for(var i in targets) {
            for(var j in all[i]) {
                // targets[i][all[i][j].prop] = all[i][j].old + f * all[i][j].delta;
                fm.Tween._setValue(targets[i], all[i][j], f);
            }
        }
    },cvFunc,over,update);

    return _id;
};

fm.Tween.transformTo = function(from, to, time, cv, over, update) {
    cv = cv || fm.Tween.easeOutQuad;

    var qm = new THREE.Quaternion();
    var qa = from.quaternion.clone();
    var qb = to.quaternion;

    time = time || 1;
    fm.Tween.actionArrayProps([from.position], time, 
       [{
            x:to.position.x,
            y:to.position.y,
            z:to.position.z     
       }], cv, function() {
            if (over) {
                over();
            }
       }, function(f) {
            THREE.Quaternion.slerp(qa, qb, qm, f);
            from.quaternion.set(qm.x, qm.y, qm.z, qm.w);
            if (update) {
                update(f);
            }
    });
};

