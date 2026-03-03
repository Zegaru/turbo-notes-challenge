# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm config set node-linker hoisted && \
    pnpm install --frozen-lockfile || pnpm install

ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

COPY . .
RUN pnpm exec next build

# Serve stage
FROM node:22-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/out ./out

EXPOSE 3000

CMD ["serve", "out", "-l", "3000", "-s"]
