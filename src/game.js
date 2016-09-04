/**
 * Game class
 */
function Game(container, config) {
    var s = this;

    // event
    Evento.convert(s);

    this.config = config || {}
    this.config.debug = this.config.debug == undefined ? true : this.config.debug;
    s.container = container;

    // create a WebGL Renderer
    s.renderer = s.createRenderer({
        container: s.container
    });

    s.camera = new THREE.PerspectiveCamera((config.fov || 45), s.container.offsetWidth / s.container.offsetHeight, 1, 10000);
    s.currentCamera = s.camera;
    s.scenes = [];

    s.clock = new THREE.Clock();
    s.lazyUpdateRate = this.config.lazyUpdateRate || 15;

    // 默认Scene
    s.scenes.push(new THREE.Scene());
    s.sceneID = 0;

    s.controller = new THREE.OrbitControls(s.camera, container);
    s.controller.rotateSpeed = .3;

    s.rayCast = new THREE.Raycaster();
    s.pause = false;

    // component
    s.components = [];

    // singleton
    if (!Game.instance) {
        Game.instance = this;
    }

    s.custormRenderFunction = null;

    // size
    s.resize();

    // 添加事件
    s._addEvents();

    // update event
    s.update();
};

Game.prototype = {
    constructor: Game,

    get deltaTime() {
        return this.clock.getDelta();
    },

    get currentScene() {
        return this.scenes[this.sceneID];
    },

    createRenderer: function(ps) {
        var renderer = new THREE.WebGLRenderer({antialias: true, alpha: (ps.alpha == undefined || true)});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(ps.width, ps.height);
        renderer.autoClear = ps.autoClear;
        if (ps.container) {
            ps.container.appendChild(renderer.domElement);
        }
        return renderer;
    },

    addScene: function() {
        var scene = new THREE.Scene()
        scene.sceneID = this.scenes.length;
        this.scenes.push(scene);
        return scene;
    },

    getScene: function(index) {
        return this.scenes[index];
    },

    getObject: function(name, sceneID) {
        if (sceneID == undefined) {
            sceneID = 0;
        }

        return this.scenes[sceneID].getObjectByName(name);
    },

    /**
     * 指定物体(组), 来播放指定的动画
     */
    playAnimation: function(objects, animationName, timeScale, whenFirstComplete, retainPos) {
        animationName = animationName || 'general';
        timeScale = timeScale || 1;

        // objects = objects || Game.instance.sea.meshes;
        if (!(objects instanceof Array)) {
            objects = [].concat(objects);
        }
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var anim = obj.animator;
            if (anim) {
                var clip = anim.animationsData[animationName];
            }

            if (anim && clip) {
                if (i == 0) {
                    var oldAnimComplete = clip.onComplete;
                    clip.onComplete = function() {
                        if (whenFirstComplete) {
                            whenFirstComplete();
                        }
                        clip.onComplete = oldAnimComplete;
                    };
                }

                anim.timeScale = timeScale;

                offset = retainPos && anim.currentAnimationAction ? anim.currentAnimationAction.time : undefined;
                anim.play(animationName, 0, offset);
            }
        };
    },

    // 得到拾取的屏幕点
    _getPick: function(e) {
        var rect = this.containerRect;
        var res = new THREE.Vector2();

        res.x = (((e.touches ? e.touches[0].clientX : e.clientX) - rect.left) / rect.width) * 2 - 1;
        res.y = -(((e.touches ? e.touches[0].clientY : e.clientY) - rect.top) / rect.height) * 2 + 1;

        return res;
    },

    _log: function(eventType, message) {
        if (this.config.debug) {
            console.log('-->', eventType.toUpperCase(), ':', message);
        }
    },

    _addEvents: function() {
        var _lastMousePick, curMouse, lastMouse;

        function onKeyDown(e) {
            this.invokeComponent('onKeyDown', e);
            this.emit('keydown', e);
            this._log('keydown', e);
        }

        function onKeyUp(e) {
            this.invokeComponent('onKeyUp', e);
            this.emit('keyup', e);
            this._log('keyup', e);
        }

        function onMouseDown(e) {
            e.preventDefault();
            this.isMouseDown = true;
            _lastMousePick = this._getPick(e);
            lastMouse = _lastMousePick;

            this.currentPicked = this.getPickObject(_lastMousePick);
            lastMouse = curMouse = _lastMousePick;

            this.invokeComponent(this.currentPicked, 'onMouseDown', e);
            this.emit('mousedown', e);
        }

        function onMouseMove(e) {
            e.preventDefault();
            curMouse = this._getPick(e);

            if (lastMouse) {
                this.mouseMovement = curMouse.clone().sub(lastMouse);
                lastMouse = curMouse;
            }

            this.invokeComponent(this.currentPicked, 'onMouseMove', e);
            this.emit('mousemove', e);
        }

        function onMouseUp(e) {
            e.preventDefault();

            this.invokeComponent(this.currentPicked, 'onMouseUp', e);
            this.emit('mouseup', e);

            if (!e.touches) {
                curMouse = this._getPick(e);
            }

            if ((e.button == 0 || e.touches) && _lastMousePick.distanceTo(curMouse) < .004) {
                if (this.currentPicked) {
                    this.invokeComponent(this.currentPicked, 'onPicked');
                    this.emit('picked', this.currentPicked);
                    this._log('picked', this.currentPicked);
                }
            }
            this.isMouseDown = false;
        }

        return function() {
            var s = this;
            // Mouse && Touch
            s.container.addEventListener('mousedown', onMouseDown.bind(s), false);
            s.container.addEventListener('mousemove', onMouseMove.bind(s), false);
            s.container.addEventListener('mouseup', onMouseUp.bind(s), false);
            s.container.addEventListener('touchstart', onMouseDown.bind(s), false);
            s.container.addEventListener('touchmove', onMouseMove.bind(s), false);
            s.container.addEventListener('touchend', onMouseUp.bind(s), false);

            // Key
            document.addEventListener('keydown', onKeyDown.bind(s), false);
            document.addEventListener('keyup', onKeyUp.bind(s), false);
        }
    }(),

    getPickObject: function(mouse, objects) {
        var s = this;
        s.rayCast.setFromCamera(mouse, s.camera);

        var intersects = s.rayCast.intersectObjects((objects || s.scenes[s.sceneID].children), true);
        for (var i = 0; i < intersects.length; i++) {
            var intersect = intersects[i];
            if (intersect.mouseEnabled == undefined || object.mouseEnabled) {
                return intersect.object;
            }
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

            if (s.pause) {
                return;
            }

            var deltaTime = s.deltaTime;
            s.invokeComponent(s, 'update', deltaTime);
            s.emit('update', deltaTime);

            if (cnt == s.lazyUpdateRate) {
                cnt = 0;
                s.emit('lazyUpdate');
            }

            s.renderer.clear();

            if (s.custormRenderFunction) {
                s.custormRenderFunction(deltaTime);
            } else {
                s.defaultRender();
            }
        }
    }(),

    defaultRender: function() {
        this.renderer.render(this.scenes[this.sceneID], this.currentCamera);
    },

    resize: function() {
        var s = this;
        s.containerRect = s.container.getBoundingClientRect();

        s.width = s.container.offsetWidth;
        s.height = s.container.offsetHeight;

        s.renderer.setSize(s.width, s.height);
        s.renderer.setPixelRatio(window.devicePixelRatio || 1);

        s.camera.aspect = s.width / s.height;
        s.camera.updateProjectionMatrix();
    },

    invokeComponent: function(object, comName, params) {
        if (!object || !object.components) {
            return;
        }
        for (var i = 0; i < object.components.length; i++) {
            var com = object.components[i];
            if (!com.enabled) {
                continue;
            }
            if (com[comName]) {
                com[comName](param);
            }
        }
    },
};