import { equal } from "assert";
import { html, render } from "lit-html";
import { of, Subject } from "rxjs";
import { rxReplace } from "../src/rxReplace";
import { cleanHtml, watchObservable } from "./utils";

describe("rxReplace", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement("div");
        window.document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    it("updating value using mapper", () => {
        const input = new Subject();

        render(
            html`${rxReplace(
                input,
                val => 
                    html`<span>${val}</span>`
            )}`, 
            container
        );
        
        equal(
            cleanHtml(container.innerHTML),
            '<dom-lifecycle-hook></dom-lifecycle-hook>'
        )

        input.next(1);
        equal(
            cleanHtml(container.innerHTML), 
            '<dom-lifecycle-hook></dom-lifecycle-hook><span>1</span>'
        )

        input.next(2);
        equal(
            cleanHtml(container.innerHTML), 
            '<dom-lifecycle-hook></dom-lifecycle-hook><span>2</span>'
        )
    })

    it("unsubscribed when observable no longer used", () => {
        const subject = new Subject()
        const observable1 = watchObservable(subject)
        const observable2 = watchObservable(subject)
        
        render(
            html`${rxReplace(observable1)}`, 
            container
        );

        equal(observable1.activeSubscribers, 1, 'did not subscribe to first observable')

        render(
            html`${rxReplace(observable2)}`, 
            container
        );

        equal(observable2.activeSubscribers, 1, 'did not subscribe to second observable')
        equal(observable1.activeSubscribers, 0, 'did not unsubscribe from first observable')

        render(html``, container);

        equal(observable2.activeSubscribers, 0, 'did not unsubscribe from second observable')
    })
});
