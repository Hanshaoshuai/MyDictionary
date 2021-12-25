import React from "react";
import { Loading } from "antd-mobile";

const Spins = ({
  styleSize,
  color,
  fontSize,
}: {
  styleSize: any;
  color: string;
  fontSize: any;
}) => {
  return (
    <div
      style={{
        height: `100%`,
        width: `100%`,
        position: "absolute",
        left: "0",
        top: "0",
        zIndex: 100,
      }}
    >
      <div
        style={{
          position: "absolute",
          margin: "auto",
          left: "0",
          top: "0",
          right: "0",
          bottom: "0",
          width: `${styleSize[0]}px`,
          height: `${styleSize[1]}px`,
          fontSize: fontSize,
        }}
      >
        <Loading color={color} />
      </div>
    </div>
  );
};

export default Spins;
