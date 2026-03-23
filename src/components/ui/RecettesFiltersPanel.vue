<template>
  <!-- Colonne de filtres (recherche + criteres) -->
  <aside
    class="w-full lg:max-w-65 lg:pr-8 lg:border-r-2 lg:border-primary/15 lg:mt-20"
  >
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-xl">Filtres</h3>
      <button
        type="button"
        class="rounded-sm bg-primary px-3 py-1 text-[10px] font-barlow uppercase tracking-wide text-secondary cursor-pointer"
        @click="resetFilters"
      >
        <!-- Remet tous les filtres à leur valeur initiale -->
        Reinitialiser
      </button>
    </div>

    <hr class="mt-3 border-primary/35" />

    <div class="mt-8 space-y-8">
      <!-- Recherche texte sur le titre -->
      <div>
        <p class="label">Recherche</p>
        <SearchInput
          id="recette-search"
          v-model="searchQuery"
          label="Rechercher une recette"
          placeholder="Chercher une recette..."
          variant="recette"
          wrapper-class="mt-3"
        />
      </div>

      <!-- Objectifs santé: multi-selection -->
      <div>
        <p class="label">Objectifs</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="goal in goals"
            :key="goal"
            type="button"
            class="uppercase px-4! py-2! text-xs! cursor-pointer"
            :class="selectedGoals.has(goal) ? 'btn-green' : 'btn-outline'"
            @click="toggleGoal(goal)"
          >
            {{ goal }}
          </button>
        </div>
      </div>

      <!-- Régime: sélection simple via select -->
      <div>
        <p class="label">Regimes</p>
        <select
          v-model="selectedRegime"
          class="mt-3 w-full rounded-md cursor-pointer border-2 border-primary bg-secondary px-3 py-2 text-xs font-barlow uppercase tracking-wide text-primary shadow-[0_3px_0_0_var(--color-primary)] outline-none"
        >
          <option value="">Tous</option>
          <option v-for="regime in regimes" :key="regime.id" :value="regime.id">
            {{ regime.name }}
          </option>
        </select>
      </div>

      <!-- Types de plats: multi-selection via cases à cocher -->
      <div>
        <p class="label">Types de plats</p>
        <div class="mt-3 grid grid-cols-2 gap-y-3">
          <label
            v-for="type in dishTypes"
            :key="type.value"
            class="inline-flex items-center gap-2 text-sm font-afacad uppercase"
          >
            <input
              type="checkbox"
              class="h-4 w-4 appearance-none rounded-sm border-2 border-primary bg-secondary checked:bg-primary cursor-pointer"
              :checked="selectedDishTypes.has(type.value)"
              @change="toggleDishType(type.value)"
            />
            {{ type.label }}
          </label>
        </div>
      </div>

      <!-- Note minimale: étoiles cliquables -->
      <div>
        <p class="label">Notes</p>
        <div class="mt-3 flex items-center gap-1.5 text-3xl leading-none">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="leading-none cursor-pointer"
            :class="star <= minRating ? 'text-accent1' : 'text-primary/35'"
            :aria-label="`Filtrer a partir de ${star} etoiles`"
            @click="setRating(star)"
          >
            ★
          </button>
        </div>
      </div>
    </div>
  </aside>

  <!-- Pagination rendue dans la zone dédiée de la page recettes -->
  <Teleport to="#recettes-pagination" v-if="hydrated && totalPages > 1">
    <PaginationNav
      :current-page="currentPage"
      :total-pages="totalPages"
      :visible-pages="visiblePages"
      label="Pagination des recettes"
      size="sm"
      class-name="flex items-center justify-center gap-2"
      @change="goToPage"
    />
  </Teleport>
</template>

<script setup lang="ts">
// Composition API Vue
import { computed, onMounted, ref, watch } from "vue";
import PaginationNav from "./PaginationNav.vue";
import SearchInput from "./SearchInput.vue";
// Type partagé provenant du service (évite les duplications de modèles)
import type { RegimeOption } from "../../lib/services/regimes.service";
import { useDebouncedRef } from "../../lib/composables/useDebouncedRef";
import { clampPage, getVisiblePages } from "../../lib/utils/pagination";

// Régimes injectés depuis la page Astro (chargés côté serveur)
const { regimes } = defineProps<{ regimes: RegimeOption[] }>();

// Paramètres de pagination et jeux de filtres statiques
const perPage = 9;
const maxPageButtons = 5;
const goals = ["Prise de masse", "Perte de poids", "Équilibre"] as const;
const dishTypes = [
  { value: "Entrée", label: "Entrees" },
  { value: "Plat", label: "Plats" },
  { value: "Dessert", label: "Desserts" },
  { value: "Boisson", label: "Boissons" },
] as const;

