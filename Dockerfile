FROM    node:latest

RUN     apt-get update && apt-get install -y nginx
RUN     ln -sf /dev/stdout /var/log/nginx/access.log
RUN     ln -sf /dev/stderr /var/log/nginx/error.log
RUN     rm -rf /etc/nginx/sites-enabled/default

RUN     npm install -g ttf2woff
RUN     npm install -g gulp-cli
RUN     npm install -g rAppid.js
RUN     apt-get -y install imagemagick

ADD     package.json /tmp/package.json
RUN     cd /tmp && npm install --production
RUN     mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

ADD     . /opt/app
WORKDIR /opt/app

RUN     node convert-font-dir.js
RUN     gulp sass
RUN     rappidjs build

RUN     rm -Rf ./public

ADD     nginx/nginx.conf /etc/nginx/nginx.conf
ADD     nginx/hiptees.conf /etc/nginx/sites-enabled/hiptees.conf

EXPOSE  80 443

CMD     nginx