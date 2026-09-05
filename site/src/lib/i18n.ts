export const UI_LOCALES = ["en", "es", "fr"] as const;
export const DEFAULT_UI_LOCALE = "en";
export const NON_DEFAULT_UI_LOCALES = UI_LOCALES.filter((locale) => locale !== DEFAULT_UI_LOCALE);

export type UILocale = (typeof UI_LOCALES)[number];

type LocaleMessages = {
  languageName: string;
  header: {
    tagline: string;
    menu: string;
    theme: string;
    system: string;
    light: string;
    dark: string;
    language: string;
    nav: {
      home: string;
      browse: string;
      collections: string;
      authors: string;
      search: string;
      favorites: string;
    };
  };
  footer: {
    builtBy: string;
    sourceOn: string;
  };
};

export const UI_MESSAGES: Record<UILocale, LocaleMessages> = {
  en: {
    languageName: "English",
    header: {
      tagline: "Public-domain poetry, pleasantly readable.",
      menu: "Menu",
      theme: "Theme",
      system: "System",
      light: "Light",
      dark: "Dark",
      language: "Language",
      nav: {
        home: "Home",
        browse: "Explore poems",
        collections: "Collections",
        authors: "Authors",
        search: "Search",
        favorites: "Favorites",
      },
    },
    footer: {
      builtBy: "Built by",
      sourceOn: "Source on",
    },
  },
  es: {
    languageName: "Espanol",
    header: {
      tagline: "Poesia de dominio publico, hecha para leerse bien.",
      menu: "Menu",
      theme: "Tema",
      system: "Sistema",
      light: "Claro",
      dark: "Oscuro",
      language: "Idioma",
      nav: {
        home: "Inicio",
        browse: "Explorar poemas",
        collections: "Colecciones",
        authors: "Autores",
        search: "Buscar",
        favorites: "Favoritos",
      },
    },
    footer: {
      builtBy: "Creado por",
      sourceOn: "Codigo en",
    },
  },
  fr: {
    languageName: "Francais",
    header: {
      tagline: "Poesie du domaine public, faite pour etre lue.",
      menu: "Menu",
      theme: "Theme",
      system: "Systeme",
      light: "Clair",
      dark: "Sombre",
      language: "Langue",
      nav: {
        home: "Accueil",
        browse: "Explorer les poemes",
        collections: "Collections",
        authors: "Auteurs",
        search: "Recherche",
        favorites: "Favoris",
      },
    },
    footer: {
      builtBy: "Construit par",
      sourceOn: "Code source sur",
    },
  },
};

export function isUILocale(value: string | undefined): value is UILocale {
  return Boolean(value && UI_LOCALES.includes(value as UILocale));
}

export function normalizeUILocale(value: string | undefined): UILocale {
  return isUILocale(value) ? value : DEFAULT_UI_LOCALE;
}

export function localizedPath(base: string, locale: UILocale, pathname = "/"): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const [pathWithoutHash, hash = ""] = pathname.split("#");
  const [pathWithoutQuery, query = ""] = pathWithoutHash.split("?");
  const normalizedPath = pathWithoutQuery === "/" ? "" : pathWithoutQuery.replace(/^\/+|\/+$/g, "");
  const localized = [locale === DEFAULT_UI_LOCALE ? "" : locale, normalizedPath]
    .filter(Boolean)
    .join("/");
  const suffix = `${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
  return `${normalizedBase}${localized}${localized ? "/" : ""}${suffix}`;
}

export function authorPath(base: string, slug: string, locale: UILocale = DEFAULT_UI_LOCALE): string {
  return localizedPath(base, locale, `/author/${encodeURIComponent(slug)}/`);
}

export function poemPath(base: string, id: string, locale: UILocale = DEFAULT_UI_LOCALE): string {
  const encodedId = id.split("/").map(encodeURIComponent).join("/");
  return localizedPath(base, locale, `/poem/${encodedId}/`);
}

export function browsePath(base: string, locale: UILocale = DEFAULT_UI_LOCALE): string {
  return localizedPath(base, locale, "/browse/");
}

export function collectionsPath(base: string, locale: UILocale = DEFAULT_UI_LOCALE): string {
  return localizedPath(base, locale, "/collections/");
}

export function collectionPath(base: string, slug: string, locale: UILocale = DEFAULT_UI_LOCALE): string {
  return localizedPath(base, locale, `/collections/${encodeURIComponent(slug)}/`);
}

export function authorsPath(base: string, locale: UILocale = DEFAULT_UI_LOCALE): string {
  return localizedPath(base, locale, "/authors/");
}

export function searchPath(base: string, locale: UILocale = DEFAULT_UI_LOCALE): string {
  return localizedPath(base, locale, "/search/");
}

export function favoritesPath(base: string, locale: UILocale = DEFAULT_UI_LOCALE): string {
  return localizedPath(base, locale, "/favorites/");
}

export function homePath(base: string, locale: UILocale = DEFAULT_UI_LOCALE): string {
  return localizedPath(base, locale, "/");
}
