import './selector.scss';
import React, { useRef } from 'react';

let selectorKey = 0;
let selectorTop = 0;
const Selector = ({
  dataList = [],
  selectedKey = () => {},
  inclination = 5,
  styles = {},
  itemHeight = 15,
  borderColor = '',
  color = '#6b6b6b',
}: any) => {
  const box: any = useRef();
  const selector = (e: any, key: number, value: any) => {
    // console.log(e, key, value);
    selectedKey({ e, key, value });
    let multiple = Math.abs(key - selectorKey);
    if (key > selectorKey) {
      selectorTop += multiple * itemHeight * 2;
      box.current.style.transform = `translate3d(0px, ${-selectorTop}px, 0px)`;
    }
    if (key < selectorKey) {
      selectorTop -= multiple * itemHeight * 2;
      box.current.style.transform = `translate3d(0px, ${-selectorTop}px, 0px)`;
    }
    Array.from(box.current.children).map((item: any, index: number) => {
      if (key === index) {
        item.style.transform = `translate3d(${0}px, 0px, 0px)`;
      }
      if (index < key) {
        item.style.transform = `translate3d(${
          Math.pow(key - index, 2) * inclination
        }px, 0px, 0px)`;
      } else {
        item.style.transform = `translate3d(${
          Math.pow(index - key, 2) * inclination
        }px, 0px, 0px)`;
      }
      return item;
    });
    selectorKey = key;
  };

  return (
    <div className="selector">
      <div className="box">
        <div className="box-list" style={styles}>
          <div
            className="cover-layer-top"
            style={{
              height: `calc(50% - ${itemHeight}px)`,
              borderColor: `${borderColor}`,
            }}
          ></div>
          <div
            ref={box}
            className="box-list-items"
            style={{ top: `calc(50% - ${itemHeight}px)` }}
          >
            {dataList.map((item: any, index: number) => {
              return (
                <span
                  key={item.key}
                  onClick={(e) => selector(e, index, item.value)}
                  style={{
                    transform: `translate3d(${
                      inclination * Math.pow(index, 2)
                    }px, 0px, 0px)`,
                    top: `calc(50% - ${itemHeight}px)`,
                    height: `${itemHeight * 2}px`,
                    color: color,
                  }}
                >
                  {item.value}
                </span>
              );
            })}
          </div>
          <div
            className="cover-layer-bottom"
            style={{
              height: `calc(50% - ${itemHeight}px)`,
              borderColor: `${borderColor}`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Selector;
