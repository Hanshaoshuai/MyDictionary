import React, { useContext, useMemo, useEffect } from "react";

import { MyContext } from "../../models/context";

const MyContexts: any = MyContext;

export default function List() {
  const { state } = useContext(MyContexts);
  useEffect(() => {
    console.log("names");
  }, []);
  return useMemo(() => {
    console.log("List", state.initState.number);
    return <div>{state.initState.number}</div>;
  }, [state.initState.number]);
}
