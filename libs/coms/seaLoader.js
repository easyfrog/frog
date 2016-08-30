require('../extra/loaders/sea3d/SEA3D');
require('../extra/loaders/sea3d/SEA3DLZMA');
require('../extra/loaders/sea3d/SEA3DLoader');

function SeaLoader(container) {
    Evento.convert(this);

    var self = this;
    this.sea = new THREE.SEA3D({
        container: container,
        autoPlay: false
    });

    this.sea.addEventListener('sea3d_progress', this.onProgress.bind(this));
    this.sea.addEventListener('sea3d_complete', this.onComplete.bind(this));

    this._container = container;

    // load work queue
    this.queue = [];
    this.isLoading = false;

    this.currentWork = null;
};

SeaLoader.prototype = {
    constructor: SeaLoader,

    get container() {
        return this._container;
    },

    set container(val) {
        this._container = val;
    },

    _getFromArray: function (arr, name) {
        if (!arr) {return null;}
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (item.name == name) {
                return item;
            }
        };
        return null;
    },

    getMesh: function(name) {
        return this._getFromArray(this.sea.meshes, name);
    },

    getDummy: function(name) {
        return this._getFromArray(this.sea.dummys, name);
    },

    getMaterial: function(name) {
        return this._getFromArray(this.sea.materials, name);
    },

    getLight: function(name) {
        return this._getFromArray(this.sea.lights, name);
    },

    getCubeMap: function(name) {
        return this._getFromArray(this.sea.cubemaps, name);
    },

    getCamera: function(name) {
        return this._getFromArray(this.sea.cameras, name);
    },

    getTexture: function(name) {
        return this._getFromArray(this.sea.textures, name);
    },

    _load: function(work) {
        var s = this;

        var gp = s.container.getObjectByName(work.groupName);
        if (!gp) {
            gp = new THREE.Group();
            gp.name = work.groupName;
            s.container.add(gp);
        }

        s.sea.container = gp;
        s.sea.load(work.url);
    },

    load: function(url, groupName, callback) {
        var s = this;
        if (typeof url == 'string') {
            s.queue.push({url: url, groupName: groupName, callback: callback});
        } else if (url instanceof Array) {
            url.forEach(function(itm) {
                if (typeof itm == 'string') {
                    s.queue.push({url: itm, groupName: groupName, callback: callback});
                } else if (typeof itm == 'object') {
                    s.queue.push(itm);
                }
            });
        } else if (typeof url == 'object') {
            s.queue.push(url);
        }

        if (!s.isLoading) {
            s.isLoading = true;
            s.currentWork = s.queue.shift();
            s._load(s.currentWork);
        }
    },

    onComplete: function() {
        if (this.currentWork.callback) {
            this.currentWork.callback(this.sea.container, this.queue.length);
        }

        if (this.queue.length > 0) {
            this.currentWork = this.queue.shift();
            this._load(this.currentWork);
        } else {
            this.isLoading = false;
            this.emit('complete');
        }
    },

    onProgress: function(event) {
        if (!isNaN(event.progress)) {
            this.emit('progress', {
                progress: (event.progress * 100).toFixed(1),
                type: event.type
            });
        }
    }
};

module.exports = SeaLoader;