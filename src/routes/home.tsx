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
}

export default function HomeLayout() {
  const user = useRouteData<typeof routeData>();
  return (
    <HeaderLayout title="PokeDeck Home" showFlip={true} user={user()}>
      <Suspense
        fallback={
          <div class="h-full w-full flex justify-center items-center">
            <Spinner className="h-56 w-56"/>
          </div>
        }>
        <Outlet/>
      </Suspense>
    </HeaderLayout>
  )
};
