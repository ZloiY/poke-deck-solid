import { Pokemon } from "pokenode-ts";
import { FormError } from "solid-start";
import { createServerAction$, redirect } from "solid-start/server";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { trpc } from "~/trpc/api";
import { pushNewNotification } from "~/utils/notificationStore";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Input } from "../Input";

import { ContainerModal } from "./ContainerModal"

type CreateDeckProps = Omit<Parameters<typeof ContainerModal>[0], 'children'>
 & { cards?: Pokemon[] };

const validationSchema = z.object({
  name: z.string()
    .min(3, { message: "Deck name should be longer than 3 symbols."})
    .max(15, { message: "Deck name should be less than 15 symbols." }),
  private: z.string().nullish().transform((value) => !!value),
});

export default function CreateDeck(props: CreateDeckProps) {
  const [creating, { Form }] = createServerAction$(async (form: FormData, { request }) => {
    const name = form.get("name");
    const isprivate = form.get("isprivate");
    const cards = JSON.parse(form.get("cards")?.toString() ?? "");
    const fields = {
      name,
      private: isprivate,
    };
    const cookie = request.headers.get("Cookie") ?? "";
    const validatedFields = validationSchema.safeParse(fields);
    if (validatedFields.success) {
      const messageWithDeck = await trpc(cookie).deck.createDeck.mutate({
        ...validatedFields.data,
        cards: cards.map((pokemon: Pokemon) => ({
          name: pokemon.name,
          imageUrl: pokemon.sprites.other?.["official-artwork"].front_default ??
          pokemon.sprites.front_default ?? "",
        })),
     });
      const { deck, ...message } = messageWithDeck;
      pushNewNotification(message)
      if (message.state == "Success") {
        if (cards.length > 0) {
          return redirect(`/pokemons/${deck?.id}`)
        } else {
          return redirect(`/home?deckId=${deck?.id}`)
        }
      } 
    } else {
      const fieldErrors = validatedFields.error.issues.reduce((errs, error) => ({
        ...errs,
        [error.path[0]]: error.message,
      }), { username: "", password: "" })
      throw new FormError("Fields invalid", { fieldErrors, fields });
    }
  }) 

  return (
    <ContainerModal title={props.title} showModal={props.showModal} onClose={props.onClose}>
      <div class="gap-5 p-4">
        <Form class="flex flex-col w-full gap-5">
          <div class={twMerge(
            "flex gap-5 justify-between items-end",
             creating.error?.fieldErrors?.name && "items-center",
            )}
          >
            <input type="hidden" name="cards" value={JSON.stringify(props.cards ?? [])}/>
            <Input
              label="Deck name:"
              id="name"
              name="name"
              containerStyle="max-w-[220px]"
              error={creating.error?.fieldErrors?.name}
            />
            <Button
              type="submit"
              disabled={creating.pending}
              isLoading={creating.pending}
              className="bg-green-500 whitespace-nowrap text-xl px-3 h-10"
            >
              Create Deck!
            </Button>
          </div>
          <Checkbox
            id="isprivate"
            name="isprivate"
            className="w-5 h-5"
            label="Make this deck private?"
          />
        </Form>
      </div>
    </ContainerModal>
  )
}
