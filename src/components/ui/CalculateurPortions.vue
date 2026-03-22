<template>
  <section
    class="rounded-3xl border-2 border-primary/35 bg-secondary p-5 shadow-[0_4px_0_0_color-mix(in_srgb,var(--color-primary)_25%,black_75%)]"
  >
    <header class="mb-4">
      <p class="text-xs uppercase tracking-[0.16em] text-primary/70">
        Calculateur
      </p>
      <h3 class="font-barlow text-2xl text-primary">Portions et calories</h3>
    </header>

    <div class="grid gap-3 sm:grid-cols-2">
      <label class="flex flex-col gap-2">
        <span class="label">Portions souhaitees</span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn-outline px-3! py-2!"
            aria-label="Diminuer les portions"
            @click="diminuerPortions"
          >
            -
          </button>
          <input
            v-model.number="portionsCible"
            class="input text-center"
            type="number"
            min="1"
            step="1"
            inputmode="numeric"
          />
          <button
            type="button"
            class="btn-outline px-3! py-2!"
            aria-label="Augmenter les portions"
            @click="augmenterPortions"
          >
            +
          </button>
        </div>
      </label>

      <label class="flex flex-col gap-2">
        <span class="label">Calories cible / portion</span>
        <input
          v-model.number="kcalCibleParPortion"
          class="input"
          type="number"
          min="1"
          step="1"
          inputmode="numeric"
        />
      </label>
    </div>

    <p class="mt-3 text-sm text-primary/80" aria-live="polite">
      Facteur applique: <strong>{{ facteurGlobal.toFixed(2) }}x</strong>
    </p>

    <dl class="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
      <div class="rounded-xl border border-primary/30 bg-primary/5 px-2 py-2">
        <dt class="text-[10px] uppercase tracking-wide text-primary/70">
          kcal/portion
        </dt>
        <dd class="font-bold text-primary text-lg xl:text-xl text">
          {{ kcalAfficheesParPortion }}
        </dd>
      </div>
      <div class="rounded-xl border border-primary/30 bg-primary/5 px-2 py-2">
        <dt class="text-[10px] uppercase tracking-wide text-primary/70">
          Proteines
        </dt>
        <dd class="font-bold text-primary text-lg xl:text-xl">
          {{ proteinesAffichees }} g
        </dd>
      </div>
      <div class="rounded-xl border border-primary/30 bg-primary/5 px-2 py-2">
        <dt class="text-[10px] uppercase tracking-wide text-primary/70">
          Glucides
        </dt>
        <dd class="font-bold text-primary text-lg xl:text-xl">
          {{ glucidesAffiches }} g
        </dd>
      </div>
      <div class="rounded-xl border border-primary/30 bg-primary/5 px-2 py-2">
        <dt class="text-[10px] uppercase tracking-wide text-primary/70">
          Lipides
        </dt>
        <dd class="font-bold text-primary text-lg xl:text-xl">
          {{ lipidesAffiches }} g
        </dd>
      </div>
    </dl>

    <p class="mt-4 text-sm text-primary/80">
      Les quantites de la liste ingredients a gauche sont mises a jour
      automatiquement.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

interface IngredientCalculateur {
  id: string;
  nom: string;
  quantite: number;
  unite: string;
}

const props = defineProps<{
  portionsBase: number;
  kcalBaseParPortion: number;
  proteinesBase: number;
  glucidesBase: number;
  lipidesBase: number;
  ingredients: IngredientCalculateur[];
}>();

const portionsCible = ref(Math.max(1, props.portionsBase || 1));
const kcalCibleParPortion = ref(Math.max(1, props.kcalBaseParPortion || 1));

const augmenterPortions = () => {
  portionsCible.value += 1;
};

const diminuerPortions = () => {
  portionsCible.value = Math.max(1, portionsCible.value - 1);
};

const facteurPortions = computed(() => {
  const portionsBaseSecurisees = Math.max(1, props.portionsBase || 1);
  return Math.max(0.1, portionsCible.value / portionsBaseSecurisees);
});

const facteurCalories = computed(() => {
  if (!props.kcalBaseParPortion || props.kcalBaseParPortion <= 0) {
    return 1;
  }
  return Math.max(0.1, kcalCibleParPortion.value / props.kcalBaseParPortion);
});

const facteurGlobal = computed(
  () => facteurPortions.value * facteurCalories.value,
);

const ingredientsAjustes = computed(() => {
  return props.ingredients.map((ingredient) => ({
    ...ingredient,
    quantite: Number((ingredient.quantite * facteurGlobal.value).toFixed(2)),
  }));
});

const formaterQuantite = (valeur: number) => {
  const arrondi = Number(valeur.toFixed(2));
  if (Number.isInteger(arrondi)) {
    return String(arrondi);
  }
  return String(arrondi)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*?)0+$/, "$1");
};

const synchroniserListeIngredients = () => {
  if (typeof document === "undefined") {
    return;
  }

  for (const ingredient of ingredientsAjustes.value) {
    const element = document.querySelector<HTMLElement>(
      `[data-ingredient-qty-id="${ingredient.id}"]`,
    );

    if (!element) continue;

    element.textContent =
      `${formaterQuantite(ingredient.quantite)} ${ingredient.unite}`.trim();
  }
};

onMounted(() => {
  watch(ingredientsAjustes, synchroniserListeIngredients, {
    immediate: true,
    deep: true,
  });
});

const kcalAjusteesParPortion = computed(() => {
  if (!props.kcalBaseParPortion || props.kcalBaseParPortion <= 0) {
    return 0;
  }
  return props.kcalBaseParPortion * facteurCalories.value;
});

const proteinesAjustees = computed(
  () => props.proteinesBase * facteurGlobal.value,
);
const glucidesAjustes = computed(
  () => props.glucidesBase * facteurGlobal.value,
);
const lipidesAjustes = computed(() => props.lipidesBase * facteurGlobal.value);

const kcalAfficheesParPortion = computed(() =>
  Math.round(kcalAjusteesParPortion.value),
);
const proteinesAffichees = computed(() =>
  Number(proteinesAjustees.value.toFixed(1)),
);
const glucidesAffiches = computed(() =>
  Number(glucidesAjustes.value.toFixed(1)),
);
const lipidesAffiches = computed(() => Number(lipidesAjustes.value.toFixed(1)));
</script>
