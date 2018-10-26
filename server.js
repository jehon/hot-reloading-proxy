#!/usr/bin/env node

require('colors');
const fs = require('fs');
const logger = require('morgan');
const path = require('path');
const httpProxy = require('express-http-proxy');
const chokidar = require('chokidar');

const app = require('express')();
const wsInstance = require('express-ws')(app);

let logLevel = 1;

const INJECTED_CODE = fs.readFileSync(path.join(__dirname, "injected.html"), "utf8");
const INJECT_CANDIDATES = [
	new RegExp("</body>", "i"), 
	new RegExp("</svg>"), 
	new RegExp("</head>", "i"),
	new RegExp("</html>", "i")
];

function injectIntoString(data) {
	for(const injectTag of INJECT_CANDIDATES) {
		if (injectTag.exec(data)) {
			return data.replace(injectTag, INJECTED_CODE + injectTag.source.replace("\\/", "/"));
		}
	}
	return data;
}

var HotReloadingProxy = {};

/**
 * Start with parameters given as an object
 * @param proxy {url} The server that will be proxied
 * @param port {number} Port number (default: 8080)
 * @param watch {array} Paths to exclusively watch for changes
 * @param ignore {array} Paths to ignore when watching files for changes
 * @param logLevel {number} 0 = errors only, 1 = some, 2 = lots
 */
HotReloadingProxy.start = function(options = {}) {
	// Make it global
	logLevel = options.logLevel;
	if (logLevel > 2) {
		console.log("Received options: ", options);
	}

	this.ws(options.wsPath);
	this.watch(options.wsPath, options.watch, options.ignore);
	this.serve(options.remote, options.port);
}

HotReloadingProxy.ws = function(wsPath) {
	if (logLevel > 2) {
		console.log("Listening for technical connection on ", wsPath);
	}
	app.ws(wsPath, function(ws, req) {
		if (logLevel > 0) {
			console.log("Client connected");
		}
		ws.send("connected");
	});
}

function notify(wsPath, data = "connected") {
	const clients = wsInstance.getWss(wsPath).clients;
	if (logLevel > 0) {
		console.log("Notifying ", clients.size, "clients")
	}
	for(const client of clients) {
		client.send(data);
	}
}

HotReloadingProxy.serve = function(remote, port) {
	if (logLevel === 2) {
		app.use(logger('dev', {
			// skip: function (req, res) { return res.statusCode < 400; }
		}));
	} else if (logLevel > 2) {
		app.use(logger('dev'));
	}

	// TODO: filter injection path according to proxyRes ?
	app.use("/", httpProxy(remote, {
		preserveHostHdr: true,
		userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
			// Example: https://github.com/villadora/express-http-proxy/blob/master/test/userResDecorator.js
			if (userReq.url.indexOf('/.websocket') >= 0) {
				return proxyResData;
			}
			if (proxyRes.headers['content-type'].indexOf("text/html") < 0) {
				return proxyResData;
			}
			if (logLevel > 1) {
				console.log("Injecting into file: ", userReq.url);
			}
			const data = injectIntoString(proxyResData.toString('utf8'));
			proxyRes.headers['content-length'] = data.length;
			return data;
		}
	}));

	app.listen(port, () => {
		// Output
		if (logLevel >= 1) {
			console.log(("Serving \"%s\" at :%s").green, remote, port);
		}
	});
};

HotReloadingProxy.watch = function(wsPath, watchList = [ '.' ], optionsIgnore = []) {
	var ignored = [
		// Always ignore dotfiles (important e.g. because editor hidden temp files)
		(testPath) => testPath !== "." && /(^[.#]|(?:__|~)$)/.test(path.basename(testPath)),

		// Always skip node_modules
		'**/node_modules'
	];
	ignored = ignored.concat(optionsIgnore);

	// Setup file watcher
	const watcher = chokidar.watch(watchList, {
		ignored: ignored,
		ignoreInitial: true
	});

	function handleChange(changePath) {
		// TODO: manage pictures too...
		let change = (
			path.extname(changePath) === ".css" ? "refreshcss" 
			: 'reload'
		)
		if (logLevel >= 1) {
			console.log(`Change detected: order to '${change}' - `.magenta, changePath);
		}
		notify(wsPath, change);
	}

	watcher
		.on("change", handleChange)
		.on("add", handleChange)
		.on("unlink", handleChange)
		.on("addDir", handleChange)
		.on("unlinkDir", handleChange)
		.on("ready", function () {
			if (logLevel >= 3) {
				console.log("Watching those files: ".cyan, watcher.getWatched());
			}
			if (logLevel >= 1) {
				console.log("Ready for changes".cyan);
			}
		})
		.on("error", function (err) {
			console.log("ERROR:".red, err);
		});
};

module.exports = HotReloadingProxy;
