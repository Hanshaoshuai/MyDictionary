import './index.pcss';
import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CloseOutlined, ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons';

let itemShow = [];
let itemShowList = [];
let itemShowList1 = [];
const CombinationDrawer = (props, ref) => {
  const { list, drawerShow, setDrawerShow, filters, titles, redundantWidth = 34, initial } = props;
  const [newData, setNewData] = useState(list);
  useImperativeHandle(ref, () => ({
    getInfo: (index) => {
      //父组件调用了子组件需要处理的数据
      onfilters((index - 1).toString());
    },
  }));
  useEffect(() => {
    setNewData(list);
  }, [list]);
  useEffect(() => {
    const { index, title } = filters;
    onfilters(index, title);
  }, [filters]);

  const drawers = useCallback(
    (node) => {
      if (node !== null) {
        const domList = [...node.children].filter((i, index) => index > 0);
        const newList = [...newData];
        domList.map((item, index) => {
          newList[index].width = item.clientWidth;
          return item;
        });
        setNewData(newList);
      }
    },
    [list, filters],
  );

  const setDrawerShows = () => {
    itemShow = [];
    itemShowList = [];
    itemShowList1 = [];
    setDrawerShow(!drawerShow);
  };
  const itemLast = (key, itemLength, item, newList) => {
    if (key === itemLength && key - 1 >= 0) {
      item.show = true;
      item.notExpanded = true;
      item.transition = item.width + newList[key - 1].transition - redundantWidth;
    }
  };
  const onfilters = (index, title) => {
    // if (!index && !title) return;
    let newList = [...newData];
    let indexN = Number(index);
    if (indexN === newList.length - 1) return;
    itemShow = [];
    itemShowList = [];
    itemShowList1 = [];
    let stateId = 0;
    let notExpandedId = 0;
    let stateKeyId = 0;
    let indexWidth = 0;
    let transitionFalseId = false;
    let notExpandedIndex = 0;
    let notExpandedIndexId = null;
    const keyId = (indexN + 1).toString();
    newList.map((item, key) => {
      if (key === 0) {
        item.show = true;
      }
      if (item.show) {
        itemShowList.push(key);
      }
      return item;
    });
    newList = newList.map((item, key) => {
      if (key < indexN && item.notExpanded) {
        stateKeyId += 1;
      }
      if (item.notExpanded) {
        notExpandedIndex = item.transition;
        notExpandedIndexId = key;
      }
      if (title === 'transition') {
        // 展开设置
        if (key === indexN) {
          const obj = newList[key - 1];
          item.state = true;
          item.show = true;
          item.notExpanded = true;
          item.transition = stateId > 0 ? item.width + obj.transition - redundantWidth : item.width;
        } else if (key > indexN) {
          item.state = true;
          const obj = newList[key - 1];
          item.transition = item.notExpanded
            ? item.width + obj.transition - redundantWidth
            : obj.transition;
        }
        if (!item.state) {
          delete item.coexist;
        }
      } else if (title === 'stretch') {
        // 收缩设置
        if (index === key) {
          if (index === 0) {
            item.state = false;
          }
          item.notExpanded = false;
          item.transition = item.transition - item.width + redundantWidth;
        } else if (key > index) {
          item.transition = item.transition - newList[index].width + redundantWidth;
        }
        if (key === itemShowList.length - 1) {
          item.show = true;
          item.notExpanded = true;
        }
      } else {
        if (title) {
          // 初始展开
          if (initial && Number(keyId) !== newList.length) {
            const obj = newList[keyId];
            obj.transition = obj.width;
          }

          if (item.fatherSonConnection === index.toString()) {
            index = Number(index);
            if (titles && title) {
              const titleList = [];
              titleList.push(newList[index].title);
              titleList.push(
                <span
                  className='breadcrumb'
                  key={key}
                  onClick={() => closure(indexN.toString())}
                >
                  {newList[index].title && <span> / </span>}
                  {title}
                </span>,
              );
              item.title = titleList;
            }
            item.state = true;
            item.show = true;
            item.notExpanded = true;
            item.zIndex = 200;
            if (initial) {
              item.transition = item.width;
            } else {
              item.transition = item.width + newList[index].width - redundantWidth;
            }
          } else {
            if (initial) {
              if (key < newList.length - 1) {
                item.notExpanded = false;
                item.state = false;
              }
            } else {
              if (key === itemShowList.length - 1) {
                item.show = true;
                item.notExpanded = true;
              }
              if (key >= indexN + 2) {
                item.show = false;
              }
            }
            if ((indexN - 1).toString() === item.fatherSonConnection) {
              item.zIndex = 210;
            } else {
              item.zIndex = 200;
            }
          }
        } else {
          // 关闭设置
          index = Number(index);
          if (key === index) {
            if (!item.notExpanded && index - 1 >= 0) {
              if (
                notExpandedIndexId !== null &&
                (notExpandedIndexId === 0 || notExpandedIndexId < key)
              ) {
                item.transition = item.width + notExpandedIndex - redundantWidth;
              } else {
                item.transition = item.width + notExpandedIndex;
              }
            }
            item.state = true;
            item.show = true;
            item.notExpanded = true;
            item.zIndex = 200;
          } else if (key > index) {
            item.notExpanded = false;
            item.state = false;
            item.show = false;
          }
        }
      }
      if (item.notExpanded) {
        notExpandedId += 1;
      }
      if (item.notExpanded) {
        stateId += 1;
      }
      if (item.show) {
        itemShow.push(key.toString());
        itemShowList1.push(key);
      }
      return item;
    });
    // 如果展开超过2个时进行处理消除一个
    if (notExpandedId > 2) {
      // console.log('超过2个');
      newList = newList.map((item, key) => {
        if (
          key === Number(keyId) &&
          Number(keyId) !== newList.length - 1 &&
          item.notExpanded &&
          itemShowList1[key]
        ) {
          item.notExpanded = false;
          item.transition = item.transition - item.width + redundantWidth;
          indexWidth = item.width;
          itemLast(key, itemShowList1.length - 1, item, newList);
        } else if (stateKeyId === 1) {
          if (key < indexN && item.notExpanded && indexN !== newList.length - 1) {
            item.state = false;
            item.notExpanded = false;
            item.transition = item.transition - item.width + redundantWidth;
            indexWidth = item.width;
          } else {
            item.transition = item.transition - indexWidth + redundantWidth;
          }
          itemLast(key, itemShowList1.length - 1, item, newList);
        } else if (key > indexN) {
          if (key - indexN === 1) {
            item.transition = item.transition - redundantWidth;
          }
          if (item.notExpanded) {
            if (!transitionFalseId && key !== newList.length - 1) {
              item.notExpanded = false;
              item.transition = item.transition - item.width + redundantWidth;
              indexWidth = item.width;
            } else {
              item.transition = item.transition - indexWidth + redundantWidth;
            }
            transitionFalseId = true;
          } else {
            item.transition = newList[key - 1].transition;
          }
          itemLast(key, itemShowList1.length - 1, item, newList);
        }
        return item;
      });
    }
    itemShow.pop();
    setNewData(newList);
  };
  const onUnfold = (e) => {
    onfilters(e, 'transition');
  };
  const closure = (fatherSonConnection, stretch) => {
    onfilters(fatherSonConnection, stretch);
  };
  const newListDom = (list) => {
    const newList = [];
    list.map((item, index) => {
      const obj = {
        width: `${item.width ? item.width + 'px' : 'auto'}`,
        zIndex: 190 - index,
      };
      if (drawerShow && !item.state) {
        obj.transform = `translateX(${-redundantWidth * (index + 1)}px)`;
      }
      if (index === 0 && drawerShow && item.state) {
        obj.transform = `translateX(${-100}%)`;
      } else {
        if (drawerShow && item.state) {
          obj.transform = `translateX(${-item.transition - redundantWidth * index + 1}px)`;
        }
      }
      if (!item.show && index !== 0) {
        obj.transform = 'translateX(100%)';
      }
      if (itemShow[index]) {
        obj.cursor = 'not-allowed';
      }
      newList.push(
        <div
          key={`${index}`}
          className='transitions drawerContentItemBox'
          style={obj}
        >
          {index === 0 ? (
            <div className='closure'>
              {!item.state ? (
                <ArrowLeftOutlined onClick={() => onUnfold(index)} className='anticonLeft' />
              ) : (
                itemShow.length >= 1 && (
                  <ArrowRightOutlined
                    onClick={() => closure(index, 'stretch')}
                    className='anticonLeft'
                  />
                )
              )}
              <CloseOutlined onClick={setDrawerShows} className='anticon' />
            </div>
          ) : (
            <div className='closure'>
              {item.title}
              {itemShow[index] && (
                <>
                  {!item.state || !item.notExpanded ? (
                    <ArrowLeftOutlined
                      onClick={() => onUnfold(index)}
                      className='anticonLeft'
                    />
                  ) : (
                    <ArrowRightOutlined
                      onClick={() => closure(index, 'stretch')}
                      className='anticonLeft'
                    />
                  )}
                </>
              )}
              <CloseOutlined
                onClick={() => closure((index - 1).toString())}
                className='anticon'
              />
            </div>
          )}
          {item.value}
          {itemShow[index] && <div className='pointerEvents'></div>}
        </div>,
      );
    });
    return newList;
  };
  return (
    <div ref={drawers}>
      <div
        className={`transitions drawer ${drawerShow && 'translateXShow'}`}
        onClick={setDrawerShows}
      ></div>
      {newListDom(newData)}
    </div>
  );
};

export default forwardRef(CombinationDrawer);
