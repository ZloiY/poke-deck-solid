import { Deck } from "@prisma/client";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { createEffect, createMemo, createResource, createSignal, For, onMount, Show, Suspense } from "solid-js";
import { useNavigate } from "solid-start"
import { trpc } from "~/trpc/api";
import { DeckCard } from "./Cards/Decks/DeckCard"
import { Spinner } from "./Spinner";

export default function OtherUsersDecks() {
  let parent: HTMLDivElement;
  const navigate = useNavigate();
  const [totalDecks, setTotalDecks] = createSignal<Deck[]>([]);
  const [decks, { refetch }] = createResource(async (_,info): Promise<{
    decks: Deck[], decksLength: number, nextCursor?: string
  }> => {
    if (typeof window !== "undefined") {
      const cursor = typeof info.value == 'string' ? info.value : undefined
      return await trpc(document.cookie).deck
        .getOthersUsersDecks.query({ limit: 7, cursor })
    } else {
      return { decks: [], decksLength: 0, nextCursor: undefined };
    }
  }, { initialValue: { decks: [], decksLength: 0, nextCursor: undefined } })

  onMount(() => {
    refetch();
  });

  createEffect(() => {
    setTotalDecks((prevDecks) => prevDecks.concat(decks()?.decks));
  })

  const virtualColumn = createMemo(() => createVirtualizer({
    count: totalDecks().length,
    horizontal: true,
    getScrollElement: () => parent,
    estimateSize: () => 320,
    overscan: 7,
  }));

  createEffect(() => {
    const items = virtualColumn().getVirtualItems();
    const lastItem = items[items.length - 1];
    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= totalDecks().length - 1 &&
      decks()?.nextCursor &&
      !decks.loading
    ) {
      refetch({ value: decks()?.nextCursor });
    }
  });

  const viewDeck = (deckId: string) => {
    navigate(`/decks/${deckId}`);
  };

  return (
    <div class="border-2 rounded-xl border-purple-900 bg-purple-800/60 p-2 pb-0 min-h-[570px]">
      <div class="flex justify-between items-center">
        <span class="font-coiny text-2xl">Others players decks:</span>
        <span class="font-coiny text-2xl">
          Total decks: {decks()?.decksLength ?? 0}
        </span>
      </div>
      <Suspense fallback={<Spinner class="mt-10 h-52 w-52"/>}>
        <div
          ref={parent}
          class="w-full h-[520px] flex gap-5 overflow-x-scroll pb-4 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent"
        >
          <Show when={totalDecks().length > 0} fallback={
            <div class="mt-[25%] w-full text-center font-coiny text-2xl">
              Sorry there are no other users decks
            </div>
          }>
            <div
              class="h-full relative text-center text-3xl"
              style={{ width: `${virtualColumn().getTotalSize()}px` }}
            >
              <For each={virtualColumn().getVirtualItems()} fallback={<Spinner class="h-52 w-52"/>}>
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
                      onClick={viewDeck}
                      deck={totalDecks()[virtualItem.index]!}
                    />
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </Suspense>
    </div>
  )
}
