import { BlankDeckCard } from "./BlankDeckCard"

import Add from "@icons/add-inverse.svg";

type AddDeckCardProps = Omit<Parameters<typeof BlankDeckCard>[0], "children">;

export const AddDeckCard = (props: AddDeckCardProps) => {
  return (
    <BlankDeckCard {...props}>
      <div class="flex justify-center items-center w-full h-full">
        <div role="button">
          <Add class="w-60 h-60" />
          <p class="font-coiny mt-4 text-2xl text-center">Create new deck</p>
        </div>
      </div>
    </BlankDeckCard>
  );
}
