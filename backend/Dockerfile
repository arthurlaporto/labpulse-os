FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci

COPY . .
# O prisma generate precisa de uma URL só para ler a configuração; ela não é usada no build.
RUN DATABASE_URL="postgresql://x:x@localhost:5432/x" npm run build

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/main"]
