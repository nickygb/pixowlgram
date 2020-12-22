#################################
# Build
#################################
FROM node:12-alpine AS builder
WORKDIR /usr/src/app
ENV NODE_ENV=development
COPY package.json yarn.lock tsconfig.json ./
COPY src ./src
COPY @types ./@types
COPY test ./test
COPY db ./db
RUN yarn install --frozen-lockfile
RUN yarn build:ts

################################
# DB Migration + Seed
################################
FROM node:12-alpine AS migration_seed
WORKDIR /usr/src/app
# Install dockerize to facilitate integration
RUN apk add
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

ENV NODE_ENV=development
COPY --from=builder /usr/src/app/package.json /usr/src/app/yarn.lock /usr/src/app/tsconfig.json ./
COPY --from=builder /usr/src/app/db ./db
COPY --from=builder /usr/src/app/src/knexfile.js ./src/knexfile.js
RUN yarn install --frozen-lockfile

CMD [ "yarn", "db:migrate:seed" ]

################################
# Test
################################
FROM node:12-alpine AS test
WORKDIR /usr/src/app
# Install dockerize to facilitate integration
RUN apk add
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

ENV NODE_ENV=development
COPY --from=builder /usr/src/app/package.json /usr/src/app/yarn.lock /usr/src/app/tsconfig.json ./
COPY --from=builder /usr/src/app/src/knexfile.js ./src/knexfile.js
COPY --from=builder /usr/src/app/test ./test
RUN yarn install --frozen-lockfile

CMD [ "yarn", "test:integration" ]


################################
# Release
################################
FROM node:12-alpine AS release
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/package.json /usr/src/app/yarn.lock ./
COPY --from=builder /usr/src/app/dist ./dist
RUN yarn install --frozen-lockfile --only=production
EXPOSE 5000
CMD [ "node", "dist/app.js" ]

