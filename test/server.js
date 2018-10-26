#!/usr/bin/env node
/* eslint-env node */

// Server
const express = require('express');
const morgan = require('morgan');

// Configs
const app = express();
const port = 8080;

app.use(morgan('dev'));
app.use(express.static(__dirname));

app.listen(port, () => console.info(`Listening on port ${port}!`));
