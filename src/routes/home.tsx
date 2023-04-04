import { Outlet, RouteDataArgs, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { useUser } from "~/actions/useUser";
import { HeaderLayout } from "~/components/layouts/HeaderLayout";

export function routeData({ location }: RouteDataArgs) {
  return createServerData$(async (_, { request }) => {
    return await useUser(request);
  },
  { key: () => ["user", location.pathname] });
}

export default function HomeLayout() {
  const user = useRouteData<typeof routeData>();
  return (
    <HeaderLayout title="PokeDeck Home" showFlip={true} user={user()}>
      <Outlet/>
    </HeaderLayout>
  )
};
