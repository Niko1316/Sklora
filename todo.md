# Pépites Mondiales - TODO

## Base de données
- [x] Table profiles (extension users avec gamification)
- [x] Table parcours (programmes de formation)
- [x] Table modules (modules de cours)
- [x] Table lessons (leçons)
- [x] Table quizzes (quiz)
- [x] Table quiz_questions (questions de quiz)
- [x] Table quiz_answers (réponses possibles)
- [x] Table user_progress (progression utilisateur)
- [x] Table user_quiz_attempts (tentatives de quiz)
- [x] Table badges (badges de gamification)
- [x] Table user_badges (badges obtenus)
- [x] Table lesson_embeddings (embeddings pour RAG)
- [x] Table chatbot_messages (historique chatbot)
- [x] Table admin_alerts (alertes admin)

## Authentification & Rôles
- [x] Système de rôles admin/étudiant
- [x] Protection des routes admin
- [x] Gestion des profils utilisateurs
- [x] Middleware de sécurité

## Interface Administration
- [x] Dashboard admin avec statistiques
- [x] CRUD Parcours avec éditeur WYSIWYG
- [x] CRUD Modules avec liaison parcours
- [x] CRUD Leçons avec éditeur riche
- [x] CRUD Quiz avec builder de questions
- [x] Gestion des utilisateurs
- [x] Système de liaison modules/leçons/quiz
- [x] Gestion des prérequis et ordre d'affichage
- [x] Analytics et rapports

## Interface Étudiant
- [x] Dashboard étudiant avec progression
- [x] Liste des parcours disponibles
- [x] Vue détaillée parcours avec modules
- [x] Interface de lecture des leçons
- [x] Navigation entre leçons
- [x] Interface de quiz interactif
- [x] Affichage des résultats et feedback
- [x] Profil utilisateur avec statistiques

## Gamification
- [x] Système XP et niveaux
- [x] Calcul automatique des niveaux
- [x] Streaks quotidiens
- [x] Système de badges
- [x] Affichage progression gamification

## Chatbot IA
- [x] Intégration LLM (via API Manus intégrée)
- [x] Système RAG avec embeddings
- [x] Génération d'embeddings pour leçons
- [x] Recherche vectorielle
- [x] Interface chat widget
- [x] Contexte personnalisé utilisateur
- [x] Rate limiting par rôle

## Alertes & Notifications
- [x] Alertes nouvelles inscriptions
- [x] Alertes complétion parcours
- [x] Alertes problèmes techniques
- [x] Interface admin pour alertes
- [x] Notification owner via système intégré

## Design & UX
- [x] Thème éducatif professionnel
- [x] Design mobile-first responsive
- [x] Navigation adaptée admin/étudiant
- [x] Animations et transitions
- [x] États de chargement
- [x] Gestion des erreurs

## Sécurité
- [x] Validation des entrées (Zod)
- [x] Protection XSS
- [x] Rate limiting API
- [x] Audit logs actions admin
- [x] Sanitization contenu HTML

## Tests
- [x] Tests unitaires pour authentification
- [x] Tests pour procédures protégées
- [x] Tests pour validation des rôles
