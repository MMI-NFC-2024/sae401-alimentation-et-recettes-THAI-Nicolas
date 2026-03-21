<template>
  <div :class="wrapperClass || 'relative'">
    <label :for="id" class="sr-only">{{ label }}</label>
    <input
      :id="id"
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      :class="variantStyles[variant].input"
      @input="onInput"
    />
    <span :class="variantStyles[variant].iconWrapper" aria-hidden="true">
      <img :src="searchIcon.src" alt="" :class="variantStyles[variant].icon" />
    </span>
  </div>
</template>

<script setup lang="ts">
import searchIcon from "../../assets/icones/search-gray.webp";

type Variant = "article" | "recette";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    id: string;
    label: string;
    placeholder: string;
    variant?: Variant;
    wrapperClass?: string;
  }>(),
  {
    variant: "article",
    wrapperClass: "",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const variantStyles = {
  article: {
    input:
      "w-full rounded-4xl border-2 border-primary bg-secondary py-3 px-16 lg:py-4 shadow-[2px_3px_0_0_rgba(0,0,0,0.90)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
    iconWrapper:
      "pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-primary",
    icon: "h-4 w-4 object-contain lg:h-5 lg:w-5",
  },
  recette: {
    input:
      "h-11 w-full rounded-lg border-2 border-primary bg-secondary px-3 text-sm shadow-[0_3px_0_0_var(--color-primary)] outline-none",
    iconWrapper:
      "pointer-events-none inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary shadow-[0_3px_0_0_color-mix(in_srgb,var(--color-primary)_75%,black_25%)] absolute right-1.5 top-1/2 -translate-y-1/2",
    icon: "h-3.5 w-3.5 invert",
  },
} as const;

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};
</script>
