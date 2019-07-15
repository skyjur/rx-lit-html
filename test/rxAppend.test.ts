import { equal } from "assert";
import { html, render } from "lit-html";
import { NEVER, of, Subject } from "rxjs";
import { rxAppend } from "../src/rxAppend";
import { cleanHtml, watchObservable } from "./utils";

describe("rxAppend", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    window.document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("appending text values", () => {
    const input = of("First", "Second");
    render(
      html`${rxAppend(input)}`,
      container
    );
    equal(
      cleanHtml(container.innerHTML),
      "<dom-lifecycle-hook></dom-lifecycle-hook>FirstSecond"
    );
  });

  it("appending html values", () => {
    const input = of(
      html`<span>First</span>`,
      html`<span>Second</span>`
    );
    render(
      html`${rxAppend(input)}`,
      container
    );
    equal(
      cleanHtml(container.innerHTML),
      "<dom-lifecycle-hook></dom-lifecycle-hook><span>First</span><span>Second</span>"
    );
  });

  it("appending values using value mapper", () => {
    const input = of(1, 2);
    const mapper = (val: any) =>
      html`<span>${val}</span>`;
    render(
      html`${rxAppend(input, mapper)}`,
      container
    );
    equal(
      cleanHtml(container.innerHTML),
      "<dom-lifecycle-hook></dom-lifecycle-hook><span>1</span><span>2</span>"
    );
  });

  it("previous values maintained after subscribing to new empty observable", () => {
    const input = of(
      html`<span>1</span>`
    );
    render(
      html`${rxAppend(input)}`,
      container
    );
    render(
      html`${rxAppend(NEVER)}`,
      container
    );
    equal(
      cleanHtml(container.innerHTML),
      "<dom-lifecycle-hook></dom-lifecycle-hook><span>1</span>"
    );
  });

  it("previous values replaced with new observable", () => {
    render(
      html`${rxAppend(
          of(html`<span>1</span>`)
        )}`,
      container
    );
    render(
      html`${rxAppend(
          of(html`<span>2</span>`)
        )}`,
      container
    );
    equal(
      cleanHtml(container.innerHTML),
      "<dom-lifecycle-hook></dom-lifecycle-hook><span>2</span>"
    );
  });

  it("unsubscribed when removed", () => {
    const observable = watchObservable(NEVER);

    render(
      html`${rxAppend(observable)}`,
      container
    );
    render(html``, container);

    equal(observable.subscribedCount, 1, "did not subscribe");
    equal(observable.unsubscribedCount, 1, "did not unsubscribe");
  });
});
