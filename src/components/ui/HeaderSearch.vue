<template>
  <div ref="rootRef" class="relative" @click.stop>
    <button
      type="button"
      :aria-label="
        isOpen ? 'Fermer la recherche globale' : 'Ouvrir la recherche globale'
      "
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-controls="global-header-search-panel"
      class="global-search-trigger cursor-pointer inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-primary text-secondary shadow-[0_4px_0_0_color-mix(in_srgb,var(--color-primary)_75%,black_25%)] transition-all duration-200 hover:translate-y-px hover:shadow-[0_3px_0_0_color-mix(in_srgb,var(--color-primary)_75%,black_25%)]"
      @click.stop="toggleSearch"
    >
      <img
        :src="searchIcon.src"
        alt=""
        class="global-search-icon-default h-5 w-5 object-contain"
      />
      <img
        v-if="scrolledIconSrc"
        :src="scrolledIconSrc"
        alt=""
        class="global-search-icon-scrolled hidden h-5 w-5 object-contain"
      />
    </button>

    <div
      v-if="isOpen"
      id="global-header-search-panel"
      class="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(38rem,70vw)] rounded-2xl border-2 border-primary bg-secondary p-3 shadow-[0_6px_0_0_var(--color-primary)]"
    >
      <div class="relative">
        <label for="global-search-input" class="sr-only"
          >Rechercher des recettes ou des articles</label
        >
        <input
          id="global-search-input"
          ref="inputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher une recette ou un article..."
          class="w-full rounded-xl border-2 border-primary bg-secondary text-primary py-2.5 pl-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          aria-label="Fermer la recherche"
          class="absolute cursor-pointer right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary text-primary"
          @click.stop="closeSearch"
        >
          ×
        </button>
      </div>

      <div
        v-if="debouncedSearchQuery.trim().length > 0"
        class="mt-2 max-h-80 overflow-auto rounded-xl border border-primary/20"
      >
        <p
          v-if="visibleResults.length === 0"
          class="px-3 py-2 text-sm text-primary/65"
        >
          Aucun resultat.
        </p>

        <ul v-else class="divide-y divide-primary/10">
          <li v-for="item in visibleResults" :key="`${item.kind}-${item.id}`">
            <a
              :href="item.href"
              class="flex items-center justify-between gap-3 px-3 py-2 transition-colors hover:bg-primary/8"
              @click="closeSearch"
            >
              <span class="truncate text-sm text-primary">{{
                item.title
              }}</span>
              <span
                class="shrink-0 rounded-md border border-primary/30 px-2 py-0.5 text-[10px] font-barlow uppercase tracking-wide text-primary/80"
              >
                {{ item.kind === "recette" ? "Recette" : "Article" }}
              </span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import searchIcon from "../../assets/icones/search.webp";
import { useDebouncedRef } from "../../lib/composables/useDebouncedRef";

type SearchItem = {
  id: string;
  kind: "article" | "recette";
  title: string;
  href: string;
};

const props = defineProps<{
  items: SearchItem[];
  scrolledIconSrc?: string;
}>();

const { scrolledIconSrc } = props;

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const isOpen = ref(false);
const searchQuery = ref("");
const debouncedSearchQuery = useDebouncedRef(searchQuery, 250);

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const sortedResults = computed(() => {
  const query = normalize(debouncedSearchQuery.value);
  if (!query) return [];

  const startsWith: SearchItem[] = [];
  const includes: SearchItem[] = [];

  for (const item of props.items) {
    const title = normalize(item.title);
    if (title.startsWith(query)) {
      startsWith.push(item);
      continue;
    }
    if (title.includes(query)) {
      includes.push(item);
    }
  }

  return [...startsWith, ...includes];
});

const visibleResults = computed(() => sortedResults.value.slice(0, 8));

const toggleSearch = async () => {
  if (isOpen.value) {
    closeSearch();
    return;
  }

  await openSearch();
};

const openSearch = async () => {
  isOpen.value = true;
  await nextTick();
  inputRef.value?.focus();
};

const closeSearch = () => {
  isOpen.value = false;
  searchQuery.value = "";
};

const onDocumentClick = (event: MouseEvent) => {
  if (!isOpen.value || !rootRef.value) return;
  const target = event.target as Node;
  if (!rootRef.value.contains(target)) {
    closeSearch();
  }
};

const onEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeSearch();
  }
};

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onEscape);
});

onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onEscape);
});
</script>
