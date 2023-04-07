import { Suspense } from "solid-js";
import { Outlet, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { useUser } from "~/actions/useUser";

import { HeaderLayout } from "~/components/layouts/HeaderLayout";
import { Spinner } from "~/components/Spinner";

export function routeData() {
  return createServerData$(async (_, { request }) => {
    return await useUser(request);
  });
};

export default function PokemonsLayout() {
  const user = useRouteData<typeof routeData>();
  return (
    <HeaderLayout title="PokeDeck User Pokemons" user={user()}>
      <Suspense fallback={<Spinner className="h-96 w-96"/>}>
        <Outlet/>
      </Suspense>
    </HeaderLayout>
  );
};
