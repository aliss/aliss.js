# aliss.js

> ALISS (A Local Information System for Scotland) is a service to help you find help and support close to you when you need it most.

[`aliss.js`](https://github.com/aliss/aliss.js/tree/master/dist) is a javascript plugin for anyone who wants to embed ALISS search on their own site.

## Install

1. <a href="https://raw.githubusercontent.com/aliss/aliss.js/master/dist/aliss.js" download>Download `aliss.js`</a>

2. Include the script on the header of the page where you want to use the plugin.

```
<script src="aliss.js"></script>
```

3. Create an HTML element on the page where you want to see the plugin appear

```
<div id="aliss-target"></div>
```

4. Put this at the footer of the page with the new element

```
<script>
window.aliss = new ALISS('#aliss-target',{});
</script>
```


## Install with Wordpress

1. Install the ["Insert Headers and Footers"](https://wordpress.org/plugins/insert-headers-and-footers/) wordpress plugin, or similar plugin which allows you to insert HTML `<script>` tags.

2. Upon activation, visit the `Settings » Insert Headers` and Footers page. You will see two boxes, one for the header and the other for the footer section.

3. Follow the (install instructions above)[#install].


### Options

`ALISS(target,options)` - takes two parameters, a target, and an options object.

Potential options are:

```
{
  "q": <string: a default keyword, defaults to blank>,
  "category": <string: category slug, defaults to blank>,
  "show_category_select": <boolean: whether to display the category selector, defaults to true>,
  "show_keyword_search": <boolean: whether to display the keyword input, defaults to true>,
  "page_size": <int: number of services returned per page, defaults to 10>,
}
```

You can find the full list of categories including slugs via the [ALISS API](https://www.aliss.org/api/v4/categories/).


#### Examples

Hide the category select and confine service results to the "money" category:

```
window.aliss = new ALISS('#aliss-target', { category: "money", show_category_select: false });
```


## Demo

You can find [example code](https://glitch.com/~aliss-js), and a [demo](https://aliss-js.glitch.me/) on glitch.com.


## Plugin Development

PRs welcome!

Edit `src/aliss.js`, then build for production by running webpack cli:

`npx webpack --config webpack.config.js`


## Links

- Production site: https://www.aliss.org
- Search API endpoint (v3): https://www.aliss.org/api/v3/search/
- API docs: http://docs.aliss.org
- API docs repo: https://github.com/aliss/Docs
