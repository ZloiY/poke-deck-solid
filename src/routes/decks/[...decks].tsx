import { Suspense } from "solid-js";
import OtherUsersDecks from "~/components/OtherUsersDecks";
import { Spinner } from "~/components/Spinner";
import { UserDecks } from "~/components/UserDecks";

export default function UserDecksPage() {
  return (
    <div class="flex flex-col gap-8 mb-10 w-full px-5">
     <Suspense fallback={<Spinner/>}>
       <UserDecks />
     </Suspense>
     <Suspense fallback={<Spinner/>}>
       <OtherUsersDecks/>
     </Suspense>
    </div>
  )
};
