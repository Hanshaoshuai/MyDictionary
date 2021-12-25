import React, { useContext, useEffect, useMemo, useCallback } from "react";
import { Button } from "antd-mobile";

import { MyContext } from "../../models/context";

export default function Name() {
  const { state, dispatch } = useContext(MyContext);

  useEffect(() => {}, []);
  const setNames = useCallback(() => {
    const initState = state.initState;
    initState.number += 1;
    dispatch({ type: "numberInc", initState: initState });
  }, [state.initState, dispatch]);
  return useMemo(() => {
    console.log("Name", state.initState.count);
    return (
      <div>
        <Button
          style={{ background: "#1677ff", color: "#fff" }}
          onClick={() => setNames()}
        >
          Name
        </Button>
        {state.initState.count}
      </div>
    );
  }, [setNames, state.initState.count]);
}
