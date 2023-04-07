import { RouteDataArgs, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";

import { useUser } from "~/actions/useUser";
import { appRouter } from "~/trpc/router";
import { prisma } from "~/db";
import { PokemonClient } from "pokenode-ts";
import { twMerge } from "tailwind-merge";
import { For, Show } from "solid-js";
import { Spinner } from "~/components/Spinner";
import { cardGridStyles } from "~/components/CardsGrid";
import { DetailsCard } from "~/components/Cards/DetailsCard";

const pokemonApi = new PokemonClient();

export function routeData({ params }: RouteDataArgs) {
  const pokemons = createServerData$(async (key, { request }) => {
    const session: Session = await useUser(request);
    const caller = appRouter.createCaller({ session, prisma, pokemonApi })
    return await caller.pokemon.getPokemonDetailedList(key[0])
  }, { key: () => [ params.deckId ] });
  const deckInfo = createServerData$(async (key, { request }) => {
    const session: Session = await useUser(request);
    const caller = appRouter.createCaller({ session, prisma, pokemonApi })
    return await caller.deck.getDeckById(key[0]);
  }, { key: () => [ params.deckId ] })
  return { pokemons, deckInfo };
};

export default function OtherUserDeck() {
  const { pokemons, deckInfo } = useRouteData<typeof routeData>();
  return (
    <div
      class={twMerge(
        "mt-5 flex flex-col gap-5",
        (pokemons.loading) && "items-center justify-center",
      )}
    >
      <div class="flex justify-between gap-5 text-3xl font-coiny text-white px-5">
        <span>Owner: {deckInfo()?.username ?? "..."}</span>
        <span>Deck name: {deckInfo()?.name ?? "..."}</span>
        <span>
          Deck size: {deckInfo()?.deckLength ?? "..."}/
          {import.meta.env.PUBLIC_DECK_MAX_SIZE}
        </span>
      </div>
      <Show when={!pokemons.loading} fallback={<Spinner className="w-96 h-96"/>}>
        <div class={twMerge("mt-5", cardGridStyles)}>
          <For each={pokemons()}>
            {(pokemon) => (
              <DetailsCard pokemon={pokemon} />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
