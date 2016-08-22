/**
 * Game class
 */
function Game(container, config) {
    var s = this;

    // event
    Evento.convert(s);

    s.container = container;

    s.renderer = new THREE.WebGLRenderer({antilias: true, alpha: true});
    s.renderer.autoClear = false;
    s.container.appendChild(s.renderer.domElement);

    s.containerRect = s.container.getBoundingClientRect();
    s.camera = new THREE.PerspectiveCamera(50, s.containerRect.width / s.containerRect.height, 1, 10000);
    s.scenes = [];

    s.clock = new THREE.Clock();
    s.lazyUpdateRate = 20;

    // 默认Scene
    s.scenes.push(new THREE.Scene());
    s.currentScene = s.scenes[0];

    s.controler = new THREE.OrbitControls(s.camera, container);

    s.rayCast = new THREE.Raycaster();
    // 添加事件
    s._addEvents();

    // update event
    s.update();
};

Game.prototype = {
    constructor: Game,

    // 得到拾取的屏幕点
    _getPick: function(e) {
        var rect = this.containerRect;
        var res = new fm.Vector2();

        res.x = (((e.touches ? e.touches[0].clientX : e.clientX) - rect.left) / rect.width) * 2 - 1;
        res.y = -(((e.touches ? e.touches[0].clientY : e.clientY) - rect.top) / rect.height) * 2 + 1;

        return res;
    },

    _addEvents: function() {
        var s = this;
        var _lastMousePick, curMouse, lastMouse;

        function onKeyDown(e) {
            s.emit('keydown', e);
        }

        function onKeyUp(e) {
            s.emit('keyup', e);
        }

        function onMouseDown(e) {
            e.preventDefault();
            s.isMouseDown = true;
            _lastMousePick = s._getPick(e);
            lastMouse = _lastMousePick;

            s.currentPicked = s.getPickObject(_lastMousePick);
            lastMouse = curMouse = _lastMousePick;

            s.emit('mousedown', e);
        }

        function onMouseMove(e) {
            e.preventDefault();
            curMouse = s._getPick(e);

            if (lastMouse) {
                s.mouseMovement = curMouse.clone().sub(lastMouse);
                lastMouse = curMouse;
            }

            s.emit('mousemove', e);
        }

        function onMouseUp(e) {
            e.preventDefault();

            s.emit('mouseup', e);

            if (!e.touches) {
                curMouse = getPick(e);
            }

            if ((e.button == 0 || e.touches) && _lastMousePick.distanceTo(curMouse) < 5) {
                if (s.currentPicked) {
                    s.emit('picked', s.currentPicked);
                }
            }
            s.currentPicked = null;
            s.isMouseDown = false;
        }

        return function() {
            // Mouse && Touch
            s.container.addEventListener('mousedown', onMouseDown, false);
            s.container.addEventListener('mousemove', onMouseMove, false);
            s.container.addEventListener('mouseup', onMouseUp, false);
            s.container.addEventListener('touchstart', onMouseDown, false);
            s.container.addEventListener('touchmove', onMouseMove, false);
            s.container.addEventListener('touchend', onMouseUp, false);

            // Key
            document.addEventListener('keydown', onKeyDown, false);
            document.addEventListener('keyup', onKeyUp, false);
        }
    }(),

    getPickObject: function(mouse, sceneID) {
        var s = this;
        s.rayCast.setFromCamera(mouse, s.camera);

        sceneID == undefined && (sceneID = 0);

        var intersects = s.rayCast.intersectObjects(s.scenes[sceneID]);
        if (intersects.length > 0) {
            return intersects[0];
        }
        return null;
    },

    update: function() {
        var cnt = 0;

        return function(once) {
            var s = this;
            if (!once) {
                requestAnimationFrame(s.update.bind(s, once));
                cnt ++;
            }

            if (cnt == s.lazyUpdateRate) {
                cnt = 0;
                s.emit('lazyUpdate');
            }

            s.emit('update', s.clock.getDelta());

            s.renderer.clear();
            s.renderer.render(s.currentScene, s.camera);
        }
    }(),

    resize: function() {
        var s = this;
        
    },
};