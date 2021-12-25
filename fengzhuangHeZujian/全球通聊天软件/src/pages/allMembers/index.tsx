import "../personalInformation/index.scss";

import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const ChatList = () => {
  const history = useHistory();
  const [imgIdLoc] = useState<any>(
    JSON.parse(window.localStorage.getItem("imgIdLoc") || "[]")
  );

  useEffect(() => {}, []);

  const goBackS = () => {
    if (!localStorage.getItem("type")) {
      history.push("/");
    } else {
      history.goBack();
    }
    localStorage.removeItem("personalInformation");
  };

  const toChat = (classIcon: string, name: string, nickName: any) => {
    // console.log(classIcon, name);
    localStorage.setItem("headPortrait_groupChat", classIcon);
    localStorage.setItem("headPortrait", classIcon);
    localStorage.setItem("nickName", nickName);
    localStorage.setItem("toNames", nickName);
    localStorage.setItem("toChatName", name);
    localStorage.setItem("fromName", name);
    localStorage.setItem("personalInformation", "1");

    localStorage.setItem("type", "chat");

    history.push("/personalInformation");
  };

  return (
    <div className="personalInformation">
      <div className="searchBox">
        <div className="home-search">
          <img
            src="/images/fanhui.png"
            className="xiangmu-left"
            alt=""
            onClick={goBackS}
          />
          <span>所有成员</span>
        </div>
      </div>
      <div className="contents contents_search_leng">
        <div className="denglu-text ziZhu">
          <div className="xiangCe">
            {imgIdLoc.map((item: any, index: number) => {
              return (
                <div
                  key={index}
                  className="font_list"
                  onClick={() =>
                    toChat(item.classIcon, item.name, item.nickName)
                  }
                >
                  <img className="border" src={item.classIcon} alt="" />
                  <span className={"names"}>{item.nickName}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
