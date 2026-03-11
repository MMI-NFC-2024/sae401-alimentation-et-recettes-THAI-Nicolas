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
}
