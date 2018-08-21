# aliss.js

> ALISS (A Local Information System for Scotland) is a service to help you find help and support close to you when you need it most.

[`aliss.js`](https://github.com/aliss/aliss.js/tree/master/dist) is a javascript plugin for anyone who wants to embed ALISS search on their own site.

## Usage

1. <a href="https://raw.githubusercontent.com/aliss/aliss.js/master/dist/aliss.js" download>Download `aliss.js`</a>

2. Include the script on the header of the page where you want to use the plugin.

```
<script src="aliss.js"></script>
```

3. Create an HTML element on the page where you want to see the plugin appear

```
<div id="aliss-target"></div>
```

4. Put this at the bottom of the page with the new element

```
<script>
window.aliss = new ALISS('#aliss-target',{});
</script>
```

**Example**

You can find [example code](https://glitch.com/~aliss-js), and a [demo](https://aliss-js.glitch.me/) on glitch.com.

### Options

`ALISS(target,options)` - takes two parameters, a target, and an options object.

Potential options are:

```
{
  "q": <string: a default keyword>,
  "category": <string: category slug>,
  "show_category_select": <boolean: whether to display the category selector>,
  "show_keyword_search": <boolean: whether to display the keyword input>,
  "page_size": <int: number of services returned per page>,
}
```

## Links

- Production site: https://www.aliss.org
- Search API endpoint (v3): https://www.aliss.org/api/v3/search/
- API docs: http://docs.aliss.org
- API docs repo: https://github.com/aliss/Docs