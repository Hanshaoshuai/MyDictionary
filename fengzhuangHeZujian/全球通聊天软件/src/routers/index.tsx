import React, { ReactElement, Suspense, useEffect } from "react";
import { SwitchProps, Route, Redirect, useHistory } from "react-router-dom";
import { getToken } from "../helpers";

import Router from "./routers";
import Spins from "../pages/A-Spin";

export default function Routers({ location }: SwitchProps): ReactElement {
  const history = useHistory();
  useEffect(() => {
    if (!getToken()) {
      history.push("/login");
    }
    history.listen((route) => {
      // console.log(route); // 这个route里面有当前路由的各个参数信息
      if (
        !getToken() &&
        route.pathname !== "/register" &&
        route.pathname !== "/login"
      ) {
        history.push("/login");
      }
    });
  }, []);
  const route = Router.find((r) => r.path === location?.pathname);

  if (route && route.path) {
    return (
      <Suspense
        fallback={
          <Spins styleSize={[65, 33]} color={"#ff7a59"} fontSize={"33px"} />
        }
      >
        <div>
          <Route path={route.path} exact={true} component={route.component} />
        </div>
      </Suspense>
    );
  }
  return <Redirect to="/" />;
}
