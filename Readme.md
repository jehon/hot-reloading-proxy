# Not maintained (2021-03-07)
Sorry, I don't have time to maintain this anymore. If someone want to take it over, please contact me.

# Hot-reloading-proxy

Inspired from https://github.com/JJJYY/http-live-server

When developping html page, you often want to reload your browser every time a page is modified.

Some great solutions exists, but often, they implies to use their own webserver or to server modified pages.

This solution propose to place an independant proxy between your 'official' server (--remote option) and
your browser. This proxy will inject some code in each 'text/html' page that flow by, to enable them
with hot reloading capabilities.

To select when to reload, the server himself will watch local files (--watch and --ignore options).

That's all!

## Install

With local install from npmjs:

```lang=js
    npm install -D hot-reloading-proxy
```

With global install

```lang=js
    npm install -g hot-reloading-proxy
```


## Run

With local install, in a package.json script

```lang=js
    scripts: {
        # Default config
        "watch": "hot-reloading-proxy"

        # Advanced config
        "watch": "hot-reloading-proxy --remote http://localhost:3000 --watch ."
    }
```

With global install

```lang=js
    hot-reloading-proxy --remote http://localhost:3000 --watch .
```

## Configure

In default config, the hot-reloading-proxy will remote localhost on port 3000, and watch for all files
except "node_modules" folder.

Other options:

|option    | description | default value    |
|----------|-------------|------------------|
|--remote  | the remote host to be proxied |http://localhost:3000
|--port    | the port on which the service is available | 3001
|--watch   | (once or multiple times)<br> set the folders to be watched | .
|--ignore  | (once or multiple times)<br>set some folders to be ignored in the watch list | 'node_modules'
|--verbose | increase verbosity | - |
|--quiet   | reduce verbosity | - |

## Use it as a module

```lang=javascript
#!/usr/bin/env node
/* eslint-env node */

const hotReloadingProxy = require('hot-reloading-proxy/server');

hotReloadingProxy.start({
	port: 3000,
	remote: 'http://localhost:3001'
});

/* and now, do your own stuff, like starting your own server on 3001 */
/* example: call you original server.js: require('./server.js') */
```

The start take options:

	wsPath: 
    watch: array of path to watch for
    ignore:


## Changelog

v1.0.2:
    - Enable using hot-reloading-proxy as a module
    - Dev: factorize the default configuration
