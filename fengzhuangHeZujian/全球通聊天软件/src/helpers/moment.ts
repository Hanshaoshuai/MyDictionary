//过去式记录格式为：几时几分、超过24小时显示几月几日
export function moment(num: any) {
  if (!num) {
    return;
  }
  // num = parseInt(num);
  let newNum = new Date().getTime(),
    time = new Date(num).toLocaleString(),
    date = new Date(new Date()),
    year,
    mouth,
    day: any,
    h: any,
    m: string,
    newTime: any = new Date(newNum).toLocaleString(),
    week = {
      0: "日",
      6: "一",
      5: "二",
      4: "三",
      3: "四",
      2: "五",
      1: "六",
    },
    getDays = new Date().getDate() * 1;
  time = time.replace(/\d+[\/\-]/, (text: any) => {
    year = text.match(/\d+/)[0];
    return "";
  });
  time = time.replace(/\d+[\/\-]/, (text: any) => {
    mouth = text.match(/\d+/)[0];
    return "";
  });
  time = time.replace(/\d+/, (text: any) => {
    day = text.match(/\d+/)[0];
    return "";
  });
  time = time.replace(/\d+/, (text: any) => {
    h = text.match(/\d+/)[0] * 1;
    return "";
  });
  time = time.replace(/\d+/, (text: any) => {
    m = text.match(/\d+/)[0];
    return "";
  });
  num = (newNum - num) / 1000;
  // console.log(newNum, num);
  function getHours() {
    if (/上午/.test(time)) {
      if (h === 12 || h < 5) {
        if (h === 12) {
          return "凌晨00:" + m;
        } else {
          return "凌晨0" + h.toString() + ":" + m;
        }
      } else if (h === 5) {
        return "清晨0" + h.toString() + ":" + m;
      } else if (h > 5 && h < 11) {
        // console.log(h);
        if (h === 10) {
          return "早上" + h.toString() + ":" + m;
        } else {
          return "早上0" + h.toString() + ":" + m;
        }
      } else if (h > 10 && h < 12) {
        return "中午" + h.toString() + ":" + m;
      }
    } else {
      if (h === 12 || h < 1) {
        if (h === 12) {
          return "中午" + h.toString() + ":" + m;
        } else {
          return "中午" + (h + 12).toString() + ":" + m;
        }
      } else if (h > 0 && h < 7) {
        return "下午" + (h + 12).toString() + ":" + m;
      } else if (h > 6 && h < 12) {
        return "晚上" + (h + 12).toString() + ":" + m;
      }
    }
  }
  if (num)
    if (getDays === day * 1) {
      return getHours();
    }
  if (getDays - day * 1 === 1) {
    return "昨天 " + getHours();
  } else if (getDays - day * 1 > 1 && getDays - day * 1 < day * 1) {
    // return '周' + week[getDays - day*1 + ""] + '&nbsp' + getHours();
  }
  if (year === newTime.match(/\d+/)[0]) {
    return mouth + "月" + day + "日 " + getHours();
  } else {
    return year + "年" + mouth + "月" + day + "日 " + getHours();
  }
}