// Etat global du panneau de filtres
const hydrated = ref(false);
const searchQuery = ref("");
const debouncedSearchQuery = useDebouncedRef(searchQuery, 300);
const selectedRegime = ref("");
const minRating = ref(0);
const currentPage = ref(1);
const selectedGoals = ref<Set<string>>(new Set());
const selectedDishTypes = ref<Set<string>>(new Set());

// Références vers les cartes déjà rendues par Astro
const recipeItems = ref<HTMLElement[]>([]);
const emptyStateElement = ref<HTMLElement | null>(null);

// Normalise les chaines pour comparer de façon cohérente
const normalize = (value: string) => value.trim().toLowerCase();

// Helper générique pour ajouter/retirer une valeur dans un Set réactif
const toggleSetValue = (
  setRef: typeof selectedGoals | typeof selectedDishTypes,
  value: string,
) => {
  const next = new Set(setRef.value);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  setRef.value = next;
  currentPage.value = 1;
};

// Actions spécialisées pour garder le template lisible
const toggleGoal = (goal: string) => {
  toggleSetValue(selectedGoals, goal);
};

const toggleDishType = (dishType: string) => {
  toggleSetValue(selectedDishTypes, dishType);
};

// Clique sur étoile: active/désactive une note minimale
const setRating = (star: number) => {
  minRating.value = minRating.value === star ? 0 : star;
  currentPage.value = 1;
};

// Reset complet du panneau
const resetFilters = () => {
  searchQuery.value = "";
  debouncedSearchQuery.value = "";
  selectedRegime.value = "";
  minRating.value = 0;
  selectedGoals.value = new Set();
  selectedDishTypes.value = new Set();
  currentPage.value = 1;
};

// Noyau de filtrage combiné (tous les critères)
const filteredItems = computed(() => {
  const query = normalize(debouncedSearchQuery.value);

  return recipeItems.value.filter((item) => {
    const title = normalize(item.dataset.title ?? "");
    const objectif = item.dataset.objectif ?? "";
    const categorie = item.dataset.categorie ?? "";
    const rating = Number(item.dataset.rating ?? "0");
    const regimesList = (item.dataset.regimes ?? "").split(",").filter(Boolean);

    const titleMatch = query.length === 0 || title.includes(query);
    const objectifMatch =
      selectedGoals.value.size === 0 || selectedGoals.value.has(objectif);
    const categorieMatch =
      selectedDishTypes.value.size === 0 ||
      selectedDishTypes.value.has(categorie);
    const regimeMatch =
      selectedRegime.value === "" || regimesList.includes(selectedRegime.value);
    const ratingMatch = minRating.value === 0 || rating >= minRating.value;

    return (
      titleMatch &&
      objectifMatch &&
      categorieMatch &&
      regimeMatch &&
      ratingMatch
    );
  });
});

// Nombre de pages pour la pagination
const totalPages = computed(() =>
  Math.ceil(filteredItems.value.length / perPage),
);

// Items visibles sur la page courante
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredItems.value.slice(start, start + perPage);
});

// Fenêtre de pagination glissante
const visiblePages = computed(() => {
  return getVisiblePages(currentPage.value, totalPages.value, maxPageButtons);
});

// Navigation entre pages en restant dans les bornes
const goToPage = (page: number) => {
  const nextPage = Math.min(Math.max(page, 1), Math.max(totalPages.value, 1));

  if (nextPage === currentPage.value) return;

  currentPage.value = nextPage;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Garantit que la page courante reste dans les bornes valides
const syncPageBounds = () => {
  currentPage.value = clampPage(currentPage.value, totalPages.value);
};

// Utilitaire commun: revenir proprement sur la première page
const resetToFirstPage = () => {
  currentPage.value = 1;
};

// Synchronise le DOM (masque/affiche cartes) + message si aucun résultat
const render = () => {
  const visible = new Set(paginatedItems.value);

  recipeItems.value.forEach((item) => {
    item.hidden = !visible.has(item);
  });

  if (emptyStateElement.value) {
    const hasResults = filteredItems.value.length > 0;
    emptyStateElement.value.hidden = hasResults;
    emptyStateElement.value.textContent = hasResults
      ? ""
      : "Aucune recette ne correspond a ces filtres.";
  }
};

// Recalcul de rendu quand la page ou le set filtré évolue
watch([filteredItems, currentPage], () => {
  syncPageBounds();
  render();
});

// Tout changement de critère principal (hors recherche, gérée par debounce) repart à la première page
watch([selectedRegime, minRating, debouncedSearchQuery], () => {
  resetToFirstPage();
});

// Initialisation: capture des cartes générées par Astro puis premier rendu
onMounted(() => {
  recipeItems.value = Array.from(
    document.querySelectorAll("[data-recette-item]"),
  );
  emptyStateElement.value = document.querySelector("#recettes-empty");
  hydrated.value = true;
  syncPageBounds();
  render();
});
</script>
