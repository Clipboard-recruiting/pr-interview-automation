# Base image
FROM --platform=linux/amd64 node:18-alpine

RUN apk update
RUN apk add git

RUN adduser -D recruiter
USER recruiter

# Create app directory
WORKDIR /home/recruiter/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY --chown=recruiter package*.json ./

RUN chmod 777 -R /home/recruiter/app

# Install app dependencies
RUN npm install

# Bundle app source
COPY --chown=recruiter . .

# Creates a "dist" folder with the production build
RUN npm run build

# Start the server using the production build
CMD [ "node", "dist/main.js" ]