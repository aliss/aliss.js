# aliss.js

> ALISS (A Local Information System for Scotland) is a service to help you find help and support close to you when you need it most.

`aliss.js` is a javascript plugin for anyone who wants to embed ALISS search on their own site.

## Usage

1. Include the script on the page you want to use it

`<script src="aliss.js"></script>`

2. Create an HTML element on the page where you want to see the plugin appear

`<div id="aliss-target"></div>`

3. Create a script object, targetting it at the new element

```
<script>
window.aliss = new ALISS('#aliss-target',{});
</script>
```

### Example

You can find [example code](https://glitch.com/~aliss-js), and the [demo](https://aliss-js.glitch.me/) on glitch.com.

## Links

- Production site: https://www.aliss.org
- Search API endpoint (v3): https://www.aliss.org/api/v3/search/
- API docs: http://docs.aliss.org
- API docs repo: https://github.com/aliss/Docs