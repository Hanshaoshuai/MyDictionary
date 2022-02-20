import './reactTransitionGroup.pcss'
import React, { useCallback, useEffect, useState } from 'react';
import { Route } from 'react-router-dom';

let index = 0; // 当前的  用于记录上一次的路由  如果是返回条件要 赋值给previous的
let newDom = null; // 当前dom；
const ReactTransitionGroup = ({ path, component }) => {
  const [pathNameList, setPathNameList] = useState([]); // 上一个
  const [states, setStates] = useState(null); // 判断返回还是下一个
  const [switchs, setSwitchs] = useState(false);

  const [odDom, setOdDom] = useState(null); // 之前的dom；
  const [stata, setStata] = useState(false);

  useEffect(() => {
    if (path) {
      setStata(!stata);
      if (!odDom) {
        setOdDom(<Route component={component} />);
      }
      if (index === 0) {
        setPathNameList([path]);
      } else {
        const odList = [...pathNameList];
        odList.push(path);
        const listName = [];
        for (let i = 0; i < odList.length; i++) {
          if (odList[i] === path) {
            listName.push(path);
            break;
          } else {
            listName.push(odList[i]);
          }
        }
        if (listName.length > pathNameList.length) {
          setStates('上一次操作路由向下');
        } else {
          setStates('上一次操作路由返回');
        }
        setSwitchs(true);
        setPathNameList(listName);
      }
      index += 1;
      newDom = <Route component={component} />;
      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        setSwitchs(false);
        setOdDom(newDom);
      }, 600);
    }
  }, [path]);

  if (path) {
    return (
      <div
        className={`${switchs && states === '上一次操作路由返回'
          ? 'zoomLeft'
          : switchs && states === '上一次操作路由向下'
            ? 'zoomRight'
            : ''
          }`}
        style={{
          position: 'absolute',
          top: '0',
          left: `${switchs && states === '上一次操作路由返回' ? '-100%' : '0'}`,
          width: `${switchs ? '200%' : '100%'}`,
          height: '100%',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '50%',
            height: '100%',
            float: 'left',
            display: `${switchs && states === '上一次操作路由向下' ? 'block' : 'none'
              }`,
          }}
        >
          {odDom}
        </div>
        <div
          style={{
            position: 'relative',
            width: `${switchs ? '50%' : '100%'}`,
            height: '100%',
            float: 'left',
          }}
        >
          <Route path={path} exact={true} component={component} />
        </div>
        <div
          style={{
            position: 'relative',
            width: '50%',
            height: '100%',
            float: 'left',
            display: `${switchs && states === '上一次操作路由返回' ? 'block' : 'none'
              }`,
          }}
        >
          {odDom}
        </div>
      </div>
    );
  } else {
    return <div></div>;
  }
};
export default ReactTransitionGroup;
