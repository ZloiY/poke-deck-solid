import { Suspense } from "solid-js";
import { useRouteData } from "solid-start";
import { Outlet } from "solid-start";
import { createServerData$ } from "solid-start/server";

import { useUser } from "~/actions/useUser";
import { HeaderLayout } from "~/components/layouts/HeaderLayout";
import { Spinner } from "~/components/Spinner";

export function routeData() {
  return createServerData$(async (_, { request }) => {
    return await useUser(request);
  });
}

export default function Deck() {
  const user = useRouteData<typeof routeData>();

  return (
    <HeaderLayout title="PokeDeck Decks" user={user()}>
      <Suspense fallback={<Spinner className="w-96 h-96"/>}>
        <Outlet />
      </Suspense>
    </HeaderLayout>
  )
}
