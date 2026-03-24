URL du site : https://slurpy.nicolas-thai.fr/
URL du Pocketbase : https://slurpy.nicolas-thai.fr/_/
URL du dépôt : https://github.com/MMI-NFC-2024/sae401-alimentation-et-recettes-THAI-Nicolas

Note : Pour les formulaires, mon serveur nginx accepte seulement les images inférieur à 1Mo, sinon => "Erreur 413 Request Entity Too Large"

## Architecture du projet

Tout d'abord, même si je me doute que vous attendiez la même structure que dans nos TP précédents, j'ai décidé de réaliser une architecture le plus proche d'une web app scalable qui a besoin d'être maintenable et facilement modifiable par couche. Je suis donc parti sur une architecture par couche, avec une séparation claire entre le front-end et le back-end. Ainsi le backend peut facilement être remplacé par un autre sans devoir toucher au front-end, et inversement.

La couche Services (src/lib/services) : Les fonctions de données pocketbases
=> Toute mes fonctions de données sont regroupées par table de PocketBase dans des fichier typescript dédiés.

La couche components (src/components) : Les composants réutilisables séparés dans deux dossier
=> shell pour les composants de structure (header, footer, etc) et ui pour les composants d'interface (boutons, champs de formulaire, etc)

La couche schemas (src/schemas) : Les schémas de validation de données
=> J'ai utilisé zod pour créer des schémas de validation de données pour les formulaires (ajout d'une recette, modification d'une recette, formulaire de contact, )

Les actions Astro (src/actions) : Les actions pour les formulaires
=> J'ai utilisé les actions Astro pour gérer les soumissions de formulaires, en utilisant les fonctions de données de la couche services pour interagir avec PocketBase. (Utilisation avec l'IA)

La couche Auth (src/pages/auth) : La gestion de l'authentification
=> J'ai créé une couche d'authentification pour gérer les connexions et les inscriptions. Mise en place d'une Oauth avec un provider dynamique (route imbriquée de Astro) pour changer facilement de provider d'authentification (Google, Facebook, etc), avec une sécurité renforcée CSRF et une gestion des tokens d'authentification. Déconnexion en POST dans un logout.ts pour garantir que la déconnexion est intentionnel (évite les bugs de prefetch ou de navigation qui pourraient entraîner une déconnexion accidentelle).

Le middleware (src/middleware) : gère la session PocketBase.
=> Il initialise la session PocketBase à chaque requête dans le contexte (Astro.locals), ce qui permet de vérifier l'authentification de l'utilisateur et d'accéder à ses données de manière sécurisée.

La couch Layouts (src/layouts) : Les layouts de l'application
=> Le Layout principal qui inclut le header et le footer optimisé SEO
=> Le layoutAuth pour les pages de login et register (sans header ni footer)
=> Et le ProtectedLayout pour les pages qui nécessitent une authentification (profil utilisateur, ajout/modification de recette, etc)

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
Les astros Actions pour gérer les soumissions de formulaires et la logique côté serveur de façon sécurisée.
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
- Mise en place d'une fausse Newsletter qui m'envoie une notif quand quelqu'un s'inscrit
- Système de filtrage et de recherche côté client pour les recettes et les articles (objectifs, régimes, types de plates, notes...)
- Calculateur de calories pour les recettes, avec une estimation basée sur les ingrédients et les quantités
- Poster un commentaire avec une note sur une recette
- Utilisation de Zod pour valider tous les formulaires et les données avant de les envoyer à PocketBase, garantissant ainsi l'intégrité des données et une meilleure expérience utilisateur (contact, ajout/modification recette, avis, etc)

## Mon utilisation de l'IA POUR le projet

J'ai utilisé l'IA comme un mentor sénior en développement pour m'aider à structurer mon projet et mettre en place des pratiques qui se rapprochent le plus possible d'un code de niveau sénior, pour une app web moderne, scalable et maintenable. Dès que j'avais une question sur mon code, pour savoir la meilleure pratique à adopter, pourquoi celle-là ? Quand utiliser un composant Vue ou Astro ? L'intêret de Zod avec les Astro Actions ? Je demandais directement à l'IA.

Prompt que je lui ai donné pour qu'il soit adapté à mon projet :

"Tu es un mentor sénior en développement web Fullstack et Architecte logiciel. Je construis 'Slurpy', une application web de nutrition healthy moderne utilisant Astro (SSR/Hybrid), Tailwind CSS, TypeScript et PocketBase.

