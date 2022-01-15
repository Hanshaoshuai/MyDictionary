import { useState } from 'react';
import './index.pcss';

// css第一种写法
// import styled from 'styled-components'
// const App = () => {
//     return (<StyledSwitch >
//         Switch123
//     </StyledSwitch>)
// }
// const StyledSwitch = styled.h1`color:#f66`

// css第二种写法
// import { jsx, css, Global, ClassNames } from '@emotion/react';
// const App = () => {
//     return (<div css={css`
//         color: green;
//       `}>
//         Switch12311
//     </div >)
// }
// const App = () => {
//   cosnt = [text, setText] = useState('hooks');
//   return <div css={{ color: 'hotpink' }}>Switch我是{text}</div>;
// };

const App = () => {
  const [text, setText] = useState('hooks');
  return <div className="name">Switch我是{text}</div>;
};

export default App;
