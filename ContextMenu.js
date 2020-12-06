// Written by Gary Antier 2020
// Current version: 1.2.0.1

const ContextMargin = 3;
const ContextTopOffset = 7;

class ContextMenuOption {
    constructor(label) {
        this.label = label;
        this.callbacks = [];

        this.enableChallenge = () => true;
        this.visibleChallenge = () => true;
    }

    onClick(callback) {
        this.callbacks.push(callback);
    }

    visible(challenge) {
        this.visibleChallenge = challenge;
    }

    enable(challenge) {
        this.enableChallenge = challenge;
    }

    draw(data) {
        let option;
        let visible = this.visibleChallenge(data);
        let enable = this.enableChallenge(data);

        if (visible) {
            option = syn.create("button");

            option.text(this.label)
                .addClass("core-context-action")
                .enable(enable);

            option.click(e => {
                this.callbacks.forEach(c => c(data));
            });
        }

        return option;
    }
}

class ContextMenu {
    constructor(id, root) {
        this.id = id;
        this.root = syn.wrap(root);
        this.options = [];
        this.data = [];
    }

    addOption(option) {
        this.options.push(option);
    }

    addOptions(...options) {
        options.forEach(o => this.options.push(o));
    }

    draw(dataIndex) {
        let data = this.data[dataIndex];
        let options = [];

        this.options.forEach(o => {
            options.push( o.draw(data) );
        });

        return options;
    }

    addData(data) {
        return this.data.push(data) - 1;
    }

    clearData() {
        this.data = [];
    }
}

class ContextMenuGlobal {
    constructor() {
        this.element = syn.create("div");
        this.menus = {};

        this.activeTrigger;
        this.triggerTop;
        this.triggerLeft;

        this.init();
        this.initEventListeners();
    }

    init() {
        this.element.addClass("core-context");
        syn.body.append(this.element);

        Node.prototype.addContext = function(context, data) {
            let dataIndex = context.addData(data);
            syn.wrap(this)
                .data("context-id", context.id)
                .data("index", dataIndex);

            return this;
        }
    }

    initEventListeners() {
        syn.document.on("contextmenu", e => this.onContext(e));
        syn.document.click(e => this.onClick(e));
    }

    addMenu(id, root) {
        let menu = new ContextMenu(id, root);
        this.menus[id] = menu;

        return menu;
    }

    onContext(e) {
        let target = syn.wrap(e.target);
        if (target.nodeName === "TD") {
            target = target.parent;
        }

        let contextId = target.data("context-id");
        let dataIndex = target.data("index");
        if(contextId) {
            e.preventDefault();

            this.reset();
            this.activeTrigger = target;
            this.triggerTop = e.clientY;
            this.triggerLeft = e.clientX;

            this.show(contextId, dataIndex);
            target.addClass("active");
        }
    }

    onClick(e) {
        if (e.target.isSameNode(this.element.self) == false) {
            this.reset();
        }
    }

    show(contextId, dataIndex) {
        let element = this.element;
        let menu = this.menus[contextId];

        let options = menu.draw(dataIndex);
        options.forEach(o => {
            if (o) {
                element.append(o)
            }
        });

        // Bounds...
        let root = menu.root;
        let rootTop = root.boundsTop + ContextMargin;
        let rootRight = root.boundsRight - ContextMargin;
        let rootBottom = root.boundsBottom - ContextMargin;
        let rootLeft = root.boundsLeft + ContextMargin;

        // Contexts...
        let contextTop = this.triggerTop - ContextTopOffset;
        let contextLeft = this.triggerLeft;
        let contextBottom = contextTop + element.boundsHeight;
        let contextRight = contextLeft + element.boundsWidth;

        // X-limit bounds.
        if (contextLeft < rootLeft) {
            contextLeft = rootLeft;
        } else if (contextRight > rootRight) {
            contextLeft = rootRight - element.boundsWidth;
        }

        // Y-limit bounds.
        if (contextTop < rootTop) {
            contextTop = rootTop;
        } else if (contextBottom > rootBottom) {
            contextTop = rootBottom - element.boundsHeight;
        }

        element.addClass("active");
        element.self.style.top = `${contextTop}px`;
        element.self.style.left = `${contextLeft}px`;
    }

    reset() {
        this.element.empty();
        this.element.removeClass("active");
        this.element.attr("style", "");
        this.activeTrigger?.removeClass("active");

        this.activeTrigger = undefined;
        this.triggerTop = undefined;
        this.triggerLeft = undefined;
    }
}

const globalContext = new ContextMenuGlobal();