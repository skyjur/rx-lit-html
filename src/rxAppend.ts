import { directive, html, NodePart, Part } from "lit-html";
import { Observable, Subscription } from "rxjs";
import { DOMLifecycleHookElement } from "./DOMLifecycleHookElement";

type Mapper<T> = (v: T, index?: number) => unknown;

interface IState {
  subscriptionPart: NodePart;
  listPart: NodePart;
}

const states = new WeakMap<NodePart, IState>();

/**
 * A directive that renders the items of an Observable[1], appending
 * new values.
 *
 * [1]: https://rxjs-dev.firebaseapp.com/guide/observable
 *
 * @param value An Observable
 * @param mapper An optional function that maps from (value, index) to another
 *     value. Useful for generating templates for each item in the observable.
 */
export const rxAppend = directive(
  <T>(observable: Observable<T>, mapper?: Mapper<T>) => (part: Part) => {
    if (!(part instanceof NodePart)) {
      throw new Error("rxAppend can only be used as nodes");
    }

    if (part.value === observable) {
      return;
    }

    part.value = observable;

    if (!states.has(part)) {
      const state: IState = {
        listPart: new NodePart(part.options),
        subscriptionPart: new NodePart(part.options)
      };
      part.clear();
      state.subscriptionPart.appendIntoPart(part);
      state.listPart.appendIntoPart(part);
      states.set(part, state);
    }

    const { subscriptionPart, listPart } = states.get(part)!;

    let i = 0;

    subscriptionPart.setValue(
      DOMLifecycleHookElement.create(() => {
        const sub = observable.subscribe({
          next(v: any) {
            if (i === 0) {
              // clear previous results if there are any
              listPart.clear();
            }
            const itemPart = new NodePart(part.options);
            itemPart.appendIntoPart(listPart);
            itemPart.setValue(mapper ? mapper(v, i) : v);
            itemPart.commit();
            i++;
          },
          error(e) {
            // tslint:disable-next-line: no-console
            console.error(e);
          }
        });

        return () => {
          sub.unsubscribe();
        };
      })
    );
    subscriptionPart.commit();
  }
);
