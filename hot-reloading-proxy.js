#!/usr/bin/env node

const HotReloadingProxy = require("./server");
const yargs = require('yargs');

const options = yargs
	.options({
		'port': {
			alias: 'p',
			describe: 'port on which the service is started',
			type: 'number',
			default: 3001
		},
		'remote': {
			alias: 'r',
			describe: 'remote server to forward request to',
			type: 'string',
			default: 'http://localhost:3000'
		},
		'watch': {
			alias: 'w',
			describe: 'what files to watch for change',
			type: 'array',
			default: [ '.' ],
			nargs: 1,
			normalize: true
		},
		'ignore': {
			alias: 'i',
			describe: 'ignore files in the watch folder',
			type: 'array',
			default: [],
			nargs: 1,
			normalize: true
		},
		'verbose': {
			alias: 'v',
			describe: 'increase verbosity',
			type: 'number',
			default: 1,
			count: true
		},
		'quiet': {
			alias: 'q',
			describe: 'reduce verbosity',
			type: 'number',
			default: 0,
			count: true
		}
	})
	.config('config')
	.example('$0', 'Proxy :3000 and serve it on :3001')
	.example('$0 --remote http://localhost:8080 --port 8081', 'Proxy :8080 and serve it on :8081')
	.help()
	.wrap(Math.min(120, yargs.terminalWidth()))
	// .recommendCommands()
	.argv;

options.logLevel = options.verbose - options.quiet;
options.wsPath = '/hot-reloading-proxy/ws';

HotReloadingProxy.start(options);
