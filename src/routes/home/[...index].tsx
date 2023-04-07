import { Navigate, useLocation } from "solid-start";

export default function NavigateToHomeZero() {
  const location = useLocation();
  return <Navigate href={`/home/0${location.search}`}/>
}
