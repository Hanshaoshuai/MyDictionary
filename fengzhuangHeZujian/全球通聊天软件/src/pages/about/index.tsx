import React, { useContext } from "react";

import { MyContext } from "../../models/context";

export default function About() {
  const { state } = useContext(MyContext);
  console.log("About");
  return <div>About{state.initState.number}</div>;
}
