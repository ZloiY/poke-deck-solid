import { Location } from "@solidjs/router";
import { createMemo, createSignal, For } from "solid-js";
import { createRouteData, refetchRouteData,
  RouteDataArgs,
  useLocation, useNavigate, useRouteData, useSearchParams } from "solid-start";
import { FlipCard } from "~/components/Cards/FlipCard";

import { PreviewCard } from "~/components/Cards/PreviewCard";
import { CardsGrid } from "~/components/CardsGrid";
import { PaginationButtons } from "~/components/PaginationButtons";
import { SearchBar } from "~/components/SearchBar";
import { Spinner } from "~/components/Spinner";
import { trpc } from "~/trpc/api";

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
  return createRouteData(async (key) => {
    const pokemons = await trpc.pokemon.getPokemonList.query({
      offset: +key[0]() * 15,
      limit: 15,
      searchQuery: key[1] as string,
    });
    return pokemons;
  },
  { key: () => [page, searchParams.search] });
};

const totalLength = 1275;
const limit = 15;
const totalPages = Math.ceil(totalLength / limit);
export default function Home() {
  const pokemons = useRouteData<typeof routeData>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paginationState, setPaginationState] = createSignal<PaginationState>("Initial");
  const page = createMemo(() => getPage(location));
  const hasNextPage = page() < totalPages;
  const hasPrevPage = page() > 0;

  const goToNextPage = () => {
    if (hasNextPage) {
      setPaginationState("Next");
      navigate(`/home/${page() + 1}${location.search}`)
      refetchRouteData();
    }
  }

  const goToPrevPage = () => {
    if (hasPrevPage) {
      setPaginationState("Prev");
      navigate(`/home/${page() - 1}${location.search}`);
      refetchRouteData();
    }
  }
  
  const onSearch = (search: string) => {
    setSearchParams({ search })     
  };

  return (
    <div class="flex flex-col h-full w-full">
      <div class="flex relative justify-center items-center">
        <SearchBar search={searchParams.search} onChange={onSearch}/>
      </div>
      <PaginationButtons
        onNextPage={goToNextPage}
        onPrevPage={goToPrevPage}
        showPrev={hasPrevPage}
        showNext={hasNextPage}
      />
      <CardsGrid>
        <For each={pokemons()} fallback={<Spinner/>}>
          {(pokemon, index) => (
            <FlipCard
              pokemon={pokemon}
            />
          )}
        </For>
      </CardsGrid>
    </div>
  )
};
