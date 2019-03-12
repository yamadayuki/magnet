const path = require("path");
const micro = require("micro");
const handler = require("serve-handler");

const ENV = process.env.NODE_ENV || "sandbox";

const server = micro(async (req, res) => {
  console.log(req, res);

  return await handler(req, res, {
    trailingSlash: true,
    rewrites: [
      {
        source: "/",
        destination: path.join(ENV, "/index.html"),
      },
    ],
  });
});

server.listen(3031);
