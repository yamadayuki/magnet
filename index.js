const path = require("path");
const micro = require("micro");
const handler = require("serve-handler");
const basicAuth = require("basic-auth");

const ENV = process.env.NODE_ENV || "sandbox";
const TARGET_DIRECTORY = process.env.TARGET_DIRECTORY || ENV;
const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME;
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;
const PORT = process.env.PORT || 3000;

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
  if (req.url === "/ping") {
    micro.send(res, 200, "pong");
    return;
  }

  try {
    const authorized = basicAuthMiddleware(req, res);

    if (!authorized) {
      return;
    }

    return await handler(req, res, {
      rewrites: [
        {
          source: "/**",
          destination: path.join(TARGET_DIRECTORY, "/index.html"),
        },
      ],
    });
  } catch (err) {
    console.error(err);

    return;
  }
});

server.listen(PORT);
