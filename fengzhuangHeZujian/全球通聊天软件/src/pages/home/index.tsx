import React, { useContext, useState } from "react";
import { Button } from "antd-mobile";
import List from "./list";
import Name from "./name";

import { MyContext } from "../../models/context";

export default function Home() {
  const { state, dispatch } = useContext(MyContext);
  const [a, setA] = useState(0);
  const setNames = () => {
    setA(a + 1);
    const initState = state.initState;
    initState.count += 1;
    dispatch({ type: "count", initState: initState });
  };
  return (
    <div>
      <Button onClick={() => setNames()}>更改</Button>
      Home+{state.initState.number}+{`${state.initState.count}`}
      {a}
      <List></List>
      <Name></Name>
    </div>
  );
}
