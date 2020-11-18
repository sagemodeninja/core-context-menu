class CoreUI {
    constructor() {
        this.data = [];
    }

    addData(data) {
        return this.data.push(data) - 1;
    }
}

const Core = new CoreUI();

class ContextMenuGlobal {
    constructor() {
        this.list = {};
        this.count = 1;
        this.activeContext = null;

        this.initEventListeners();

        return new Proxy(this, {
            set: (target, prop, value) => {
                target = prop in target ? target : target.list;
                target[prop] = value;

                return true;
            }
        });
    }

    initEventListeners() {
        document.addEventListener("contextmenu", e => this.onContext(e));
        document.addEventListener("click", e => this.onClick(e));
    }

    onContext(e) {
        let target = e.target;
        let contextId = target.getAttribute("data-context-id");

        if(ContextMenu.isContext(target) == false) {
            ContextMenu.reset();
        }

        if(contextId) {
            e.preventDefault();
            this.list[contextId].show(e);
        }
    }

    onClick(e) {
        if(ContextMenu.isContext(e.target) == false) {
            ContextMenu.reset();
        }
    }
}

const Contexts = new ContextMenuGlobal();

class ContextMenuAction {
    constructor(label, callback) {
        this.label = label;
        this.callback = callback;
    }

    draw(context) {
        let action = document.createElement("button");
        
        action.innerText = this.label;
        action.classList.add("core-context-action");

        action.addEventListener("click", e => this.callback(e));

        context.element.appendChild(action);
    }
}

class ContextMenu {
    constructor(config) {
        let element = document.createElement("div");
        document.body.appendChild(element);
        
        // Generate unique Id...
        let timestampId = new Date().getTime();
        let index = Contexts.count += 1;
        let contextId = timestampId + "." + index;
        this.contextId = contextId;
        Contexts[contextId] = this;
        
        element.classList.add("core-context");

        this.element = element;
        this.config = config;
        this.actions = [];
    }

    static isContext(target) {
        let classList = target.classList;
        
        return classList.contains("core-context") || 
               classList.contains("core-context-action");
    }
    
    static reset() {
        Contexts.activeContext?.reset();
        Contexts.activeContext = null;
    }

    get bounds() {
        return this.element.getBoundingClientRect();
    }

    get height() {
        return this.bounds.height;
    }

    get width() {
        return this.bounds.width;
    }

    addTrigger(e) {
        e.setAttribute("data-context-id", this.contextId);
    }

    addAction(config) {
        let action = new ContextMenuAction(config.label, config.callback);
        this.actions.push(action);
    }

    show(e) {
        let target = e.target;
        let dataIndex = parseInt( target.getAttribute("data-index") );
        let data = Core.data[dataIndex];

        console.log(dataIndex, data);

        let root = this.config.root;
        let margin = 3;
        let topOffset = 7;

        this.actions.forEach(action => action.draw(this));

        // Root bounds...
        let rootBounds = root.getBoundingClientRect();
        let rootTop = rootBounds.top + margin;
        let rootRight = rootBounds.right - margin;
        let rootBottom = rootBounds.bottom - margin;
        let rootLeft = rootBounds.left + margin;

        // Contexts...
        let contextTop = e.clientY - topOffset;
        let contextLeft = e.clientX;
        let contextBottom = contextTop + this.height;
        let contextRight = contextLeft + this.width;
        
        // X-limit bounds.
        if(contextLeft < rootLeft) {
            contextLeft = rootLeft;
        } else if(contextRight > rootRight) {
            contextLeft = rootRight - this.width;
        }
        
        // Y-limit bounds.
        if(contextTop < rootTop) {
            contextTop = rootTop;
        }else if(contextBottom > rootBottom) {
            contextTop = rootBottom - this.height;
        }

        this.position(contextTop, contextLeft);
        this.element.classList.add("active");
        Contexts.activeContext = this;
    }

    reset() {
        let element = this.element;        
        element.classList.remove("active");
        element.innerHTML = null;
        
        this.position(-this.height, -this.width);
    }

    position(top, left) {
        let style = this.element.style;
        
        style.top = top + "px";
        style.left = left + "px";
    }
}