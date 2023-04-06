import { Match, Switch } from "solid-js";
import { EmptyDeckCard } from "./EmptyDeckCard";
import { FilledDeckCard } from "./FilledDeckCard";

type DeckCardProps = Parameters<typeof EmptyDeckCard>[0] &
  Parameters<typeof FilledDeckCard>[0];

export const DeckCard = (props: DeckCardProps) => {
  return (
    <Switch>
      <Match when={props.deck?.isEmpty}>
        <EmptyDeckCard {...props}/>
      </Match>
      <Match when={!props.deck?.isEmpty}>
        <FilledDeckCard {...props}/>
      </Match>
    </Switch>
  )
};
