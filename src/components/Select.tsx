import { Select as SolidSelect } from "@thisbeyond/solid-select";
import { Show } from "solid-js";
import "@thisbeyond/solid-select/style.css";
import { twMerge } from "tailwind-merge";

type SelectProps<T extends { id: string | number }> = {
  id?: string,
  name?: string,
  className?: string,
  selectedItem?: T,
  placeholder?: string,
  label?: string,
  items: T[],
  onSelect: (item: T) => void,
}

export const Select = <T extends { id: string | number }>(props: SelectProps<T>) => {
  return (
    <div class={twMerge("flex flex-col gap-5", props.className)}>
      <Show when={props.label}>
        <label class="text-white text-2xl font-coiny">{props.label}</label>
      </Show>
      <SolidSelect
        format={(value) => value.name}
        class="solid-select"
        id={props.id}
        name={props.name}
        initialValue={props.selectedItem}
        isOptionDisabled={(item) => !!(props.selectedItem?.id && props.selectedItem.id == item.id)}
        placeholder={props.placeholder ?? "Select item"}
        options={props.items}
        onChange={props.onSelect}
      />
    </div>
  )
};
