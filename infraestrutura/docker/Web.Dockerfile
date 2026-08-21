FROM node:22-bookworm-slim AS dependencias
WORKDIR /codigo
COPY src/web/package.json src/web/package-lock.json ./
RUN npm ci

FROM dependencias AS compilacao
COPY src/web .
RUN npm run build

FROM node:22-bookworm-slim AS execucao
WORKDIR /aplicacao
ENV NODE_ENV=production
COPY --from=compilacao /codigo/.next/standalone ./
COPY --from=compilacao /codigo/.next/static ./.next/static
COPY --from=compilacao /codigo/public ./public
EXPOSE 3000
CMD ["sh", "-c", "PORT=${PORT:-3000} HOSTNAME=0.0.0.0 node server.js"]
