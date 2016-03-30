FROM    node:latest

RUN     npm install -g ttf2woff
RUN     npm install -g gulp-cli
RUN     npm install -g node-sass
RUN     apt-get -y install imagemagick

ADD     package.json /tmp/package.json
RUN     cd /tmp && npm install
RUN     mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

ADD    . /opt/app
WORKDIR /opt/app

RUN     node convert-font-dir.js
RUN     gulp sass

EXPOSE  8000

CMD     gulp webserver