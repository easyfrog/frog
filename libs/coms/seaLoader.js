require('../extra/loaders/sea3d/SEA3D');
require('../extra/loaders/sea3d/SEA3DLZMA');
require('../extra/loaders/sea3d/SEA3DLoader');

function SeaLoader(container) {
    Evento.convert(this);

    this.sea = new THREE.SEA3D({
        container: container,
        autoPlay: false
    });

    this.sea.onComplete = this.onComplete.bind(this);
    this.sea.onProgress = this.onProgress.bind(this);

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

    _load: function(work) {
        var gp = this.container.getObjectByName(work.groupName);
        if (!gp) {
            gp = new THREE.Group();
            gp.name = work.groupName;
            this.container.add(gp);
        }

        this.sea.container = gp;
        this.sea.load(work.url);
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
            isLoading = true;
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