import solid from "solid-start/vite";
import solidSvg from "vite-plugin-solid-svg";
import alias from "@rollup/plugin-alias";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    solid(),
    solidSvg({
      defaultAsComponent: true,
    }),
    alias({
      entries: [
        { find: '@icons', replacement: path.resolve("./src/icons") },
      ]
    })
  ],
  ssr: { external: ["@prisma/client"] },
});
