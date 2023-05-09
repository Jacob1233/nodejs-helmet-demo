const CRYPTO = require('crypto');
const EXPRESS = require("express");
const FS = require("fs");
const HTTPS = require("https");
const HELMET = require("helmet");
const TLS_APP = EXPRESS();
const TLS_PORT = 443;
const GENERATE_CSP_NONCE = function (req, res, next) {
    res.locals.nonce = CRYPTO.randomBytes(16).toString("hex");
    next();
}
TLS_APP.use(GENERATE_CSP_NONCE);

TLS_APP.use(HELMET({
    contentSecurityPolicy : {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      }
    }
}));

TLS_APP.get('/', (req, res) => {
    res.status(200).type("txt").send(res.locals.nonce);
});

function initTLS() {
    let tls_options = {};
    if (true) {
        tls_options = {
          key: FS.readFileSync(`${__dirname}/dev_tls/key.pem`),
          cert: FS.readFileSync(`${__dirname}/dev_tls/cert.pem`),
          passphrase: 'password'
        };
      }
    let tls_server = HTTPS.createServer(tls_options, TLS_APP);
    tls_server.listen(TLS_PORT, () => {
        console.log(`${getDateTime()}: tls listening on *:${TLS_PORT}`);
    });
}

initTLS();