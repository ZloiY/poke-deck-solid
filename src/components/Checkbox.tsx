import { splitProps } from "solid-js"
import { twMerge } from "tailwind-merge"

export const Checkbox = (props: {
  id: string,
  className: string,
  label: string,
  name: string,
}) => {
  const [local, other] = splitProps(props, ["className"])
  return (
    <div class="flex items-center">
      <input
        type="checkbox"
        {...other}
        class={twMerge(
          "w-4 h-4 active:scale-90 cursor-pointer",
          local.className
        )}
      />
      <label for={props.id} class="ml-2 text-md font-medium">
        {props.label}
      </label>
    </div>
  )
}
