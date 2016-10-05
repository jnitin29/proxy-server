"use strict";

let http = require('http')
let request = require('request')
let url = require('url')
let path = require('path')
let fs = require('fs')
let argv = require('yargs')
    .default('host', '127.0.0.1:8000')
    .argv
let localhost = '127.0.0.1'
let host = argv.host || localhost
let port = argv.port || (host === localhost ? 8000 : 80)

let logPath = argv.log && path.join(__dirname, argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

let scheme = "http://"
let destinationUrl = scheme + host + ':' + port

http.createServer((req, res) => {
  let url = destinationUrl
  if (req.headers['x-destination-url']) {
    url = scheme + req.headers['x-destination-url']
  }
  console.log(`Proxying request to: ${destinationUrl + req.url}`)
  logStream.write('Request headers: ' + JSON.stringify(req.headers))
  req.pipe(logStream, {end: false})
  // Proxy code here
  let options = {
      headers: req.headers,
      url: url + req.url,
      method: req.method
  }

  let outboundResponse = req.pipe(request(options))
  process.stdout.write(JSON.stringify(outboundResponse.headers))
  outboundResponse.pipe(logStream, {end: false})
  outboundResponse.pipe(res)
}).listen(8001)
