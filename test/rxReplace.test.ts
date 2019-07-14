import { equal } from "assert";
import { html, render } from "lit-html";
import { of } from "rxjs";
import { rxReplace } from "../src/rxReplace";

describe("rxReplace", () => {
    let container: HTMLDivElement;
    let mutations: MutationRecord[] = [];

    beforeEach(() => {
        container = document.createElement("div");
        window.document.body.appendChild(container);
        new MutationObserver((newMutations) => {
            mutations.push(...newMutations);
        }).observe(container, {
            childList: true,
            subtree: true,
        });
    });

    afterEach(() => {
        container.remove();
        mutations.splice(0);
    });

    it("hello world", () => {
        const input = of("1", "2");
        render(html`${rxReplace(input)}`, container);
        console.log("mutations", mutations);
    });
});
