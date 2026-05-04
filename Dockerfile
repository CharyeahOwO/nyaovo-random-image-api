FROM node:20-alpine

RUN apk add --no-cache su-exec

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN mkdir -p /app/public/images && chown -R node:node /app \
  && chmod +x /app/docker-entrypoint.sh

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/image/health || exit 1
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "start"]
