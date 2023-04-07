import { RouteDataArgs, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";

import { useUser } from "~/actions/useUser";
import { appRouter } from "~/trpc/router";
import { prisma } from "~/db";
import { PokemonClient } from "pokenode-ts";

const pokemonApi = new PokemonClient();

export function routeData({ params }: RouteDataArgs) {
  const pokemons = createServerData$(async (key, { request }) => {
    const session: Session = await useUser(request);
    const caller = appRouter.createCaller({ session, prisma, pokemonApi })
    return await caller.pokemon.getPokemonsByDeckId(key[0])
  }, { key: () => [ params.deckId ] });
  const deckInfo = createServerData$(async (key, { request }) => {
    const session: Session = await useUser(request);
    const caller = appRouter.createCaller({ session, prisma, pokemonApi })
    return await caller.deck.getUserDeckById({ deckId: key[0] });
  }, { key: () => [ params.deckId ] })
  return { pokemons, deckInfo };
};

export default function OtherUserDeck() {
  const { pokemons, deckInfo } = useRouteData<typeof routeData>();
};
