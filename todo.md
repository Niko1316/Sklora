# Sklora - TODO

## Renommage et Branding
- [x] Renommer "Pépites Mondiales" en "Sklora"
- [x] Ajouter la tagline "Éclore dans son métier"
- [x] Mettre à jour tous les textes et titres

## Génération IA de Contenu
- [x] Génération automatique de leçons par l'IA
- [x] Génération automatique de quiz basés sur les leçons
- [x] Interface admin pour déclencher la génération IA
- [x] Possibilité de modifier le contenu généré
- [x] Régénération partielle ou complète

## Système de Monétisation
- [x] Table subscriptions pour abonnements
- [x] Tier Free: 3 leçons, avec publicités
- [x] Tier Basic: $14.99/mois - Accès complet
- [x] Tier Pro: $29.99/mois - Certifications + Tuteur IA
- [x] Réduction annuelle: 20%
- [x] Réduction crypto: 10% (Bitcoin/USDC)
- [x] Page de tarification
- [x] Gestion des restrictions par tier

## Intégration Stripe
- [x] Configuration Stripe
- [x] Checkout sessions
- [x] Webhooks pour événements (à configurer)
- [x] Portal client pour gestion abonnement

## Paiements Crypto
- [x] Support Bitcoin (réduction calculée)
- [x] Support USDC (réduction calculée)
- [x] Réduction 10% automatique
- [ ] Intégration paiement crypto direct (Coinbase Commerce)

## Fonctionnalités Existantes (Complétées)
- [x] Système d'authentification avec rôles
- [x] Base de données complète
- [x] Interface d'administration CRUD
- [x] Dashboard étudiant
- [x] Système de quiz interactif
- [x] Gamification (XP, niveaux, streaks, badges)
- [x] Chatbot IA
- [x] Système d'alertes admin
- [x] Design responsive
- [x] Tests unitaires


## Design 2026 - Calm UI
- [x] Appliquer la palette Cloud Dancer (#F0EEE9)
- [x] Intégrer Transformative Teal comme couleur principale
- [x] Ajouter les accents Neo-Mint, Digital Lavender et Hyper-Coral
- [x] Intégrer les polices Lexend et Inter
- [x] Appliquer le design Bento Grid 2.0
- [x] Créer des boutons tactiles (squishy)
- [x] Mettre en évidence le rabais crypto sur la page tarifs


## Suivi de progression des utilisateurs
- [x] Créer les procédures tRPC pour récupérer la progression détaillée
- [x] Page de progression par parcours avec visualisation graphique
- [x] Barre de progression par module et leçon
- [x] Statistiques de temps passé par cours
- [x] Tableau de bord admin pour voir la progression de tous les utilisateurs
- [x] Filtres et export des données de progression


## Bug Fixes
- [x] Corriger l'erreur DialogTitle manquant dans les composants Dialog


## Import JSON et Navigation Admin
- [x] Adapter le schéma de leçons pour le format JSON enrichi (contentJson, objectifsApprentissage, prerequis, vocabulaireCle, etc.)
- [x] Créer l'interface d'import JSON pour les leçons (upload fichier + coller)
- [x] Conversion automatique JSON → Markdown
- [x] Onglet "Données structurées" pour éditer objectifs, prérequis, vocabulaire
- [x] Ajouter des flèches de retour dans toutes les pages admin (Parcours, Modules, Leçons, Quiz, Users, Alerts, IA, Progression)


## V2 - Remplacement Stripe par Creem
- [x] Supprimer toutes les dépendances Stripe du package.json
- [x] Supprimer les fichiers/imports liés à Stripe (server/stripe.ts, products.ts)
- [x] Retirer les routes/endpoints Stripe
- [x] Intégrer Creem API REST avec clé test
- [x] Créer le service de paiement Creem
- [x] Implémenter POST /api/creem/create-checkout
- [x] Implémenter POST /api/creem/webhook
- [x] Créer les composants frontend pour le checkout Creem
- [x] Mettre à jour la page de tarification avec Creem

## V2 - Corrections Critiques
- [x] Ajouter les index en base de données (userProgress, lessonProgress, etc.)
- [x] Corriger les requêtes N+1 dans getDetailedParcoursProgress
- [x] Corriger la race condition sur les XP (UPDATE atomique avec incrementUserXp)
- [ ] Implémenter le middleware de vérification des permissions par tier
- [ ] Ajouter le rate limiting global et pour endpoints sensibles
- [x] Sanitiser les messages du chatbot (injection de prompts)
- [ ] Ajouter la protection CSRF pour tRPC

## V2 - Refactoring Architecture
- [ ] Découper routers.ts en modules par feature
- [ ] Découper db.ts en repositories par feature
- [x] Implémenter le lazy loading des pages React
- [ ] Réduire les fichiers à moins de 300 lignes

## V2 - Structure 120 Leçons
- [x] Créer la structure des 4 phases (parcours)
- [x] Créer les 24 modules avec mapping aux phases
- [x] Créer les 120 leçons avec titres et structure
- [x] Mapper les compétences (DEP, Sceau Rouge, CAP, BAC)
- [x] Script d'import pour insérer les données

## V2 - Améliorations UX
- [x] Breadcrumbs de navigation (Parcours > Phase > Module > Leçon)
- [x] Carte de progression visuelle avec timeline des 4 phases
- [x] Dashboard étudiant amélioré (carte de progression, prochaine leçon)
- [x] Page de tarification Creem avec design moderne
- [x] Interface admin de gestion des 120 leçons avec filtres par Phase/Module