TA MISSION
M'accompagner dans la création d'une architecture scalable et maintenable, en me guidant sur les meilleures pratiques de développement, les choix technologiques et la structuration du code. Je veux que mon projet soit organisé de manière professionnelle, avec une séparation claire des responsabilités et une utilisation efficace des technologies.

METHODE
Ne te contentes pas de me donner une réponse directe à mes questions. Adopte une approche pédagogique en m'expliquant les raisons derrière chaque recommandation, les avantages et les inconvénients des différentes options, et comment elles s'appliquent spécifiquement à mon projet 'Slurpy'. Fournis-moi des exemples concrets et des références à la documentation officielle recénte quand c'est pertinent.
"

### L'utilisation de l'IA POUR le code

- Structuration de l'architecture du projet (couches, organisation des fichiers, etc)

- Pour le debuggage, j'utilise le principe du CoT (Chain of Thought) en décomposant mon problème en 3 étapes : lui expliquer le problème en lui donnant mon opinion sur la cause du bug, lui demander de me donner les étapes pour corriger le bug et ensuite lui demander d'appliquer les étapes pour corriger le bug.

  Exemple de prompt de debug d'un boutton flottant :

  "On retourne vers la page des recettes #file:index.astro : J’ai un bug que j’ai vraiment du mal à gérer, c’est que j’aperçois un bouton de recherche non cliquable sur ma page des recettes à droite. Je pense que de base il était avec la barre de recherche, sauf que vu que c’est une barre de recherche coté client je n’ai plus besoin de ce bouton de toute façon. J’aimerai comprendre pourquoi il traine là (je ne peux meme pas l’inspecter), et avoir les étapes pour le trouver et l’enlever. Passe ensuite à l’action et enlève le définitivement"

- Création de composants Vue ou de fonctions avec typescript en utilisant le principe SPEC (Stack, Purpose, Exigences, Contraintes) qui sert de cahier des charges pour l'IA afin d'avoir une réponse la plus adaptée possible à mon besoin.
  Exemple de prompt pour la création du calculateur dynamique des calories en Vue.js :

  "STACK
  Utilise la dernière version de Vue.JS, tailwindcss pour les styles avec mes variables dans le #global.css, et typescript pour le typage.

  Purpose (objectif)
  Créer un composant interactif "Calculateur de Portions et Calories" pour les fiches recettes de Slurpy. Ce composant doit permettre à l'utilisateur d'ajuster dynamiquement la recette selon ses besoins caloriques ou le nombre de portions, tout en mettant à jour la liste des ingrédients située ailleurs dans la page.

  Exigences
  - Le composant doit être réactif et mettre à jour les calculs et portions en temps réel.
  - Faire les props en typescript pour garantir une bonne sécurité de type.
  - Les utilisateurs doivent pouvoir ajuster aussi le nombre de portions et voir les modifications dans la liste des ingrédients.
  - Si tu as besoin de créer des fonctions utilitaires pour les calculs, crée les dans un fichier utils.ts à part et exporte les fonctions pour les utiliser dans le composant.

  Contraintes
  - Gère la sécurité avec des valeurs non finies et des fallbacks pour éviter les bugs d'affichage.
  - Mettre des cursor-pointer sur les éléments interactifs pour améliorer l'UX.
  - Utilise les classes Tailwind CSS pour le styling, en respectant la charte graphique de Slurpy définie dans le #global.css.
  - Gère les arrondis de calories à une virgule près pour éviter les chiffres à virgules trop longs.
    "

- Grosse partie pour m'aider à "combler" des lacunes techniques au niveau de la génération de schemas Zod avec les actions Astro pour la validation de mes formulaires. Les typages avec Typescript, les composants Vue (qui sont nouveaux pour moi), la sécurisation de l'authentification OAuth (CSRF, gestion des tokens, etc), la gestion des erreurs (fallbacks) et la refactorisation du code en plusieurs composants réutilisables pour éviter la duplication de code.

Note : Pour le debug ou pour donner des exemples à mon IA, je lui donne quasiment toujours des captures d'écrans pour montrer le résultat attendu (maquette) ou le résultat actuel (bug). J'utilise aussi un # pour nommer un fichier précis pour réduire les hallucinations et la perte de tokens inutile.
