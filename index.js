const path = require("path");
const micro = require("micro");
const handler = require("serve-handler");
const basicAuth = require("basic-auth");

const ENV = process.env.NODE_ENV || "sandbox";
const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME;
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

const basicAuthMiddleware = (req, res) => {
  if (BASIC_AUTH_USERNAME && BASIC_AUTH_PASSWORD) {
    const credential = basicAuth(req);

    if (
      !credential ||
      credential.name !== BASIC_AUTH_USERNAME ||
      credential.pass !== BASIC_AUTH_PASSWORD
    ) {
      res.writeHead(401, { "WWW-Authenticate": 'Basic realm="secret zone"' });
      res.end("Not authorized");
      return false;
    }

    return true;
  }

  return true;
};

const server = micro(async (req, res) => {
  try {
    const authorized = basicAuthMiddleware(req, res);

    if (!authorized) {
      return;
    }

    return await handler(req, res, {
      rewrites: [
        {
          source: "/**",
          destination: path.join(ENV, "/index.html"),
        },
      ],
    });
  } catch (err) {
    console.error(err);

    return;
  }
});

server.listen(3031);
