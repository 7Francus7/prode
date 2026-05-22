import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prode Mundial 2026",
    short_name: "Prode Mundial",
    description: "Predicciones del Mundial 2026 entre amigos",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f7fb",
    theme_color: "#f6f7fb",
    icons: [
      {
        src: "/api/icon/192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/api/icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["sports", "games"],
    lang: "es",
  };
}
