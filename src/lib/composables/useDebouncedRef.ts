import { onUnmounted, ref, watch, type Ref } from "vue";

// Fonction pour la recherche qui permet d'attendre 300ms avant de mettre à jour la valeur d'une ref (évite les mises à jour trop fréquentes pour la saisie)
export function useDebouncedRef<T>(source: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>;
  let timer: ReturnType<typeof setTimeout> | null = null;

  watch(source, (value) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      debounced.value = value;
    }, delay);
  });

  onUnmounted(() => {
    if (timer) clearTimeout(timer);
  });

  return debounced;
}
