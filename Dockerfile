FROM node:10

WORKDIR /app
COPY . .

EXPOSE 8000

RUN npm install -g nodemon
RUN npm install
RUN cp .env.example .env