import { Pokemon } from "pokenode-ts";
import { createMemo, createSignal } from "solid-js";

const pokemonsMap = new Map<string, Pokemon>();

const [selectedPokemons, setSelectedPokemons] = createSignal(pokemonsMap, { equals: false });

const selectPokemon = (pokemon: Pokemon) => {
  setSelectedPokemons((pokemonsMap) => {
    pokemonsMap.set(pokemon.name, pokemon);
    return pokemonsMap;
  })
}

const unSelectPokemon = (pokemon: Pokemon) => {
  setSelectedPokemons((pokemonsMap) => {
    pokemonsMap.delete(pokemon.name);
    return pokemonsMap;
  })
}

const resetPokemons = () => {
  pokemonsMap.clear();
  setSelectedPokemons(pokemonsMap);
}

const pokemons = createMemo(() => [...selectedPokemons().values()])

export { pokemons, selectPokemon, unSelectPokemon, resetPokemons };
