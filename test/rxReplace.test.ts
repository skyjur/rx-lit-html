import { equal } from "assert";
import { html, render } from "lit-html";
import { NEVER, Observable, of, Subject } from "rxjs";
import { rxReplace } from "../src/rxReplace";
import { cleanHtml, watchObservable } from "./utils";

describe("rxReplace", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.style.display = "none";
    window.document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("text value is escaped", () => {
    render(
      html`
        ${rxReplace(of("<hack>text</hack>"))}
      `,
      container
    );
    equal(
      cleanHtml(container.innerHTML),
      "<dom-lifecycle-hook></dom-lifecycle-hook>&lt;hack&gt;text&lt;/hack&gt;"
    );
  });

  it("html value is rendered as html", () => {
    render(
      html`
        ${rxReplace(
          of(
            html`
              <span>html</span>
            `
          )
        )}
      `,
      container
    );
    equal(
      cleanHtml(container.innerHTML),
      "<dom-lifecycle-hook></dom-lifecycle-hook><span>html</span>"
    );
  });

  it("previous value is replaced", () => {
    const subject = new Subject();
    render(
      html`
        ${rxReplace(subject)}
      `,
      container
    );
    subject.next("one");
    subject.next("two");
    equal(
      cleanHtml(container.innerHTML),
      "<dom-lifecycle-hook></dom-lifecycle-hook>two"
    );
  });

  it("old observable is replaced by new observable", () => {
    const first = new Subject();
    render(
      html`
        ${rxReplace(first)}
      `,
      container
    );
    render(
      html`
        ${rxReplace(of("second"))}
      `,
      container
    );
    first.next("first");
    equal(
      cleanHtml(container.innerHTML),
      "<dom-lifecycle-hook></dom-lifecycle-hook>second"
    );
  });

  it("previous value is maintained when new observable is empty", () => {
    render(
      html`
        ${rxReplace(of("first"))}
      `,
      container
    );
    render(
      html`
        ${rxReplace(NEVER)}
      `,
      container
    );
    equal(
      cleanHtml(container.innerHTML),
      "<dom-lifecycle-hook></dom-lifecycle-hook>first"
    );
  });

  it("value is rendered using mappper", () => {
    const mapper = (val: any) =>
      html`
        <span>mapper: ${val}</span>
      `;
    render(
      html`
        ${rxReplace(of(1), mapper)}
      `,
      container
    );
    equal(
      cleanHtml(container.innerHTML),
      "<dom-lifecycle-hook></dom-lifecycle-hook><span>mapper: 1</span>"
    );
  });

  it("unsubscribed when removed", () => {
    const observable = watchObservable(NEVER);

    render(
      html`
        ${rxReplace(observable)}
      `,
      container
    );
    render(html``, container);

    equal(observable.subscribedCount, 1, "did not subscribe");
    equal(observable.unsubscribedCount, 1, "did not unsubscribe");
  });

  it("nested replacement", () => {
    const input = of(
      html`
        shallow, ${rxReplace(of("deep"))}
      `
    );

    render(
      html`
        ${rxReplace(input)}
      `,
      container
    );

    equal(
      cleanHtml(container.innerHTML),
      "<dom-lifecycle-hook></dom-lifecycle-hook>shallow, <dom-lifecycle-hook></dom-lifecycle-hook>deep"
    );
  });

  it("unsubscribed when replaced with new observable", () => {
    const observable = watchObservable(NEVER);

    render(
      html`
        ${rxReplace(observable)}
      `,
      container
    );
    render(
      html`
        ${rxReplace(NEVER)}
      `,
      container
    );

    equal(observable.subscribedCount, 1, "did not subscribe");
    equal(observable.unsubscribedCount, 1, "did not unsubscribe");
  });
});
