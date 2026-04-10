# 📋 Todo List App - Application Complète Cloud

Une application **Todo List moderne** déployée sur **Azure** avec architecture cloud-native.

---

## 🛠️ **Choix Technologiques**

### **Frontend & Backend**
- **Next.js 16.2.3** - Framework React fullstack avec SSR
- **React 19** - Bibliothèque UI moderne
- **TypeScript** - Typage static pour la sécurité
- **Tailwind CSS 4** - Styling responsive et utility-first
- **Lucide React** - Icônes SVG modernes

### **Données**
- **PostgreSQL** - Base de données relationnelle (gestion des todos)
- **Azure Cosmos DB** - Base de données NoSQL (scalabilité horizontale, multi-région)
- **Azure Blob Storage** - Stockage d'objets (fichiers JSON, assets)

### **Sécurité & Secrets**
- **Azure Key Vault** - Gestion centralisée des secrets et clés d'API
- **Environment Variables** - Gestion des configurations sensibles

### **Déploiement & Infra**
- **Docker** - Containerisation multi-stage
- **Azure App Service** - Hébergement web managé
- **Azure Container Registry (ACR)** - Registre d'images privé
- **Azure DevOps/GitHub Actions** - CI/CD (optionnel)

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Next.js App (React + Tailwind CSS + TypeScript)           │ │
│  │  - Todo List UI                                            │ │
│  │  - Gestion d'état avec React Hooks                         │ │
│  └─────────────┬──────────────────────────────────────────────┘ │
│                │                                                  │
└────────────────┼──────────────────────────────────────────────────┘
                 │ HTTPS
                 │
        ┌────────▼────────────────────────────────────────────┐
        │   Azure App Service (Web App + Container)            │
        │   - Slot Production + Slot Staging                   │
        │   - Auto-scale + Health probes                       │
        │                                                       │
        │  ┌──────────────────────────────────────────────┐   │
        │  │  Docker Container (Node.js 20-Alpine)        │   │
        │  │  - Next.js Runtime                           │   │
        │  │  - API Routes                                │   │
        │  └────────┬─────────────────────────────────────┘   │
        └───────────┼──────────────────────────────────────────┘
                    │
        ┌───────────┴────────────────────────────────────┐
        │             Azure Key Vault                   │
        │  - DATABASE_URL (PostgreSQL)                  │
        │  - COSMOS_CONNECTION_STRING                   │
        │  - BLOB_STORAGE_KEY                           │
        │  - API_KEYS                                   │
        └─────────┬─────────────┬───────────┬───────────┘
                  │             │           │
        ┌─────────▼──┐  ┌───────▼───┐  ┌──▼────────────┐
        │ PostgreSQL │  │ Cosmos DB │  │  Blob Storage │
        │ (Todos)    │  │ (Cache)   │  │  (Files JSON) │
        └────────────┘  └───────────┘  └───────────────┘

        Azure Container Registry (ACR)
        └─ Image Docker publiée et versionnée
```

---

## ☁️ **Ressources Azure Utilisées**

### **1. Groupe de Ressources**
```
Ressource Group: todolist-rg
Region: France Central (ou East US)
```

### **2. App Service (Web App)**
```
Nom: todolist-app
SKU: Standard S1 (ou Basic B1)
Runtime Stack: Docker Container
Slots: Production + Staging
```

### **3. Azure Container Registry (ACR)**
```
Nom: todolistacr
SKU: Basic
- Stocke l'image Docker privée
- Linked à App Service
```

### **4. Azure PostgreSQL Flexible Server**
```
Nom: todolist-postgres
Tier: Burstable (B2s)
- Stocke les todos en base relationnelle
- Configuration SSL activée
```

### **5. Azure Cosmos DB**
```
Nom: todolist-cosmosdb
Database: NoSQL (API Core SQL)
- Cache distribué
- Haute disponibilité multi-région
- Scalabilité horizontale (RU/s provisionnés)
```

### **6. Azure Blob Storage**
```
Compte: todoliststorage
Container: data
- Stockage JSON avec partage public
- Accès via HTTPS sécurisé
- Versioning activé
```

### **7. Azure Key Vault**
```
Nom: todolist-kv
SKU: Standard
Secrets stockés:
  - db-connection-string (PostgreSQL)
  - cosmos-connection-string
  - storage-access-key
  - api-keys
