import { Deck } from "@prisma/client";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { createEffect, createMemo, createResource, createSignal, For, onMount, Show, Suspense, untrack } from "solid-js";
import { useNavigate } from "solid-start"
import { trpc } from "~/trpc/api";
import { DeckCard } from "./Cards/Decks/DeckCard"
import { Spinner } from "./Spinner";

export default function OtherUsersDecks() {
  const [parent, setParent] = createSignal<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [totalDecks, setTotalDecks] = createSignal<Deck[]>([]);
  const [source, setSource] = createSignal("");
  const [decks, { refetch }] = createResource(source, async (sourceSignal) => {
    if (typeof window !== "undefined") {
      return await trpc(document.cookie).deck
        .getOthersUsersDecks.query({ limit: 7, cursor: sourceSignal })
    }
  }, { deferStream: true })

  onMount(() => {
    refetch();
  });

  createEffect(() => {
    if (decks?.()?.decks.length > 0 && !decks.loading) {
      setTotalDecks((prevDecks) => prevDecks.concat(decks()?.decks));
    }
  });

  const virtualColumn = createMemo(() =>
    createVirtualizer({
      count: decks()?.nextCursor ? totalDecks().length + 1 : totalDecks().length,
      horizontal: true,
      getScrollElement: parent,
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
      setSource(decks()?.nextCursor);
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
      <div
        use:setParent
        class="w-full h-[520px] flex gap-5 overflow-x-scroll pb-4 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent"
      >
        <Show when={totalDecks().length > 0} fallback={
          <div class="mt-[25%] w-full text-center font-coiny text-2xl">
            Sorry there are no other users decks
          </div>
        }>
        <Suspense fallback={<Spinner className="mt-20"/>}>
          <div
            class="h-full relative text-center text-3xl"
            style={{ width: `${virtualColumn().getTotalSize()}px` }}
          >
            <For each={virtualColumn().getVirtualItems()} fallback={<Spinner class="h-52 w-52"/>}>
              {(virtualItem) => virtualItem.index < totalDecks().length && (
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
          </Suspense>
        </Show>
      </div>
    </div>
  )
}
