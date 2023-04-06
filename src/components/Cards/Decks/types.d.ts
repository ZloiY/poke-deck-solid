type DeckCard<T> = {
  deck: T;
  onClick?: (id: string) => void;
  addCard?: (id: string) => void;
  removeDeck?: (id: string) => void;
  className?: string;
  notInteractive?: boolean;
};
