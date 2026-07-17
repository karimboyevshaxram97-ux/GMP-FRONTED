FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build

WORKDIR /app

# Bu qiymatlar next.config.js'ning `env:` bloki orqali build vaqtida
# client JS bundle'ga qattiq yoziladi — shuning uchun runtime emas,
# aynan `docker build --build-arg` orqali kelishi shart.
ARG REACT_APP_API_URL
ARG REACT_APP_API_GRAPHQL_URL
ARG REACT_APP_API_WS
ARG REACT_APP_API_GRAPHQL_WS
ARG REACT_APP_CHAT_WS
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

ENV NODE_ENV=production \
	REACT_APP_API_URL=$REACT_APP_API_URL \
	REACT_APP_API_GRAPHQL_URL=$REACT_APP_API_GRAPHQL_URL \
	REACT_APP_API_WS=$REACT_APP_API_WS \
	REACT_APP_API_GRAPHQL_WS=$REACT_APP_API_GRAPHQL_WS \
	REACT_APP_CHAT_WS=$REACT_APP_CHAT_WS \
	NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

COPY . .

RUN npm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# next-i18next locale fayllari (public/locales/**) standalone chiqishiga
# avtomatik ko'chirilmaydi — shuning uchun public/ alohida ko'chiriladi.
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