```

---

## 🔧 **Commandes Azure CLI Principales**

### **Authentification**
```bash
az login
az account set --subscription "<subscription-id>"
```

### **Groupe de Ressources**
```bash
# Créer le groupe
az group create \
  --name todolist-rg \
  --location francecentral

# Lister les ressources
az resource list --resource-group todolist-rg --output table
```

### **Container Registry (ACR)**
```bash
# Créer le registre
az acr create \
  --resource-group todolist-rg \
  --name todolistacr \
  --sku Basic

# Construire l'image
az acr build \
  --registry todolistacr \
  --image todolist-app:v1 .

# Lister les images
az acr repository list --name todolistacr

# Obtenir le login
az acr credential show \
  --name todolistacr \
  --query passwords[0].value
```

### **App Service (Web App)**
```bash
# Créer la web app avec container
az appservice plan create \
  --name todolist-plan \
  --resource-group todolist-rg \
  --sku S1 --is-linux

az webapp create \
  --resource-group todolist-rg \
  --plan todolist-plan \
  --name todolist-app \
  --deployment-container-image-name-user todolistacr.azurecr.io/todolist-app:v1

# Configurer ACR credentials
az webapp config container set \
  --name todolist-app \
  --resource-group todolist-rg \
  --docker-custom-image-name todolistacr.azurecr.io/todolist-app:v1 \
  --docker-registry-server-url https://todolistacr.azurecr.io

# Créer un deployment slot
az webapp deployment slot create \
  --resource-group todolist-rg \
  --name todolist-app \
  --slot staging

# Swap slots (prod <-> staging)
az webapp deployment slot swap \
  --resource-group todolist-rg \
  --name todolist-app \
  --slot staging

# Redémarrer l'app
az webapp restart --resource-group todolist-rg --name todolist-app

# Afficher les URLs
az webapp show \
  --resource-group todolist-rg \
  --name todolist-app \
  --query defaultHostName
```

### **PostgreSQL Database**
```bash
# Créer le serveur
az postgres flexible-server create \
  --resource-group todolist-rg \
  --name todolist-postgres \
  --location francecentral \
  --admin-user adminuser \
  --admin-password "<password>" \
  --sku-name Standard_B2s \
  --tier Burstable

# Créer une base de données
az postgres flexible-server db create \
  --resource-group todolist-rg \
  --server-name todolist-postgres \
  --database-name todolistdb

# Afficher la chaîne de connexion
az postgres flexible-server show-connection-string \
  --server-name todolist-postgres
```

### **Cosmos DB**
```bash
# Créer le compte Cosmos
az cosmosdb create \
  --resource-group todolist-rg \
  --name todolist-cosmosdb \
  --default-consistency-level ConsistentPrefix \
  --locations regionName=francecentral failoverPriority=0

# Créer une base de données
az cosmosdb sql database create \
  --resource-group todolist-rg \
  --account-name todolist-cosmosdb \
  --name todolistdb \
  --throughput 400

# Créer un container
az cosmosdb sql container create \
  --resource-group todolist-rg \
  --account-name todolist-cosmosdb \
  --database-name todolistdb \
  --name todos \
  --partition-key-path "/id"

# Récupérer la connection string
az cosmosdb keys list \
  --resource-group todolist-rg \
  --name todolist-cosmosdb \
  --type connection-strings
```

### **Blob Storage**
```bash
# Créer le compte storage
az storage account create \
  --resource-group todolist-rg \
  --name todoliststorage \
  --location francecentral \
  --sku Standard_LRS

# Créer un container
az storage container create \
  --account-name todoliststorage \
  --name data \
  --public-access blob

# Uploader un fichier
az storage blob upload \
  --account-name todoliststorage \
  --container-name data \
  --name todos.json \
  --file ./data/todos.json

# Générer une URL SAS
az storage blob generate-sas \
  --account-name todoliststorage \
  --container-name data \
  --name todos.json \
  --permissions r \
  --expiry 2025-12-31T23:59:59Z

# Afficher l'URL publique
az storage blob url \
  --account-name todoliststorage \
  --container-name data \
  --name todos.json
```

### **Key Vault**
```bash
# Créer le vault
az keyvault create \
  --resource-group todolist-rg \
  --name todolist-kv \
  --location francecentral

# Ajouter des secrets
az keyvault secret set \
  --vault-name todolist-kv \
  --name db-connection-string \
  --value "postgresql://user:password@host/db"

