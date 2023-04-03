import { children, JSX } from "solid-js";
import { Header } from "../Header";
import { Layout } from "./Layout";

export const HeaderLayout = (props: {
  title: string,
  showFlip?: boolean,
  user?: Session,
  children?: JSX.Element,
}) => {
  const c = children(() => props.children);
  return (
    <Layout title={props.title}>
      <Header showFlip={props.showFlip} user={props.user}/>
      {c()}
    </Layout>
  );
};
