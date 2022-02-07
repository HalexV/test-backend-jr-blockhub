FROM node

WORKDIR /usr/app

COPY package.json ./
COPY yarn.lock ./
COPY src/ ./src/
COPY tsconfig.json ./
COPY tsconfig.build.json ./

RUN yarn install

EXPOSE 3000

CMD ["yarn", "start:dev"]