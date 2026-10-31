# ReliefVue operations platform — single process, one origin.
# The Node server exposes /api and serves the built interface from dist/.
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# build:web also copies the brand guide, so / and /brand-guide/ work on the host.
RUN npm run build:web

FROM node:24-bookworm-slim
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production
ENV RV_HOST=0.0.0.0
ENV RV_PORT=8080
ENV RV_DB=/data/platform.db
EXPOSE 8080
CMD ["npx", "tsx", "server/platform/index.ts"]
