ARG BUILDENV=production


FROM node:16 as production
ONBUILD WORKDIR /var/www/prod
ONBUILD RUN git clone --branch docker-mongo --recursive https://github.com/ZoMa-Toys/Lego-Train-Full.git source

FROM node:16 as development
ONBUILD WORKDIR /var/www/prod
ONBUILD COPY ./ source/

FROM ${BUILDENV}
RUN ls -al /var/www/prod/source/
WORKDIR /var/www/prod/source/frontend
RUN npm install
RUN export VUE_APP_VERSION=`git describe` &&  npm run build
WORKDIR /var/www/prod/source/backend
RUN npm install

ENV API_PORT 80

EXPOSE 80

CMD ["node","ws.js"]

