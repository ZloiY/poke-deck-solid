import { createVirtualizer } from "@tanstack/solid-virtual";
import { createMemo, createResource, createSignal, For, onMount, Show, Suspense } from "solid-js";
import { createRouteAction, useNavigate } from "solid-start";

import { AddDeckCard } from "./Cards/Decks/AddDeckCard";
import { DeckCard } from "./Cards/Decks/DeckCard";
import CreateDeck from "./Modals/CreateDeck";
import { Spinner } from "./Spinner";
import { trpc } from "~/trpc/api";
import { pushNewNotification } from "~/utils/notificationStore";

export const UserDecks = () => {
  let parent: HTMLDivElement;
  const navigate = useNavigate();
  const [showModal, toggleModal] = createSignal(false);  
  const [userDecks, { refetch }] = createResource(async () => {
    if (typeof window !== 'undefined') {
      return await trpc(document.cookie).deck.getUserDecks.query({ limit: 20 })
        .then((response) => response.decks);
    } else {
      return [];
    }
  }, { initialValue: [] });
  const [removingDeck, removeDeck] = createRouteAction(async (deckId: string) => {
    if (typeof window !== 'undefined') {
      const message = await trpc(document.cookie).deck.removeUserDeck.mutate(deckId);
      pushNewNotification(message);
      if (message.state == "Success") {
        refetch();
      }
    }
  })

  onMount(() => {
    refetch();
  });

  const virtualColumn = createMemo(() => createVirtualizer({
    horizontal: true,
    count: userDecks().length,
    getScrollElement: () => parent,
    estimateSize: () => 320,
  }));

  const addPokemons = (deckId: string) => {
    navigate(`/home/0?deckId=${deckId}`);
  };

  return (
    <>
      <Suspense>
        <CreateDeck title="Create Deck" showModal={showModal()} onClose={() => toggleModal(false)}/>
      </Suspense>
      <div class="border-2 rounded-xl border-purple-900 bg-purple-800/60 p-2 pb-0 relative w-full">
        <Show when={!removingDeck.pending || userDecks.loading} fallback={
          <div class="backdrop-blur-md flex justify-center items-center z-50 h-[520px]">
            <Spinner className="w-60 h-60 text-orange-500" />
          </div>
        }>
        <div class="flex justify-between items-center">
            <span class="font-coiny text-3xl">Your Decks:</span>
            <span class="font-coiny text-3xl font-normal">
                {userDecks()?.length}/{20}
            </span>
        </div>
        <div
            id="scroll-div"
            ref={parent}
            class={`w-full h-[520px] flex gap-5 overflow-x-scroll overflow-y-hidden pb-4
              scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent`}
        >
          <Show when={userDecks()?.length != 20}>
             <AddDeckCard onClick={() => toggleModal(true)} />
          </Show>
            <div
                class="h-full relative text-center text-3xl"
                style={{ width: `${virtualColumn().getTotalSize()}px` }}
            >
            <Suspense>
              <For each={virtualColumn().getVirtualItems()} fallback={<Spinner/>}>
                {(virtualItem) => (
                  <div
                      class="h-full"
                      style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: `${virtualItem.size}px`,
                          transform: `translateX(${virtualItem.start}px)`,
                      }}
                  >
                      <DeckCard
                        deck={userDecks()?.[virtualItem.index]!}
                        addCard={addPokemons}
                        removeDeck={removeDeck} />
                  </div>
                )}
              </For>
            </Suspense>
            </div>
        </div>
        </Show>
      </div>
      </>
  );
};
