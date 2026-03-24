URL du site : https://slurpy.nicolas-thai.fr/
URL du Pocketbase : https://slurpy.nicolas-thai.fr/_/
URL du dépôt : https://github.com/MMI-NFC-2024/sae401-alimentation-et-recettes-THAI-Nicolas

# Explication de mon code

## Architecture

Tout d'abord, même si je me doute que vous attendiez la même structure que dans nos TP précédents, j'ai décidé de réaliser une architecture le plus proche d'une web app scalable qui a besoin d'être maintenable et facilement modifiable par couche. Je suis donc parti sur une architecture par couche, avec une séparation claire entre le front-end et le back-end. Ainsi le backend peut facilement être remplacé par un autre sans devoir toucher au front-end, et inversement.

La couche Services (src/lib/services) : Les fonctions de données pocketbases
=> Toute mes fonctions de données sont regroupées par table de PocketBase dans des fichier typescript dédiés.

La couche components (src/lib/components) : Les composants réutilisables séparés dans deux dossier
=> shell pour les composants de structure (header, footer, etc) et ui pour les composants d'interface (boutons, champs de formulaire, etc)

La couche schemas (src/lib/schemas) : Les schémas de validation de données
=> J'ai utilisé zod pour créer des schémas de validation de données pour les formulaires (ajout d'une recette, modification d'une recette, formulaire de contact, )

Les actions Astros (src/actions) : Les actions pour les formulaires
=> J'ai utilisé les actions Astros pour gérer les soumissions de formulaires, en utilisant les fonctions de données de la couche services pour interagir avec PocketBase. (Utilisation avec l'IA)

La couche Auth (src/lib/auth) : La gestion de l'authentification
=> J'ai créé une couche d'authentification pour gérer les connexions et les inscriptions. Mise en place d'une Oauth avec un provider dynamique (route imbriquée de Astro) pour changer facilement de provider d'authentification (Google, Facebook, etc), avec une sécurité renforcée CSRF et une gestion des tokens d'authentification. Déconnexion en POST dans un logout.ts pour garantir que la déconnexion est intentionnel (évite les bugs de prefetch ou de navigation qui pourraient entraîner une déconnexion accidentelle).

Le middleware (src/middleware) : gère la session PocketBase.
=> Il initialise la session PocketBase à chaque requête dans le contexte (Astro.locals), ce qui permet de vérifier l'authentification de l'utilisateur et d'accéder à ses données de manière sécurisée.

Les pages (src/pages) : Les pages de l'application
=> Page d'accueil
=> Page les recettes et page d'une recette en particulier (lecture, ajout, modification d'une recette et suppression d'une recette)
=> Page les articles et page d'un article en particulier (fiche_aliment ou article de conseil)
=> Page gestion de profil utilisateur et page public de profil utilisateur
=> Page Contact, 404 et mentions légales

Note : J'ai utilisé [slug].astro pour les pages de recette et d'article, ce qui permet d'avoir des URLs propres et facilement compréhensibles (ex: /recettes/ma-recette au lieu de /recettes?id=123).

## Technologies utilisées

Astro & TailwindCSS (App) et PocketBase (Backend) avec Pocketbase-types.
Typescript pour la sécurité de type.
Zod pour la validation de données.
Vue.js pour les composants interactifs (filtrages, barre de recherches, calculateur).
EmailJS pour l'envoi d'emails de contact.
Le MCP PocketBase pour ajouter des records facilement dans les tables de PocketBase.
IDE IA pour la correction et génération de code : VsCode avec Github Copilot, LLM : Claude Sonnet 4.6 et GPT-5.3 Codex
LLM pour poser des questions pour avoir la meilleure architecture possible, questions de code : Gemini 3.1 Pro

## Fonctionnalités

- Authentification avec Email ou plusieurs providers (Google et Facebook actuellement)
- CRUD complet pour les recettes (création, lecture, modification, suppression)
- Profil utilisateur personnalisé (biographie, avatar, objectif santé) avec la possibilité de voir ses recettes
- Formulaire de contact avec EmailJS pour envoyer des emails directement depuis le site
- Système de filtrage et de recherche côté client pour les recettes et les articles (objectifs, régimes, types de plates, notes...)
- Calculateur de calories pour les recettes, avec une estimation basée sur les ingrédients et les quantités
- Poster un commentaire avec une note sur une recette
- Utilisation de Zod pour valider tous les formulaires et les données avant de les envoyer à PocketBase, garantissant ainsi l'intégrité des données et une meilleure expérience utilisateur (contact, ajout/modification recette, avis, etc)
