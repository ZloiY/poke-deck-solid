import { createEffect, createResource, createSignal, For, onMount, Show, splitProps, Suspense } from "solid-js";
import { Deck } from "@prisma/client";

import Remove from "@icons/close-circle.svg";

import { trpc } from "~/trpc/api";
import { Select } from "../Select";
import { Spinner } from "../Spinner";
import { ContainerModal } from "./ContainerModal";
import { pokemons, resetPokemons, unSelectPokemon } from "~/utils/selectedPokemonsStore";
import { Button } from "../Button";
import { PreviewCard } from "../Cards/PreviewCard";
import { createRouteAction, redirect } from "solid-start";
import { pushNewNotification } from "~/utils/notificationStore";
import { DeckCard } from "../Cards/Decks/DeckCard";
import { BlankDeckCard } from "../Cards/Decks/BlankDeckCard";

type AddCardsProps = Omit<Parameters<typeof ContainerModal>[0], 'children'>
 & { deckId: string };

export default function AddCards(props: AddCardsProps) {
  const [local, containerProps] = splitProps(props, ["deckId"]);
  const [decks, { refetch }] = createResource(async () => {
    if (typeof window !== 'undefined') {
      return await trpc(document.cookie).deck.getUserDecks.query({ limit: 20 })
         .then((response) => response.decks);
    } else {
      return [];
    }
  });
  const [selectedDeck, setSelectedDeck] = createSignal<Deck>();

  const [addingPokemons, addPokemons] = createRouteAction(async () => {
    const message = await trpc(document.cookie).deck.addCardsToDecks.mutate({
        cards: pokemons().map((pokemon) => ({
          name: pokemon.name,
          imageUrl: pokemon.sprites.other?.["official-artwork"].front_default
          || pokemon.sprites.front_default || "",
        })),
        decksIds: [selectedDeck()?.id!],
    });
    pushNewNotification(message);
    props.onClose();
    if (message.state == "Success") {
      resetPokemons();
      return redirect(`/pokemons/${selectedDeck()?.id!}`)
    } else {
      return null;
    }
  });

  onMount(() => {
    refetch();
  });

  createEffect(() => {
    if (decks.state == "ready") {
      const currentDeck = decks().find((deck) => deck.id == local.deckId);
      if (currentDeck) {
        setSelectedDeck(currentDeck);
      }
    }
  });

  return (
    <ContainerModal {...containerProps}>
      <div class="flex flex-col gap-5 min-w-[450px] max-w-[720px] px-2 pb-4">
        <div class="flex gap-10 w-full px-1">
          <Show when={decks.state == "ready"} fallback={<Spinner/>}>
            <>
              <Suspense fallback={<BlankDeckCard 
                    className="w-32 h-52 border-yellow-500 border-2"
                />}>
                <Show when={selectedDeck()}> 
                  <DeckCard
                    className="w-32 h-52 border-yellow-500 border-2"
                    notInteractive={true}
                    deck={selectedDeck()!}
                  />
                </Show>
              </Suspense>
              <Select
                selectedItem={selectedDeck()}
                className="w-64"
                placeholder="Select deck..."
                label="Select deck where you want to add Pokemons"
                onSelect={setSelectedDeck}
                items={decks() ?? []}
              />
            </>
          </Show>
        </div>
        <div class="flex flex-wrap justify-center gap-3">
          <For each={pokemons()}>
            {(pokemon, index) => (
              <div class="relative">
                <PreviewCard
                  className="w-32 h-52 text-xl border-yellow-500 border-2"
                  pokemon={pokemon}
                  notInteractive={true}
                />
                <Remove
                  class="absolute top-1 right-1 w-10 h-10 text-red-600 hover:text-red-400 active:text-red-500 active:scale-90 cursor-pointer"
                  onClick={() => unSelectPokemon(pokemon)}
                />
              </div>
            )}
           </For>
          </div>
          <Button
            className="bg-green-500 w-full h-12"
            isLoading={addingPokemons.pending}
            disabled={!selectedDeck()}
            onClick={addPokemons}
          >
            Add Cards!
          </Button>
      </div>
    </ContainerModal>
  );
};
