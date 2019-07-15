import { Observable } from "rxjs";

export function cleanHtml(value: string) {
  return value.replace(/<!---->/g, "");
}

class WatchedObservable<T> extends Observable<T> {
  public subscribedCount = 0;
  public unsubscribedCount = 0;
  public activeSubscribers = 0;
}

export function watchObservable<T>(input: Observable<T>): WatchedObservable<T> {
  const observable = new WatchedObservable<T>(subscriber => {
    const sub = input.subscribe(subscriber);
    observable.activeSubscribers += 1;
    observable.subscribedCount += 1;
    return () => {
      observable.activeSubscribers -= 1;
      observable.unsubscribedCount += 1;
      sub.unsubscribe();
    };
  });
  return observable;
}
