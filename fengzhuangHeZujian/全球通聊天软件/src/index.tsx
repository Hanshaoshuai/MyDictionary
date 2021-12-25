import 'antd-mobile/es/global';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducerAll from './reducer/index';
import App from './App';
import './index.scss';
import SuperMap from './pages/superMap';

const store = createStore(
  reducerAll
  // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <SuperMap />
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
