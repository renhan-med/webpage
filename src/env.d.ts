interface ImportMetaEnv {
  /** Optional URL that accepts the contact form as a JSON POST. Without it the form composes an e-mail (mailto:). */
  readonly PUBLIC_FORM_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
