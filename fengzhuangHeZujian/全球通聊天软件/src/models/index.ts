import initStates from "./state";

import reducer from "./reducer";

export function state() {
  return initStates();
}
export const reducers = () => {
  return reducer;
};
