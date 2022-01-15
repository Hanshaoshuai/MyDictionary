import React, { useState } from 'react';
import './index.pcss';
import { list } from '../indexTS';

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
  const [text, setText] = useState<any>('hooks');
  let list: list[] = [
    { key: 1, value: '123' },
    { key: 2, value: '123456779013' },
  ];
  return (
    <div className="name">
      Switch我是支持ts的{text}
      {list.map((item: any) => {
        return <div key={item.value}>{item.value}</div>;
      })}
    </div>
  );
};

export default App;
