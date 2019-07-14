type Constructor = () => Destructor;
type Destructor = () => void;

class DOMLifecycleHookElement extends HTMLElement {
    private _destructor?: Destructor;

    constructor(private _constructor: Constructor) {
        super();
    }

    connectedCallback() {
        this._destructor = this._constructor();
    }

    disconnectedCallback() {
        if (this._destructor) {
            this._destructor;
        }
    }
}

customElements.define("dom-lifecycle-hook", DOMLifecycleHookElement);

export {
    DOMLifecycleHookElement
}
