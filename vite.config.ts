import solid from "solid-start/vite";
import solidSvg from "vite-plugin-solid-svg";
import vercel from "solid-start-vercel";
import alias from "@rollup/plugin-alias";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    solid({ adapter: vercel({edge: false}) }),
    solidSvg({
      defaultAsComponent: true,
    }),
    alias({
      entries: [
        { find: '@icons', replacement: path.resolve("./src/icons") },
      ]
    })
  ],
  ssr: { external: ["@prisma/client", "@trpc/client", "@trpc/server"] },
});
