import { children, JSXElement } from "solid-js";
import { Title } from "solid-start";

import { NotificationsPopups } from "../NotificationPopup";
import { PageLoader } from "../PageLoader";

interface LayoutProps {
  children: JSXElement;
  title: string;
}

export const Layout = (props: LayoutProps) => {
  const c = children(() => props.children);
  return (
    <main class="bg-purple-500 h-full w-full relative overflow-y-scroll">
      <PageLoader/>
      <Title>{props.title}</Title>
      <NotificationsPopups/>
      {c()}
    </main>
  )
};
