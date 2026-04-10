# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Construire l'application Next.js
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copier package.json pour les dépendances de runtime
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production

# Copier les fichiers construits depuis le stage builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Exposer le port 3000
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
