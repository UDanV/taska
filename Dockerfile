# -------- deps --------
FROM node:20-slim AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install

# -------- builder --------
FROM node:20-slim AS builder
WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# -------- runner --------
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]