import { createEffect, createSignal, onCleanup } from "solid-js";

export const SearchBar = (props: {
  search?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) => {
  const [value, setSearch] = createSignal(props.search ?? "");

  createEffect(() => {
    value();
    const timeoutId = setTimeout(() => {
      props.onChange(value());
    }, 150);
    onCleanup(() => { clearTimeout(timeoutId) }) 
  })

  const onInput = (event: InputEvent) => {
    setSearch(event.target.value);
  };

  return (
     <input
      class="w-4/5 h-full
      p-2
      text-3xl 
      border-4 rounded
      border-white hover:border-yellow-500 focus:border-purple-900
      bg-transparent outline-none
      placeholder:italic placeholder:font-light placeholder:text-purple-900/75 placeholder:text-2xl"
      value={value()}
      placeholder={props.placeholder ?? "Enter pokemon name..."}
      onInput={onInput}
    />
  );
};
