import { useSize } from "ahooks";
import { useState, useContext } from "react";

import { MyContext } from "./context";

export default function useAppModel(type: any, initState: any) {
  const { state, dispatch } = useContext(MyContext);

  dispatch({ type, initState });

  // const { width, height } = useSize(document.body);
  // const [names, setName] = useState<any>(0);

  // return {
  //   names,
  //   setName,
  //   width,
  //   height,
  // };
}
