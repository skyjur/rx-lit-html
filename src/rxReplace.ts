import { directive, NodePart, Part } from "lit-html";
import { Observable } from "rxjs";
import { DOMLifecycleHookElement } from "./DOMLifecycleHookElement";

type Mapper<T> = (v: T, index?: number) => unknown;

interface IState {
  subscriptionPart: NodePart;
  itemPart: NodePart;
}

const states = new WeakMap<NodePart, IState>();

/**
 * A directive that renders the items of an Observable[1], replacing
 * previous values with new values, so that only one value is ever rendered
 * at a time.
 *
 * [1]: https://rxjs-dev.firebaseapp.com/guide/observable
 *
 * @param value An Observable
 * @param mapper An optional function that maps from (value, index) to another
 *     value. Useful for generating templates for each item in the observable.
 */
export const rxReplace = directive(
  <T>(observable: Observable<T>, mapper?: Mapper<T>) => (part: Part) => {
    if (!(part instanceof NodePart)) {
      throw new Error("rxReplace can only be used as text or element nodes");
    }

    if (part.value === observable) {
      return;
    }

    part.value = observable;

    if (!states.has(part)) {
      const state = {
        itemPart: new NodePart(part.options),
        subscriptionPart: new NodePart(part.options)
      };
      state.subscriptionPart.appendIntoPart(part);
      state.itemPart.appendIntoPart(part);
      states.set(part, state);
    }

    const { subscriptionPart, itemPart } = states.get(part)!;

    let i = 0;

    subscriptionPart.setValue(
      DOMLifecycleHookElement.create(() => {
        const sub = observable.subscribe({
          next(v: any) {
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
