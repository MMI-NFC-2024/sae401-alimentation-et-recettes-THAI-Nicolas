<template>
  <article
    class="rounded-2xl border-2 border-primary bg-secondary p-5 shadow-[0_4px_0_0_var(--color-primary)]"
  >
    <h2 class="mb-5">Ingredients</h2>

    <div class="mb-5 grid gap-4 md:grid-cols-[220px_1fr]">
      <div>
        <label class="label" for="ingredients-categorie-filter"
          >Categorie</label
        >
        <select
          id="ingredients-categorie-filter"
          v-model="selectedCategory"
          class="input mt-2"
        >
          <option value="all">Toutes</option>
          <option
            v-for="category in categoryOptions"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>

      <div>
        <label class="label" for="ingredients-search"
          >Rechercher un ingredient</label
        >
        <input
          id="ingredients-search"
          v-model="searchQuery"
          class="input mt-2"
          placeholder="Tomate, saumon, riz..."
        />
      </div>
    </div>

    <div
      class="mb-6 max-h-56 overflow-auto rounded-2xl border-2 border-primary bg-secondary p-3"
    >
      <p
        v-if="filteredIngredients.length === 0"
        class="text-sm text-primary/70"
      >
        Aucun ingredient trouve.
      </p>

      <div v-else class="flex flex-wrap gap-2">
        <button
          v-for="item in filteredIngredients"
          :key="item.id"
          type="button"
          class="rounded-full border-2 px-3 py-1 text-sm font-bold transition-colors"
          :class="
            isSelected(item.id)
              ? 'border-green-700 bg-green-600 text-white hover:bg-green-700'
              : 'border-primary bg-secondary text-primary hover:bg-primary/10'
          "
          @click="addCompositionItem(item)"
        >
          {{ item.nom }}
        </button>
      </div>
    </div>

    <ul class="space-y-3">
      <li
        v-for="item in compositionState"
        :key="item.ingredientId"
        class="rounded-xl border-2 border-primary bg-secondary p-3"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <p class="font-semibold text-primary">
            {{ item.nom }}
          </p>
          <button
            type="button"
            class="text-sm font-bold text-accent2 underline underline-offset-2"
            @click="removeCompositionItem(item.ingredientId)"
          >
            Retirer
          </button>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <label class="text-sm font-bold text-primary">
            Quantite
            <input
              v-model.number="item.quantite"
              type="number"
              min="0"
              step="0.1"
              class="input mt-2"
            />
          </label>

          <label class="text-sm font-bold text-primary">
            Unite
            <select v-model="item.unite" class="input mt-2">
              <option value="">Choisir</option>
              <option v-for="unite in units" :key="unite" :value="unite">
                {{ unite }}
              </option>
            </select>
          </label>
        </div>
      </li>
    </ul>
  </article>

  <article
    class="rounded-2xl border-2 border-primary bg-secondary p-5 shadow-[0_4px_0_0_var(--color-primary)]"
  >
    <h2 class="mb-5">Etapes</h2>

    <ul class="space-y-3">
      <li
        v-for="(etape, index) in etapesState"
        :key="index"
        class="rounded-xl border-2 border-primary bg-secondary p-3"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <p class="font-semibold text-primary">Etape {{ index + 1 }}</p>
          <button
            type="button"
            class="text-sm font-bold text-accent2 underline underline-offset-2"
            @click="removeEtapeItem(index)"
          >
            Retirer
          </button>
        </div>

        <div class="space-y-3">
          <label class="text-sm font-bold text-primary">
            Titre
            <input v-model="etape.titre" class="input mt-2" />
          </label>

          <label class="text-sm font-bold text-primary">
            Description
            <textarea
              v-model="etape.description"
              class="mt-2 w-full rounded-2xl border-2 border-primary bg-secondary px-4 py-3 text-primary outline-none"
              rows="4"
            ></textarea>
          </label>
        </div>
      </li>
    </ul>

    <div class="mt-4">
      <button type="button" class="btn-outline" @click="addEtapeItem">
        Ajouter une etape
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

