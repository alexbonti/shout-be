FROM node:10-alpine

# build tools for native dependencies

RUN apk add --update imagemagick

RUN apk add --update graphicsmagick

RUN apk add --update bash


WORKDIR /app
COPY . .

EXPOSE 8000

RUN cp .env.example .env

RUN PROJECT_FOLDER=Shout bash setup_upload.sh

RUN npm install
RUN cp .env.example .env
CMD ["npm","start"]
