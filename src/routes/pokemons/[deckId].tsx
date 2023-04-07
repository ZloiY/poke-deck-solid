import { PokemonClient } from "pokenode-ts";
import { createEffect, For, onMount, Show } from "solid-js";
import { RouteDataArgs, useParams, useRouteData } from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import { twMerge } from "tailwind-merge";
import { useUser } from "~/actions/useUser";
import { FlipCard } from "~/components/Cards/FlipCard";
import { cardGridStyles } from "~/components/CardsGrid";
import { Spinner } from "~/components/Spinner";

import { prisma } from "~/db";
import { appRouter } from "~/trpc/router";
import { setFlipState, flipState } from "~/utils/flipStore";
import { pushNewNotification } from "~/utils/notificationStore";

export function routeData({ params }: RouteDataArgs) {
  const pokemons = createServerData$(async (key, { request }) => {
    const pokemonApi = new PokemonClient();
    const session = await useUser(request);
    const caller = appRouter.createCaller({ session, prisma, pokemonApi  })
    return await caller.pokemon.getPokemonDetailedList(key[1])
  },
  { key: () => ["deck", params.deckId] })
  const user = createServerData$(async (_, { request }) => {
    return await useUser(request);
  });
  return { pokemons, user };
}

export default function UserDeck() {
  const { pokemons, user } = useRouteData<typeof routeData>();
  const params = useParams();
  const [removingCard, removeCard] = createServerAction$(
    async ({ deckId, pokemonName }: { deckId: string, pokemonName: string }, { request }) => {
    const pokemonApi = new PokemonClient();
    const session = await useUser(request);
    const caller = appRouter.createCaller({ session, prisma, pokemonApi  })
    return await caller.pokemon
      .removePokemonFromDeck({ deckId, pokemonName })
  }, { invalidate: ["deck"] });

  createEffect(() => {
    const message = removingCard.result;
    if (message) {
      pushNewNotification(message)
    }
  })
  
  onMount(() => {
    setFlipState("Details");
  });
  
  return (
    <>
      <Show when={removingCard.pending}>
        <div class="absolute z-50 inset-0 backdrop-blur-md flex items-center justify-center">
          <Spinner className="text-orange-500 h-96 w-96"/>
        </div>
      </Show>
      <div class={twMerge("mt-5", cardGridStyles)}>
        <For each={pokemons()}>
          {(pokemon) => (
            <FlipCard
              user={user()}
              pokemon={pokemon}
              keepFlipped={flipState()}
              removeFromDeck={(pokemon) =>
                removeCard({
                  pokemonName: pokemon.name,
                  deckId: params.deckId })
              }
            />
          )}
        </For>
      </div>
    </>
  )
};