interface IngredientLite {
  id: string;
  nom: string;
  categorie?: string;
}

interface CompositionItem {
  ingredientId: string;
  nom: string;
  categorie?: string;
  quantite: number;
  unite: string;
}

interface EtapeItem {
  titre: string;
  description: string;
}

const props = withDefaults(
  defineProps<{
    ingredients: IngredientLite[];
    initialComposition: CompositionItem[];
    initialEtapes: EtapeItem[];
    compositionInputId?: string;
    etapesInputId?: string;
  }>(),
  {
    compositionInputId: "compositionJson",
    etapesInputId: "etapesJson",
  },
);

const units = [
  "g",
  "kg",
  "ml",
  "cl",
  "L",
  "c. a soupe",
  "c. a cafe",
  "pincee",
  "filet",
  "piece",
  "tranche",
  "feuille",
  "sachet",
  "bol",
  "cm",
  "gousse",
];

const selectedCategory = ref("all");
const searchQuery = ref("");
const compositionState = ref<CompositionItem[]>([]);
const etapesState = ref<EtapeItem[]>([]);

const categoryOptions = computed(() => {
  const categories = new Set(
    props.ingredients.map((item) => item.categorie || "Autres"),
  );
  return [...categories].sort();
});

const filteredIngredients = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return props.ingredients.filter((item) => {
    const category = item.categorie || "Autres";
    const byCategory =
      selectedCategory.value === "all" || category === selectedCategory.value;
    const byQuery =
      query.length === 0 || item.nom.toLowerCase().includes(query);
    return byCategory && byQuery;
  });
});

function isSelected(ingredientId: string) {
  return compositionState.value.some((item) => item.ingredientId === ingredientId);
}

function addCompositionItem(ingredient: IngredientLite) {
  const exists = isSelected(ingredient.id);
  if (exists) return;

  compositionState.value.unshift({
    ingredientId: ingredient.id,
    nom: ingredient.nom,
    categorie: ingredient.categorie || "Autres",
    quantite: 0,
    unite: "",
  });
}

function removeCompositionItem(ingredientId: string) {
  compositionState.value = compositionState.value.filter(
    (item) => item.ingredientId !== ingredientId,
  );
}

function addEtapeItem() {
  etapesState.value.push({ titre: "", description: "" });
}

function removeEtapeItem(index: number) {
  etapesState.value.splice(index, 1);

  if (etapesState.value.length === 0) {
    addEtapeItem();
  }
}

function updateHiddenInputs() {
  const compositionInput = document.getElementById(
    props.compositionInputId,
  ) as HTMLInputElement | null;
  const etapesInput = document.getElementById(
    props.etapesInputId,
  ) as HTMLInputElement | null;

  if (compositionInput) {
    compositionInput.value = JSON.stringify(
      compositionState.value.map((item) => ({
        ingredientId: item.ingredientId,
        quantite: Number(item.quantite || 0),
        unite: item.unite,
      })),
    );
  }

  if (etapesInput) {
    etapesInput.value = JSON.stringify(
      etapesState.value.map((item) => ({
        titre: item.titre,
        description: item.description,
      })),
    );
  }
}

onMounted(() => {
  compositionState.value = props.initialComposition.map((item) => ({
    ingredientId: item.ingredientId,
    nom: item.nom,
    categorie: item.categorie || "Autres",
    quantite: Number(item.quantite || 0),
    unite: item.unite || "",
  }));

  etapesState.value = props.initialEtapes.length
    ? props.initialEtapes.map((item) => ({
        titre: item.titre || "",
        description: item.description || "",
      }))
    : [{ titre: "", description: "" }];

  updateHiddenInputs();
});

watch([compositionState, etapesState], updateHiddenInputs, { deep: true });
</script>
