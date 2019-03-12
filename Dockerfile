FROM node:10.15.3-alpine

# Tini(to handle stop signal)
#-----------------------------------------------
RUN apk add --no-cache --update tini

COPY . /app
WORKDIR /app

RUN npm install --production

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "node", "index.js" ]
