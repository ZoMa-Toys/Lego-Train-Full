FROM node:16

WORKDIR /var/www/prod

RUN git clone --branch docker-mongo --recursive https://github.com/ZoMa-Toys/Lego-Train-Full.git source
WORKDIR /var/www/prod/source/frontend
RUN npm install
RUN export VUE_APP_VERSION=`git describe` &&  npm run build
WORKDIR /var/www/prod/source/backend
RUN npm install

ENV API_PORT 80

EXPOSE 80

CMD ["node","ws.js"]

