import { createSignal, For, lazy, Show, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import { createRouteAction, createRouteData, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { useUser } from "~/actions/useUser";
import { trpc } from "~/trpc/api";
import { twMerge } from "tailwind-merge";
import { cardGridStyles } from "~/components/CardsGrid";
import { Spinner } from "~/components/Spinner";
import { AddDeckCard } from "~/components/Cards/Decks/AddDeckCard";
import { DeckCard } from "~/components/Cards/Decks/DeckCard";
import { pushNewNotification } from "~/utils/notificationStore";

const CreateDeck = lazy(() => import("~/components/Modals/CreateDeck"));

export function routeData() {
  const user = createServerData$(async (_, { request }) => await useUser(request))
  const decks = createRouteData(async (_, { request }) => {
    if (isServer) {
      const cookie = request ? request.headers.get("Cookie") : document?.cookie;
      return await trpc(cookie ?? "").deck.getUserDecks.query({ limit: 20 })
        .then((response) => response.decks);
    } else {
      return await trpc(document.cookie).deck.getUserDecks.query({ limit: 20 })
        .then((response) => response.decks);
    }
  }, { key: () => ["decks"] })
  return { user, decks }
};

export default function UserDecks() {
  const [showModal, toggleModal] = createSignal(false);
  const { user, decks } = useRouteData<typeof routeData>();

  const [removingDeck, removeDeck] = createRouteAction(async (deckId: string) => {
    const message = await trpc().deck.removeUserDeck.mutate(deckId, { context: { session: user() }})
    pushNewNotification(message);
  }, { invalidate: ["decks"] });

  const addCards = (deckId: string) => {
    location.assign(`/home?deckId=${deckId}`);
  };

  return (
    <>
      <Suspense>
        <CreateDeck showModal={showModal()} title="Create Deck" onClose={() => toggleModal(false)}/>
      </Suspense>
      <Show when={decks.loading || removingDeck.pending}>
        <div class="absolute inset-0 z-50 flex backdrop-blur-md justify-center items-center">
          <Spinner className="h-96 w-96 text-orange-500"/>
        </div>
      </Show>
      <div class={twMerge("mt-5", cardGridStyles)}>
        <AddDeckCard onClick={() => toggleModal(true)}/>
        <For each={decks()}>
          {(deck) => (
            <DeckCard
              addCard={addCards}
              removeDeck={removeDeck}
              deck={deck}
            />
          )}
        </For>
      </div>
    </>
  );
};
