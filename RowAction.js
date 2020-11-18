class ActionButton {
    constructor(text, callback) {
        this.text = text;
        this.callbacks = callback ? [callback] : [];
    }

    addClickListener(callback) {
        this.callbacks.push(callback);
    }
}

class RowAction {
    constructor(template, data) {
        let container = document.createElement("div");

        template.forEach(action => {
            let button = document.createElement("button");
            container.appendChild(button);

            button.innerText = action.text;
            button.addEventListener("click", e => {
                action.callbacks.forEach(callback => callback(data, e));
            });
        });

        this.self = container;
        this.actions = template;
        this.data = data;
    }
}