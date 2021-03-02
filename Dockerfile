FROM node:14-stretch-slim

ENV SERVICE_ROOT /service
RUN mkdir $SERVICE_ROOT
WORKDIR $SERVICE_ROOT

COPY . $SERVICE_ROOT

RUN yarn install --pure-lockfile && yarn cache clean

ENV PATH $PATH:/$SERVICE_ROOT/node_modules/.bin

CMD yarn start
