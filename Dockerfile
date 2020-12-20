FROM node:12-alpine AS builder
WORKDIR /usr/src/app
ENV NODE_ENV=development
COPY package.json yarn.lock tsconfig.json ./
COPY src ./src
RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:12-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/package.json /usr/src/app/yarn.lock ./
COPY --from=builder /usr/src/app/dist ./dist
RUN yarn install --frozen-lockfile --only=production
EXPOSE 5000
CMD [ "node", "dist/app.js" ]