az keyvault secret set \
  --vault-name todolist-kv \
  --name cosmos-connection-string \
  --value "AccountEndpoint=https://...;"

# Récupérer un secret
az keyvault secret show \
  --vault-name todolist-kv \
  --name db-connection-string

# Lister tous les secrets
az keyvault secret list --vault-name todolist-kv
```

### **Monitoring & Logs**
```bash
# Afficher les logs en temps réel
az webapp log tail \
  --resource-group todolist-rg \
  --name todolist-app

# Télécharger les logs
az webapp log download \
  --resource-group todolist-rg \
  --name todolist-app
```

---

## 🌐 **URL de l'Application**

### **Production**
```
https://todolist-app.azurewebsites.net
```

### **Staging**
```
https://todolist-app-staging.azurewebsites.net
```

### **Blob Storage (Données publiques)**
```
https://todoliststorage.blob.core.windows.net/data/todos.json
```

---

## 📊 **Usage des Services Azure Avancés**

### **1️⃣ Cosmos DB - Cache Distribué & NoSQL**

**Utilité:**
- Stockage NoSQL hautement disponible et performant
- Cache distribué pour les données fréquemment accédées
- Réplication multi-région automatique
- Scalabilité horizontale (RU/s à la demande)

**Configuration:**
```json
{
  "database": "todolistdb",
  "container": "todos",
  "partitionKey": "/id",
  "throughput": 400
}
```

**Usage dans l'app:**
- Cache des todos avec TTL (Time To Live)
- Synchronisation temps réel via Change Feed
- Optionnellement remplacer PostgreSQL pour haute scalabilité

---

### **2️⃣ Key Vault - Gestion des Secrets**

**Utilité:**
- Stockage centralisé et sécurisé des secrets
- Access Control avec RBAC Azure
- Audit trail complète
- Rotation automatique des clés

**Secrets stockés:**
```
✓ DATABASE_URL (PostgreSQL)
✓ COSMOS_CONNECTION_STRING
✓ BLOB_STORAGE_KEY
✓ API_KEYS tiers
✓ JWT_SECRET (si authentification)
```

**Configuration dans App Service:**
```bash
# Managed Identity (recommandé)
az webapp identity assign \
  --resource-group todolist-rg \
  --name todolist-app

# Application Settings (référence Key Vault)
az webapp config appsettings set \
  --resource-group todolist-rg \
  --name todolist-app \
  --settings \
    DATABASE_URL="@Microsoft.KeyVault(VaultName=todolist-kv;SecretName=db-connection-string)" \
    COSMOS_CONNECTION_STRING="@Microsoft.KeyVault(VaultName=todolist-kv;SecretName=cosmos-connection-string)"
```

---

### **3️⃣ Blob Storage - Stockage d'Objets**

**Utilité:**
- Stockage illimité et économique
- Données JSON/fichiers publiques ou privées
- Versioning et soft delete
- Intégration avec CDN Azure (accélération globale)

**Exemple:**
```
Container: data
└─ todos.json (uploadé manuellement ou via API)
   └─ URL publique: https://todoliststorage.blob.core.windows.net/data/todos.json
```

**Code d'accès:**
```javascript
// Fetch depuis l'app
const response = await fetch('https://todoliststorage.blob.core.windows.net/data/todos.json');
const data = await response.json();
```

**Cas d'usage:**
- Sauvegarde de données JSON
- Uploads de fichiers utilisateur
- Exports/backups
- Données de migration

---

### **4️⃣ Deployment Slots - Blue/Green Deployment**

**Utilité:**
- Test en production sans downtime
- Rollback instantané en cas de problème
- Validation avant passage en prod
- Warming & préparation avant swap

**Architecture:**
```
App Service: todolist-app
├─ Production (réceoit le traffic)
└─ Staging (test & préparation)
```

**Workflow Deployment Slots:**

```bash
# 1. Déployer la nouvelle version sur le slot Staging
az webapp deployment source config-zip \
  --resource-group todolist-rg \
  --name todolist-app \
  --slot staging \
  --src app.zip

# 2. Tester sur https://todolist-app-staging.azurewebsites.net
# => Tests fonctionnels, smoke tests, etc.

# 3. Si OK, swap Production ↔ Staging
az webapp deployment slot swap \
  --resource-group todolist-rg \
  --name todolist-app \
  --slot staging

