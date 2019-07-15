type Initializer = () => Destructor;
type Destructor = () => void;

class DOMLifecycleHookElement extends HTMLElement {
  public static create(initializer: Initializer): DOMLifecycleHookElement {
    const elm = document.createElement("dom-lifecycle-hook") as DOMLifecycleHookElement;
    elm.initializer = initializer;
    return elm;
  }

  public initializer?: Initializer
  private destructor?: Destructor;

  public connectedCallback() {
    if(this.initializer) {
      this.destructor = this.initializer();
    }
  }

  public disconnectedCallback() {
    if (this.destructor) {
      this.destructor();
    }
  }
}

if(typeof window.customElements === 'undefined') {
  document.write('<script src="//unpkg.com/document-register-element"></script>');
}

window.customElements.define("dom-lifecycle-hook", DOMLifecycleHookElement);

export { DOMLifecycleHookElement };
