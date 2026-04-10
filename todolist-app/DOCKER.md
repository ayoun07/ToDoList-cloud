# Todo List App - Docker Setup

## 📦 Build et lancer l'application avec Docker

### Construire l'image

```bash
cd c:\Users\user\Documents\ToDoList-cloud\todolist-app
docker build -t todolist-app .
```

### Lancer le conteneur

```bash
# Mode interactif
docker run -p 3000:3000 todolist-app

# Arrière-plan avec auto-restart
docker run -d -p 3000:3000 --name todolist --restart unless-stopped todolist-app
```

L'application sera accessible à : **http://localhost:3000**

## 🛑 Arrêter le conteneur

```bash
docker stop todolist
docker rm todolist
```

## 📊 Architecture Docker

### Dockerfile avec Multi-stage Build

**Stage 1 - Builder (Construction):**

- Utilise `node:20-alpine`
- Installe les dépendances
- Construit l'application Next.js
- Génère les fichiers `.next` optimisés

**Stage 2 - Production (Runtime):**

- Image légère et minimaliste
- Copie uniquement les fichiers nécessaires
- Installe uniquement les dépendances de production
- Réduit drastiquement la taille de l'image finale (~200MB au lieu de 500MB+)

## 📋 Fichiers Docker

- **Dockerfile** : Configuration multi-stage optimisée pour la production
- **.dockerignore** : Exclut les fichiers inutiles du build

## 🚀 Avantages

✅ Application isolée et facilement déployable  
✅ Image optimisée et légère  
✅ Fonctionne de manière identique sur tous les OS  
✅ Port 3000 exposé automatiquement  
✅ Redémarrage automatique en cas d'arrêt inattendu

## 🐳 Commandes utiles

```bash
# Voir les images disponibles
docker images

# Voir les conteneurs en cours
docker ps

# Voir tous les conteneurs (y compris arrêtés)
docker ps -a

# Consulter les logs du conteneur
docker logs todolist

# Accéder au shell du conteneur (debug)
docker exec -it todolist sh
```
