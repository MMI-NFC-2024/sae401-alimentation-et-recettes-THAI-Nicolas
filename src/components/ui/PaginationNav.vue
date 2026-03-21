<template>
  <nav :class="containerClassName" :aria-label="label">
    <button
      type="button"
      :class="buttonBaseClassName"
      :disabled="currentPage <= 1"
      @click="emitPage(currentPage - 1)"
    >
      &lt;
    </button>

    <button
      v-for="page in visiblePages"
      :key="page"
      type="button"
      :class="[
        buttonBaseClassName,
        page === currentPage ? activeClassName : inactiveClassName,
      ]"
      :aria-current="page === currentPage ? 'page' : undefined"
      @click="emitPage(page)"
    >
      {{ page }}
    </button>

    <button
      type="button"
      :class="buttonBaseClassName"
      :disabled="currentPage >= totalPages"
      @click="emitPage(currentPage + 1)"
    >
      &gt;
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";

type Size = "sm" | "lg";

const props = withDefaults(
  defineProps<{
    currentPage: number;
    totalPages: number;
    visiblePages: number[];
    label: string;
    size?: Size;
    className?: string;
  }>(),
  {
    size: "sm",
    className: "",
  },
);

const emit = defineEmits<{
  change: [page: number];
}>();

const isLarge = computed(() => props.size === "lg");

const containerClassName = computed(() => {
  if (props.className) return props.className;
  return "flex items-center justify-center gap-2";
});

const buttonBaseClassName = computed(() => {
  return isLarge.value
    ? "inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary font-barlow text-xl leading-none shadow-[0_4px_0_0_color-mix(in_srgb,var(--color-primary)_75%,black_25%)] transition-all duration-200 hover:translate-y-px hover:shadow-[0_3px_0_0_color-mix(in_srgb,var(--color-primary)_75%,black_25%)] disabled:cursor-not-allowed disabled:opacity-60"
    : "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary font-barlow text-sm disabled:opacity-50";
});

const activeClassName = computed(() => "bg-primary text-secondary");
const inactiveClassName = computed(() => "bg-secondary text-primary");

const emitPage = (page: number) => {
  emit("change", page);
};
</script>
