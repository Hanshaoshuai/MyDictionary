import './App.scss';
import React, { useReducer, useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSchedule } from './actions';
import Routers from './routers';
import { state, reducers } from './models';
import { MyContext } from './models/context';
import { APIS } from './api/ip';

// const io = require("socket.io");
import io from 'socket.io-client';

declare global {
  interface Window {
    socket: any;
  }
}

// const IP = "http://192.168.1.101:2021";
const IP = APIS;
// const obj = window.location.origin.split(":");
// const IP =
//   obj.length === 2
//     ? `${window.location.origin}:2021`
//     : `${obj[0]}:${obj[1]}:2021`;
console.log(IP);
window.socket = io(IP);
// const socket = io(IP);
const states: any = state();
const reducer: any = reducers();

export default function App() {
  const dispatchs = useDispatch();
  const schedule: any = useSelector<any>((state) => state.schedule);

  console.log(schedule);

  const [state, dispatch] = useReducer(reducer, states);
  const [messages, setMessages] = useState({});
  useEffect(() => {
    window.socket.on('message', function (data: any) {
      // console.log('message====>>>>>', data);
      setMessages(data);
    });
    // window.socket.on("classIcon", (data: any) => {
    //   // console.log("classIcon====>>>>>", data);
    //   setMessages(data);
    // });

    destroyGlobalSpinner();
    dispatchs(
      setSchedule({
        data: '数据更改',
        list: [1, 2, 3],
      })
    );
  }, []);

  const destroyGlobalSpinner = () => {
    const splash = document.querySelector('#splash-spinner');
    const spinner = document.querySelector('.spinner');
    if (splash) {
      document.head.removeChild(splash);
    }
    if (spinner && spinner.parentNode) {
      spinner.parentNode.removeChild(spinner);
    }
  };

  return (
    <Router>
      <MyContext.Provider value={{ state, dispatch, messages }}>
        <Switch>
          <Routers />
        </Switch>
      </MyContext.Provider>
    </Router>
  );
}
