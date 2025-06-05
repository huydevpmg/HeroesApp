FROM node:20

WORKDIR /app

# Cài Angular CLI global
RUN npm install -g @angular/cli

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "1000"]
