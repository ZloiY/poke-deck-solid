import { createTRPCRouter } from "./trpc";
import { authRouter } from "./routes/auth";
import { deckRouter } from "./routes/deck";
import { pokemonRouter } from "./routes/pokemon";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  pokemon: pokemonRouter,
  deck: deckRouter,
});

export type AppRouter = typeof appRouter;

