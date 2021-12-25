import './selector.scss';
import React, { useRef, useEffect } from 'react';

let indexKey = 0;
const Selector = ({
  defaults = null,
  dataList = [],
  selectedKey = () => {},
  inclination = 5,
  styles = {},
  itemHeight = 15,
  borderColor = '',
  transparency = null,
  blurLayer = null,
  setSelectedKey = null,
  gradientSpeed = 0.03,
  alignItems = 'center',
}: any) => {
  const box: any = useRef();
  if (setSelectedKey === null) {
    styles = { ...styles, overflow: 'hidden' };
  }
  useEffect(() => {
    if (defaults !== null && setSelectedKey === null) {
      selector(null, defaults, null);
    }
    if (setSelectedKey !== null || defaults === null) {
      selector(null, setSelectedKey, null);
    }
  }, [setSelectedKey]);

  const intervalsY = (item: any) => {
    // 渐变显示
    let opacityKeyY = 0;
    const intervalItem = setInterval(() => {
      if (opacityKeyY >= 1) {
        opacityKeyY = 1;
        item.style.opacity = opacityKeyY;
        clearInterval(intervalItem);
      }
      opacityKeyY += gradientSpeed; // 设置渐变速度
      item.style.opacity = opacityKeyY;
    }, 10);
  };
  const intervalsN = (item: any) => {
    // 渐变隐藏
    let opacityKeyN = 1;
    const intervalItem = setInterval(() => {
      if (opacityKeyN <= 0) {
        opacityKeyN = 0;
        item.style.opacity = opacityKeyN;
        clearInterval(intervalItem);
      }
      opacityKeyN -= gradientSpeed; // 设置渐变速度
      item.style.opacity = opacityKeyN;
    }, 10);
  };

  const selector = (e: any, key: number, value?: any) => {
    if (setSelectedKey === null && indexKey === key && box.current.id) {
      return;
    }
    if (setSelectedKey === null) {
      selectedKey({ e, key, value });
    }
    let id = Number(box.current.id || 0);
    let selectorTop = Number(box.current.index || 0);
    let multiple = Math.abs(key - id);

    const dom = box.current.children;
    if (transparency !== null) {
      // 高亮除外模糊设置
      let topId = 0;
      let bottomId = 0;
      for (let e = key - 1; e >= 0; e--) {
        topId += transparency;
        // topId = Math.round(topId * 10) / 10;
        if (topId > 1) {
          topId = 1;
          dom[e].style.pointerEvents = 'none';
        } else {
          dom[e].style.pointerEvents = 'all';
        }
        dom[e].style.opacity = 1 - topId;
      }

      const efficientLength = dom.length;
      for (let e = key; e < efficientLength; e++) {
        // bottomId = Math.round(bottomId * 10) / 10;
        if (bottomId > 1) {
          bottomId = 1;
          dom[e].style.pointerEvents = 'none';
        } else {
          dom[e].style.pointerEvents = 'all';
        }
        dom[e].style.opacity = 1 - bottomId;
        bottomId += transparency;
      }
    }

    if (key > id) {
      selectorTop += multiple * itemHeight * 2;
      box.current.index = selectorTop;
      box.current.style.transform = `translate3d(0px, ${-selectorTop}px, 0px)`;
    }
    if (key < id) {
      selectorTop -= multiple * itemHeight * 2;
      box.current.index = selectorTop;
      box.current.style.transform = `translate3d(0px, ${-selectorTop}px, 0px)`;
    }

    for (let i = 0; i < dom.length; i++) {
      if (key === i) {
        dom[i].style.transform = `translate3d(${0}px, 0px, 0px)`;
        if (setSelectedKey !== null) {
          intervalsY(dom[i]); // 显示渐变
        } else {
          dom[i].style.opacity = 1;
        }
      }
      if (i < key) {
        if (setSelectedKey !== null) {
          if (key - i === 1 && key > id) {
            intervalsN(dom[i]); // 隐藏渐变
          } else {
            dom[i].style.opacity = 0;
          }
        }

        dom[i].style.transform = `translate3d(${
          Math.pow(key - i, 2) * inclination
        }px, 0px, 0px)`;
      } else {
        if (setSelectedKey !== null) {
          if (i - key === 1 && key < id) {
            intervalsN(dom[i]); // 隐藏渐变
          } else {
            dom[i].style.opacity = 0;
          }
        }

        dom[i].style.transform = `translate3d(${
          Math.pow(i - key, 2) * inclination
        }px, 0px, 0px)`;
      }
    }
    indexKey = key;
    box.current.id = key;
  };

  return (
    <div className="selector">
      <div className={`box`}>
        <div className="box-list" style={styles}>
          {blurLayer && (
            <div
              className="cover-layer-top"
              style={{
                height: `calc(50% - ${itemHeight}px)`,
                borderBottom: `${borderColor}`,
              }}
            ></div>
          )}
          <div
            ref={box}
            className="box-list-items"
            style={{
              top: `calc(50% - ${itemHeight}px)`,
              pointerEvents: `${setSelectedKey !== null ? 'none' : 'all'}`,
            }}
          >
            {dataList.map((item: any, index: number) => {
              return (
                <span
                  key={item.key}
                  onClick={(e) => selector(e, index, item.content)}
                  style={{
                    transform: `translate3d(${
                      inclination * Math.pow(index, 2)
                    }px, 0px, 0px)`,
                    top: `calc(50% - ${itemHeight}px)`,
                    height: `${itemHeight * 2}px`,
                    justifyContent: `${alignItems}`,
                  }}
                >
                  {item.content}
                </span>
              );
            })}
          </div>
          {blurLayer && (
            <div
              className="cover-layer-bottom"
              style={{
                height: `calc(50% - ${itemHeight}px)`,
                borderTop: `${borderColor}`,
              }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SelectorTabs = Selector;
export default Selector;
