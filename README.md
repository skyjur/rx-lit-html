# rx-lit-html

[lit-html](https://lit-html.polymer-project.org) directives for [rx-js](https://rxjs-dev.firebaseapp.com/)

## rxReplace and rxAppend

Version of [`asyncAppend` and `asyncReplace`](https://lit-html.polymer-project.org/guide/template-reference#asyncappend-and-asyncreplace) made to take Observable over iterable.

`rxReplace` and `rxAppend` take optional 2nd parameter: function that will transform emitted value.

```js
const numbers = interval(1000)

html`${rxReplace(numbers), (num) => html`Last number was: ${num}`}`

html`First 5 numbers: 
    <ul>
        ${rxAppend(numbers.take(5), (num) => html`<li>${num}</li>`)}`
    </ul>
`
```

When `rxReplace` or `rxAppend` is updated with a different observable, previous observable is unsubscribed
imidiatelly but previously rendered node is not removed until new event arrives in new observable.

```js
// Renders "Hello!" in container:
render(html`${rxReplace(of(html`<p>Hello!</p>`)), container}`

// "Hello!" stays in continer, because observable NEVER does not emit anything:
render(html`${rxReplace(NEVER), container}`
```

If HTML nodes are removed by any means of html modifications that come from above `rxAppend` and `rxReplace` will do the right thing and unsubscribe
from observables:

```js
// rxReplace calls observable.subscribe():
render(html`${rxReplace(observable)}`, container)

// rxReplace calls unsubscribe on previous subscription:
render(html``, container)
```

This is achieved through injection of custom html element that implements `disconnectedCallback()`. HTML nodes produced by observable are comes under not within this custom element so are not shaddowed by this elemnt.

```js
render(
    html`${rxReplace(of(html`<p>Hello!</p>`))}`,
    document.getElementById('container')
)
```

produces following html:

```html
<div id="container">
    <dom-lifecycle-hook></dom-lifecycle-hook>
    <p>Hello!</p>
</div>
```

These additional nodes could add up to certain overhead if `rxAppend/rxReplace` are used
unspringly. However idea is that since `lit-html` is already very fast when it comes to updating
html there is little reason to bind every tiny bit in document to observables so advice would be to use fewer of `rxReplace/rxAppend` and on larger chunks of html over every small tiny bit.
