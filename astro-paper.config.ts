import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://fidankarimli.github.io/",
    title: "Fidan Karimli",
    description: "Notes on machine learning, with math.",
    author: "Fidan Karimli",
    profile: "https://github.com/FidanKarimli",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "Asia/Baku",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    // TODO: to re-enable, set enabled: true and add
    // url: "https://github.com/FidanKarimli/<your-repo>/edit/main/"
    editPost: { enabled: false },
    search: "pagefind",
  },
  socials: [
    { name: "github",   url: "https://github.com/FidanKarimli" },
    { name: "linkedin", url: "https://www.linkedin.com/in/fidan--karimli/" },
    { name: "mail",     url: "mailto:fidankarimli152004@gmail.com" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});