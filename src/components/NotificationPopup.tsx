import { createEffect, For, onCleanup, onMount } from "solid-js";
import { twMerge } from "tailwind-merge";

import { Motion, createMotion } from "@motionone/solid";
import Close from "@icons/close.svg";

import { notifications, pushNewNotification, removeNotification } from "~/utils/notificationStore";
import { v4 } from "uuid";

const Notification = (props: { message: Message }) => {
  let ref!: HTMLDivElement;

  onMount(() => {
    createMotion(ref, {
      animate: { opacity: [0, 1], scale: [0, 1] },
      transition: { easing: "ease-in" }
    });
  });


  createEffect(() => {
    const animateTimeoutId = setTimeout(() => {
      createMotion(ref, {
        animate: { opacity: [1, 0], height: "0px" },
        transition: { easing: "ease-out" }
      });
    }, 5600);
    const timeoutId = setTimeout(() => {
      removeNotification(props.message);
    }, 6000);
    return () => {
      clearTimeout(animateTimeoutId);
      clearTimeout(timeoutId);
    };
  }, props.message);

  return (
    <div
      ref={ref}
      class={twMerge(
        "w-80 rounded-3xl text-white p-4 z-[110] backdrop-blur-md",
        props.message.state == "Success"
          ? "bg-lime-400/70 shadow-[0px_0px_15px_4px] shadow-lime-500"
          : "bg-red-600/70 shadow-[0px_0px_15px_4px] shadow-red-700",
      )}
    >
      <div class="flex justify-between items-center w-full">
        <span class="text-2xl font-coiny">{props.message.state}!</span>
        <Close
          class="w-8 h-8 cursor-pointer active:scale-90"
          onClick={() => removeNotification(props.message)}
        />
      </div>
      <p class="mt-5 text-center text-xl">{props.message.message}</p>
    </div>
  )
};

export const NotificationsPopups = () => {
  return (
    <div class="absolute top-5 right-8 flex flex-col gap-5 z-[110]">
      <For each={notifications()}>
        {(notification) => <Notification message={notification}/> }
      </For>
    </div>
  )
};