# 4. En cas de problème, swap back immédiatement
az webapp deployment slot swap \
  --resource-group todolist-rg \
  --name todolist-app \
  --slot staging \
  --action rollback
```

**Avantages:**
✅ Zero downtime deployments  
✅ Rollback instantané  
✅ Warmup des connexions avant swap  
✅ Traffic routing split (tester avec % du traffic)  

---

## ⚠️ **Limites Rencontrées**

### **1. PostgreSQL vs Cosmos DB - Redondance**
- ❌ Maintenance de 2 datastores (PostgreSQL + Cosmos)
- ✅ **Solution:** Prioriser un seul (Cosmos pour scalabilité, PostgreSQL pour ACID)
- Considérer une migration progressive

### **2. Coûts Azure**
- ❌ App Service S1 + PostgreSQL + Cosmos = ~150-200€/mois
- ✅ **Optimisations:**
  - Utiliser B1 Basic pour dev/tests
  - Autoscale sur App Service
  - RU/s à la demande sur Cosmos
  - Monitoring pour détecter les fuites de ressources

### **3. Gestion des Connexions**
- ❌ Pool de connexions PostgreSQL limité
- ✅ **Solution:** Connection pooling (pgBouncer, HikariCP)
- Cosmos DB a une meilleure scalabilité de connexions

### **4. Blob Storage - Permissions**
- ❌ Container public = données accessibles sans authentification
- ✅ **Solution:**
  - SAS tokens avec expiration
  - Private containers + Azure CDN
  - CORS bien configuré

### **5. Deployment Slots - Temps de Swap**
- ⚠️ Swap peut prendre 1-2 min (application restart)
- ✅ **Mitigation:** Configurer health checks pour warmup

### **6. Key Vault - Throttling**
- ⚠️ Limite de 2000 requêtes/10sec par secret
- ✅ **Solution:** Caching en local ou reference en App Configuration

### **7. Docker Image Size**
- ❌ Image de base Node:20-Alpine = ~200MB
- ✅ **Optimisation:** Multi-stage build (réduction à ~150MB)

### **8. Monitoring et Logs**
- ⚠️ Logs App Service par défaut limités
- ✅ **Solution:** Application Insights + Log Analytics pour traçabilité

---

## 🚀 **Déploiement Complet (Checklist)**

```bash
# 1. Créer la ressource group
az group create --name todolist-rg --location francecentral

# 2. Créer ACR
az acr create --resource-group todolist-rg --name todolistacr --sku Basic

# 3. Build & push l'image
az acr build --registry todolistacr --image todolist-app:v1 .

# 4. Créer App Service
az appservice plan create --name todolist-plan --resource-group todolist-rg --sku S1 --is-linux
az webapp create --resource-group todolist-rg --plan todolist-plan --name todolist-app

# 5. Configurer container
az webapp config container set \
  --name todolist-app \
  --resource-group todolist-rg \
  --docker-custom-image-name todolistacr.azurecr.io/todolist-app:v1 \
  --docker-registry-server-url https://todolistacr.azurecr.io

# 6. Créer Key Vault + secrets
az keyvault create --resource-group todolist-rg --name todolist-kv --location francecentral
az keyvault secret set --vault-name todolist-kv --name db-connection-string --value "..."

# 7. Créer PostgreSQL
az postgres flexible-server create --resource-group todolist-rg --name todolist-postgres

# 8. Créer Cosmos DB
az cosmosdb create --resource-group todolist-rg --name todolist-cosmosdb

# 9. Créer Blob Storage
az storage account create --resource-group todolist-rg --name todoliststorage --location francecentral

# 10. Créer deployment slot
az webapp deployment slot create --resource-group todolist-rg --name todolist-app --slot staging

# ✅ Application prête en production!
```

---

## 📝 **Fichiers de Configuration**

- **`.env.example`** - Variables d'environnement
- **`Dockerfile`** - Image Docker multi-stage
- **`azure-deploy.yml`** - CI/CD GitHub Actions (optionnel)

---

## 💡 **Prochaines Étapes**

- [ ] Configurer GitHub Actions pour CI/CD automatique
- [ ] Ajouter Application Insights pour monitoring
- [ ] Implémenter Health Checks pour App Service
- [ ] Activer Private Endpoint pour PostgreSQL
- [ ] Configurer CDN pour Blob Storage
- [ ] Audit & compliance checks (GDPR, SOC2)

---

**Application déployée avec succès sur Azure Cloud ! ☁️✨**
