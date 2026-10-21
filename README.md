# MyShelf

Projet Vue.js réalisé à deux : une appli pour gérer sa collection de films et de livres.
On cherche un film ou un livre, on l'ajoute à sa bibliothèque, on suit son statut
(à voir / en cours / terminé) et on peut mettre des favoris.

## Installation

Il faut Node.js 22 ou plus récent.

```bash
git clone https://github.com/Nox612/Project_UI.git
cd Project_UI/Project
npm install
npm run dev
```

Puis ouvrir l'adresse affichée dans le terminal (en général http://localhost:5173).

Les clés API sont déjà dans le fichier `Project/.env`, il n'y a rien à configurer.

## API utilisées

- **OMDb API** (https://www.omdbapi.com) pour les films : titre, réalisateur, année, affiche, résumé, note
- **Google Books API** (https://developers.google.com/books) pour les livres : titre, auteur, année, couverture, résumé
- **Open Library** (https://openlibrary.org/developers/api) pour les livres tendance de l'accueil,
  et en secours quand Google Books ne répond pas (ça arrive souvent, erreur 503)

Les deux API sont appelées dans `src/api/index.js`, qui transforme leurs réponses
dans un format commun (`id`, `type`, `title`, `creator`, `year`, `cover`, `description`).

## Ce qu'on a fait

- Accueil avec une sélection « Trending Now » et les derniers ajouts
- Recherche de films, de livres ou des deux (« All ») avec l'API
- Bibliothèque (`/library`) : ajout, suppression, statut, favoris
- Page des favoris (`/favorites`)
- Page de détail d'un film ou d'un livre (`/item/:id`)
- Store Vuex (state, getters, mutations, actions) dans `src/store/`
- Sauvegarde de la bibliothèque dans le localStorage (elle reste après un refresh)

Fonctionnalités en plus :

- Filtres (type, statut, favoris), tri (date d'ajout, titre, année) et recherche dans la bibliothèque
- Page de détail avec route dynamique
- Chargement, message d'erreur, « aucun résultat », bouton « Load more », pas de doublons
- Interface responsive qui suit la maquette Figma, mode sombre (bouton sur l'accueil),
  états vides, confirmation avant suppression, notifications

## Organisation du code

```
Project/src/
  api/          appels aux API et format commun des items
  store/        store Vuex (module library) + sauvegarde localStorage
  routers/      routes de l'appli
  views/        pages : Home, Search, Item, Library, Favorites
  components/   barre de recherche, cartes, navigation, notifications…
```

## Maquette

Persona :

**Camille** étudiante cinéma, 22 ans

Elle vit en colocation à Lyon et passe environ une heure par jour dans les transports, avec son smartphone comme outil principal. Elle regarde deux ou trois films par semaine, lit un livre par mois et adore partager des recommandations avec ses amis.

Son problème, c’est qu’elle ne sait pas où ranger ces recommandations. Elle les note dans son téléphone, fait des captures d’écran et au moment de choisir un film, elle ne retrouve plus rien.

Pour cela elle utilise Lettersquare pour les films et les livres, recherche, ajout et progression, une bibliothèque qui se souvient d’elle sans avoir à créer de compte.

De là vient notre question : comment aider les amateurs de films et de livres à rassembler, suivre et retrouver facilement ce qu’ils veulent voir ou lire, en un seul endroit simple et rapide ?