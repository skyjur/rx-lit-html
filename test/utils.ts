import { Observable } from "rxjs";

export function cleanHtml(value: string) {
    return value.replace(/<!---->/g, '')
}

class WatchedObservable<T> extends Observable<T> {
    subscribedCount = 0
    unsubscribedCount = 0
    activeSubscribers = 0
}

export function watchObservable<T>(input: Observable<T>): WatchedObservable<T> {
    const observable = new WatchedObservable<T>((subscriber) => {
        const sub = input.subscribe(subscriber)
        observable.activeSubscribers += 1
        observable.subscribedCount += 1
        return () => {
            observable.activeSubscribers -= 1
            observable.unsubscribedCount += 1
            sub.unsubscribe()
        }
    })
    return observable
}