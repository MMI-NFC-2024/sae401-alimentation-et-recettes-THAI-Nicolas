<template>
  <!-- Barre d'outils: filtre par type + recherche texte -->
  <div
    class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between"
  >
    <!-- Filtres de type d'article (selection unique) -->
    <div class="flex gap-2">
      <button
        type="button"
        class="uppercase"
        :class="selectedType === 'all' ? 'btn-green' : 'btn-outline'"
        @click="setType('all')"
      >
        Tout
      </button>
      <button
        type="button"
        class="uppercase"
        :class="selectedType === 'conseil' ? 'btn-green' : 'btn-outline'"
        @click="setType('conseil')"
      >
        Conseils
      </button>
      <button
        type="button"
        class="uppercase"
        :class="selectedType === 'fiche_aliment' ? 'btn-green' : 'btn-outline'"
        @click="setType('fiche_aliment')"
      >
        Fiches
      </button>
    </div>

    <!-- Champ de recherche sur le titre -->
    <SearchInput
      id="article-search"
      v-model="searchQuery"
      label="Rechercher un article"
      placeholder="Rechercher un article..."
      variant="article"
      wrapper-class="relative mt-6 lg:mt-0"
    />
  </div>

  <!-- Pagination rendue dans un conteneur externe pour garder la mise en page de la page Astro -->
  <Teleport to="#articles-pagination" v-if="hydrated && totalPages > 1">
    <PaginationNav
      :current-page="currentPage"
      :total-pages="totalPages"
      :visible-pages="visiblePages"
      label="Pagination des articles"
      size="lg"
      class-name="flex items-center gap-2"
      @change="goToPage"
    />
  </Teleport>
</template>

<script setup lang="ts">
// Composition API Vue
import { computed, onMounted, ref, watch } from "vue";
import PaginationNav from "./PaginationNav.vue";
import SearchInput from "./SearchInput.vue";
import { useDebouncedRef } from "../../lib/composables/useDebouncedRef";
import { clampPage, getVisiblePages } from "../../lib/utils/pagination";

// Types de filtres disponibles pour les articles
type ArticleType = "all" | "conseil" | "fiche_aliment";

// Paramètres de pagination
const perPage = 9;
const maxPageButtons = 5;

// Etat UI principal
const searchQuery = ref("");
const debouncedSearchQuery = useDebouncedRef(searchQuery, 300);
const selectedType = ref<ArticleType>("all");
const currentPage = ref(1);
const hydrated = ref(false);

// Références vers les éléments DOM déjà rendus par Astro
const articleItems = ref<HTMLElement[]>([]);
const emptyStateElement = ref<HTMLElement | null>(null);

// Normalise les chaines pour un filtrage robuste (trim + casse)
const normalize = (value: string) => value.trim().toLowerCase();

// Liste filtrée selon le type et la recherche
const filteredItems = computed(() => {
  const query = normalize(debouncedSearchQuery.value);

  return articleItems.value.filter((item) => {
    const type = item.dataset.type ?? "";
    const title = normalize(item.dataset.title ?? "");
    const typeMatches =
      selectedType.value === "all" || type === selectedType.value;
    const queryMatches = query.length === 0 || title.includes(query);

    return typeMatches && queryMatches;
  });
});

// Nombre total de pages selon le résultat filtré
const totalPages = computed(() => {
  if (filteredItems.value.length === 0) return 0;
  return Math.ceil(filteredItems.value.length / perPage);
});

// Tranche d'articles à afficher pour la page courante
const paginatedItems = computed(() => {
  if (totalPages.value === 0) return [];

  const start = (currentPage.value - 1) * perPage;
  const end = start + perPage;
  return filteredItems.value.slice(start, end);
});

// Fenêtre glissante des numéros de page (max 5 boutons)
const visiblePages = computed(() => {
  return getVisiblePages(currentPage.value, totalPages.value, maxPageButtons);
});

// Applique concrètement l'affichage/masquage des cartes et de l'état vide
const render = () => {
  const visible = new Set(paginatedItems.value);

  articleItems.value.forEach((item) => {
    item.hidden = !visible.has(item);
  });

  if (!emptyStateElement.value) return;

  const hasResults = filteredItems.value.length > 0;
  emptyStateElement.value.hidden = hasResults;
  emptyStateElement.value.textContent = hasResults
    ? ""
    : "Aucun article ne correspond aux filtres selectionnes.";
};

// Garantit que la page courante reste toujours dans les bornes valides
const syncPageBounds = () => {
  currentPage.value = clampPage(currentPage.value, totalPages.value);
};

// Utilitaire commun: revenir proprement sur la première page
const resetToFirstPage = () => {
  currentPage.value = 1;
};

// Change le filtre de type et repart à la page 1
const setType = (type: ArticleType) => {
  selectedType.value = type;
  resetToFirstPage();
};

// Navigation de pagination
const goToPage = (page: number) => {
  if (page === currentPage.value) return;
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Toute recherche (debounce) redémarre la pagination à la première page
watch(debouncedSearchQuery, () => {
  resetToFirstPage();
});

// Re-render global dès qu'un facteur de rendu change
watch([filteredItems, totalPages, currentPage], () => {
  syncPageBounds();
  render();
});

// Initialisation: lecture du DOM Astro puis premier rendu
onMounted(() => {
  articleItems.value = Array.from(
    document.querySelectorAll("[data-article-item]"),
  );
  emptyStateElement.value = document.querySelector("#articles-empty");

  hydrated.value = true;
  syncPageBounds();
  render();
});
</script>
