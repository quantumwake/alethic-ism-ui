# pull official base image
FROM node:22-alpine3.19

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# add app
COPY . ./

# environment variables
ENV REACT_APP_DEVELOPMENT "LOCAL|DEV|TEST|PROD"
ENV REACT_APP_ISM_API_BASE_URL ""
ENV REACT_APP_FIREBASE_API_KEY "?"
ENV REACT_APP_FIREBASE_AUTH_DOMAIN "?"
ENV REACT_APP_FIREBASE_PROJECT_ID "?"
ENV REACT_APP_FIREBASE_STORAGE_BUCKET "?"
ENV REACT_APP_FIREBASE_MESSAGING_SENDER_ID "?"
ENV REACT_APP_FIREBASE_APP_ID "?"

# start app
CMD ["npm", "start"]    
