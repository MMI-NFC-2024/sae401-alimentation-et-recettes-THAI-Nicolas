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
            class="btn-outline px-3! py-2! cursor-pointer"
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
            class="btn-outline px-3! py-2! cursor-pointer"
            aria-label="Augmenter les portions"
            @click="augmenterPortions"
          >
            +
          </button>
        </div>
      </label>

      <label class="flex flex-col gap-2">
        <span class="label">Calories cibles</span>
        <input
          v-model.number="kcalCibleTotales"
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
          kcal totales
        </dt>
        <dd class="font-bold text-primary text-lg xl:text-xl text">
          {{ kcalTotalesAffichees }}
        </dd>
        <p class="text-[10px] text-primary/70">
          {{ kcalAfficheesParPortion }} / portion
        </p>
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
import { roundForDisplay, roundTo, roundToStep } from "../../lib/utils/number";

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
const kcalBaseParPortionSecurisees = Math.max(1, props.kcalBaseParPortion || 1);
const kcalCibleTotales = ref(
  Math.max(1, roundTo(kcalBaseParPortionSecurisees * portionsCible.value)),
);
// Evite les boucles entre les deux watchers (portions <-> calories).
const syncDepuisCalories = ref(false);

const augmenterPortions = () => {
  portionsCible.value += 1;
};

const diminuerPortions = () => {
  portionsCible.value = Math.max(1, portionsCible.value - 1);
};

const normaliserEntierPositif = (valeur: number, fallback: number) => {
  if (!Number.isFinite(valeur)) return fallback;
  return Math.max(1, Math.round(valeur));
};

// Quand les portions changent, on recalcule les kcal totales sauf si la source est deja le watcher kcal.
watch(portionsCible, (valeur) => {
  const normalisee = normaliserEntierPositif(
    valeur,
    Math.max(1, props.portionsBase || 1),
  );
  if (normalisee !== valeur) {
    portionsCible.value = normalisee;
    return;
  }

  if (syncDepuisCalories.value) {
    syncDepuisCalories.value = false;
    return;
  }

  kcalCibleTotales.value = roundTo(kcalBaseParPortionSecurisees * normalisee);
});

// Quand les kcal changent, on recalcule des portions entieres puis on declenche la synchro inverse.
watch(kcalCibleTotales, (valeur) => {
  const normalisee = normaliserEntierPositif(
    valeur,
    roundTo(kcalBaseParPortionSecurisees * portionsCible.value),
  );
  if (normalisee !== valeur) {
    kcalCibleTotales.value = normalisee;
    return;
  }

  const portionsRecalculees = normaliserEntierPositif(
    normalisee / kcalBaseParPortionSecurisees,
    portionsCible.value,
  );

  if (portionsRecalculees !== portionsCible.value) {
    syncDepuisCalories.value = true;
    portionsCible.value = portionsRecalculees;
  }
});

const facteurPortions = computed(() => {
  const portionsBaseSecurisees = Math.max(1, props.portionsBase || 1);
  return Math.max(0.1, portionsCible.value / portionsBaseSecurisees);
});

const facteurCalories = computed(() => {
  if (!props.kcalBaseParPortion || props.kcalBaseParPortion <= 0) {
    return 1;
  }
  const kcalCibleParPortion = kcalCibleTotales.value / portionsCible.value;
  return Math.max(0.1, kcalCibleParPortion / props.kcalBaseParPortion);
});

const facteurGlobal = computed(
  () => facteurPortions.value * facteurCalories.value,
);

// Ajuste toutes les quantites ingredients avec un pas de 0.5 pour garder une valeur cuisine lisible.
const ingredientsAjustes = computed(() => {
  return props.ingredients.map((ingredient) => ({
    ...ingredient,
    quantite: roundToStep(ingredient.quantite * facteurGlobal.value, 0.5),
  }));
});

const formaterQuantite = (valeur: number) => {
  const arrondi = roundTo(valeur, 1);
  if (Number.isInteger(arrondi)) {
    return String(arrondi);
  }
  return String(arrondi)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*?)0+$/, "$1");
};

// Synchronise les valeurs affichees dans les autres blocs Astro (ingredients + panneau nutrition).
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

  const nutritionKcalElement = document.querySelector<HTMLElement>(
    "[data-nutrition-kcal]",
  );
  if (nutritionKcalElement) {
    nutritionKcalElement.textContent = `${kcalAfficheesParPortion.value} kcal`;
  }

  const nutritionPortionsElement = document.querySelector<HTMLElement>(
    "[data-nutrition-portions]",
  );
  if (nutritionPortionsElement) {
    nutritionPortionsElement.textContent = `${Math.round(portionsCible.value)} portions`;
  }
};

onMounted(() => {
  // Surveille les ingredients ajustes et pousse immediatement les valeurs dans le DOM cible.
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

const kcalTotalesAjustees = computed(
  () => kcalAjusteesParPortion.value * portionsCible.value,
);

const proteinesAjustees = computed(
  () => props.proteinesBase * facteurGlobal.value,
);
const glucidesAjustes = computed(
  () => props.glucidesBase * facteurGlobal.value,
);
const lipidesAjustes = computed(() => props.lipidesBase * facteurGlobal.value);

const kcalAfficheesParPortion = computed(() =>
  roundTo(kcalAjusteesParPortion.value),
);
const kcalTotalesAffichees = computed(() => roundTo(kcalTotalesAjustees.value));
const proteinesAffichees = computed(() =>
  roundForDisplay(proteinesAjustees.value, 1),
);
const glucidesAffiches = computed(() =>
  roundForDisplay(glucidesAjustes.value, 1),
);
const lipidesAffiches = computed(() =>
  roundForDisplay(lipidesAjustes.value, 1),
);
</script>
