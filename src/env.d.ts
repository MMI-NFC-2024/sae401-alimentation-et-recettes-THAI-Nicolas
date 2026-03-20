import type { TypedPocketBase } from "./pocketbase-types";

declare global {
  namespace App {
    interface Locals {
      pb: TypedPocketBase;
    }
  }
}

interface ImportMetaEnv {
  readonly POCKETBASE_URL: string;
  readonly PUBLIC_POCKETBASE_URL: string;
  readonly EMAILJS_SERVICE_ID: string;
  readonly EMAILJS_TEMPLATE_ID: string;
  readonly EMAILJS_PUBLIC_ID: string;
}
