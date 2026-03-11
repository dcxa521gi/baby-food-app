# Build stage
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM node:16-alpine

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/node_modules ./node_modules

# We only need production dependencies in the final image
# But since we bundled the server, we might only need native modules like better-sqlite3
# For simplicity, we copy node_modules from builder or re-install
RUN npm prune --production

EXPOSE 3000
CMD ["npm", "run", "start"]
