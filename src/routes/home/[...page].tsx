import { motion } from "@motionone/solid";
import { Location, useIsRouting } from "@solidjs/router";
import { createEffect, createMemo, createResource, createSignal, For, lazy,  Show, Suspense } from "solid-js";
import { createRouteData, refetchRouteData,
  RouteDataArgs,
  useLocation, useNavigate, useRouteData, useSearchParams, useServerContext } from "solid-start";
import { FlipCard } from "~/components/Cards/FlipCard";

import Check from "@icons/check.svg";

import { CardsGrid } from "~/components/CardsGrid";
import { PaginationButtons } from "~/components/PaginationButtons";
import { SearchBar } from "~/components/SearchBar";
import { Spinner } from "~/components/Spinner";
import { trpc } from "~/trpc/api";
import { flipState } from "~/utils/flipStore";
import { pokemons } from "~/utils/selectedPokemonsStore";
import { cookieSessionStorage } from "~/utils/cookieSessionStorage";
import { isServer } from "solid-js/web";
import { PokemonClient } from "pokenode-ts";

const CreateDeck = lazy(() => import("~/components/Modals/CreateDeck"));
const AddCards = lazy(() => import("~/components/Modals/AddCards"));

const FixedButton = (props: {
  onClick: () => void,
  existingPokemonsLength: number,
}) => {
  const [hovered, toggleHover] = createSignal(false);
  
  return (
    <Show when={pokemons().length > 0}>
     <div
       role="button"
       onMouseEnter={() => toggleHover(true)}
       onMouseLeave={() => toggleHover(false)}
       class={`fixed right-2 bottom-2
         flex justify-center items-center rounded-full h-16 w-16 bg-white text-purple-900 text-2xl cursor-pointer
         hover:bg-green-500 hover:text-white transition-all z-50
         shadow-xl`
       }
       onClick={props.onClick}
     > 
       <Show when={!hovered()} fallback={<Check class="opacity-0 text-white hover:opacity-100 h-full w-full m-2"/>}>
         <p class="text-lg">
           {pokemons().length + props.existingPokemonsLength}/
           {import.meta.env.PUBLIC_DECK_MAX_SIZE}
         </p>
       </Show>
      </div>
    </Show>
  )
}

type PaginationState = "Initial" | "Next" | "Prev";

const getPage = (location: Location) => {
  let page = +location.pathname.split('/')[2]
  if (Number.isNaN(page)) {
    page = 0;
  }
  return page;
}

export function routeData({ location }: RouteDataArgs) {
  const [searchParams] = useSearchParams();
  const page = createMemo(() => getPage(location));
  const serverContext = useServerContext();
  const cookie = isServer ? serverContext.request.headers.get("Cookie") : document.cookie;
  const pokemonApi = new PokemonClient(); 
  const trpcClient = trpc(cookie ?? "");
  return createRouteData(async (key) => {
    const session = await cookieSessionStorage.getSession(cookie);
    if (session.get("id")) {
     const [emptyDecks, pokemons, pokemonsInCurrentDeck] = await Promise.all([
       trpcClient.deck.getEmptyUserDecks.query({ numberOfEmptySlots: 20 }).catch(() => null),
       trpcClient.pokemon.getPokemonList.query({
         offset: +key[0]() * 15,
         limit: 15,
         searchQuery: key[1] as string,
       }),
       trpcClient.pokemon.getPokemonsByDeckId.query(searchParams.deckId ?? ""),
     ]);
     return { pokemons, emptyDecks, pokemonsInCurrentDeck };
    } else {
      let pokemons = await(await pokemonApi.listPokemons(+key[0]() * 15, 15)).results;
      pokemons = await Promise.all(
        pokemons.map(({ name }) => pokemonApi.getPokemonByName(name))
      );
      return { pokemons, emptyDecks: [], pokemonsInCurrentDeck: [] }
    }
    },
  { key: () => [page, searchParams.search] });
};

const totalLength = 1275;
const limit = 15;
const totalPages = Math.ceil(totalLength / limit);
export default function Home() {
  const fetchedData = useRouteData<typeof routeData>();
  const sereverEvent = useServerContext();
  const [user] = createResource(async () => {
    const cookie = isServer ? sereverEvent.request.headers.get("Cookie") : document.cookie;
    const session = await cookieSessionStorage.getSession(cookie);
    const id = session.get("id");
    const name = session.get("name");
    if (id && name) {
      return { id, name } as Session;
    } else {
      return undefined;
    }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const isRouting = useIsRouting();
  const [searchParams, setSearchParams] = useSearchParams();

  const [paginationState, setPaginationState] = createSignal<PaginationState>("Initial");
  const [showModal, toggleModal] = createSignal(false);

  const page = createMemo(() => getPage(location));
  const hasNextPage = createMemo(() => page() < totalPages);
  const hasPrevPage = createMemo(() => page() > 0);

  const moveCards = motion;

  createEffect(() => {
    if (!isRouting()) {
      setPaginationState("Initial");
    }
  });

  const goToNextPage = () => {
    if (hasNextPage()) {
      setPaginationState("Next");
      navigate(`/home/${page() + 1}${location.search}`)
      refetchRouteData();
    }
  }

  const goToPrevPage = () => {
    if (hasPrevPage()) {
      setPaginationState("Prev");
      navigate(`/home/${page() - 1}${location.search}`);
      refetchRouteData();
    }
  }
  
  const onSearch = (search: string) => {
    setSearchParams({ search })     
  };

  const movingCards = createMemo((prev) => {
    switch (true) {
      case paginationState() == "Next": {
        return [0, -5000];
      }
      case paginationState() == "Prev": {
        return [0, 5000];
      }
      case prev[1] > 0: {
        return [-5000, 0];
      }
      case prev[1] < 0: {
        return [5000, 0];
      }
    }
    return [0,0];
  },[0,0])

  return (
    <div class="flex flex-col h-full w-full">
      <Show when={fetchedData()?.emptyDecks?.length == 0 && !location.query.deckId}>
        <Suspense>
          <CreateDeck
            title="Create Deck"
            showModal={showModal()}
            cards={pokemons()}
            onClose={() => { toggleModal(false) }}
          />
        </Suspense>
      </Show>
      <Show when={fetchedData()?.emptyDecks?.length != 0 && location.query.deckId}>
        <Suspense>
          <AddCards
            title="Add Cards to Deck"
            showModal={showModal()}
            deckId={location.query.deckId}
            onClose={() => { toggleModal(false) }}
          />
        </Suspense>
      </Show>
      <div class="flex relative justify-center items-center">
        <SearchBar search={searchParams.search} onChange={onSearch}/>
      </div>
      <FixedButton
        existingPokemonsLength={fetchedData()?.pokemonsInCurrentDeck.length ?? 0}
        onClick={() => toggleModal(true)}
      />
      <PaginationButtons
        onNextPage={goToNextPage}
        onPrevPage={goToPrevPage}
        showPrev={hasPrevPage()}
        showNext={hasNextPage()}
      />
      <div
        use:moveCards={{
          initial: { x: 0 },
          animate: { x: movingCards() },
          transition: {
            duration: 2,
            easing: "ease-out",
         },
        }}
      >
       <CardsGrid>
         <For each={fetchedData()?.pokemons} fallback={<Spinner/>}>
           {(pokemon, index) => (
             <FlipCard
               user={user()}
               selectedPokemons={pokemons()}
               pokemonsInDeck={fetchedData()?.pokemonsInCurrentDeck}
               keepFlipped={flipState()}
               pokemon={pokemon}
             />
           )}
         </For>
       </CardsGrid>
      </div>
    </div>
  )
};
