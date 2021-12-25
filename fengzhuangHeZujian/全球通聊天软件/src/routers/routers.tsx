import { FunctionComponent, lazy } from "react";
import { RouteComponentProps } from "react-router-dom";

interface FrontEndRoute {
  path: string;
  component: FunctionComponent<RouteComponentProps>;
  auth?: boolean;
}

const Login = lazy(() => import("../pages/login"));
const Register = lazy(() => import("../pages/register"));
const ChatRecord = lazy(() => import("../pages/chatRecord"));
const PersonalInformation = lazy(() => import("../pages/personalInformation"));
const Chatroom = lazy(() => import("../pages/chatroom"));
const BuildGroup = lazy(() => import("../pages/buildGroup"));
const AddBuildingGroup = lazy(() => import("../pages/addBuildingGroup"));
const AllMembers = lazy(() => import("../pages/allMembers"));
const Threejs = lazy(() => import("../pages/threejs"));

const Home = lazy(() => import("../pages/home"));
const About = lazy(() => import("../pages/about"));

const Router: FrontEndRoute[] = [
  { path: "/", component: ChatRecord },
  { path: "/home", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/personalInformation", component: PersonalInformation },
  { path: "/chatroom", component: Chatroom },
  { path: "/buildGroup", component: BuildGroup },
  { path: "/addBuildingGroup", component: AddBuildingGroup },
  { path: "/allMembers", component: AllMembers },

  { path: "/about", component: About },
  { path: "/threejs", component: Threejs },
];

export default Router;
