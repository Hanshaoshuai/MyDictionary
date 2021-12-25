import { request } from '../services/request';

import { API_HOST } from './ip';

// 获取所有人员列表
export async function getList(data: any) {
  try {
    const res: any = await request(`${API_HOST}/get2`, 'GET', data);
    return res;
  } catch (error) {
    return error;
  }
}
// 获取所有好友列表
export async function getBuddyList(data: any) {
  try {
    const res: any = await request(`${API_HOST}/get3`, 'GET', data);
    return res;
  } catch (error) {
    return error;
  }
}

// 获取头像
export async function getImage(data: any) {
  try {
    const res: any = await request(`${API_HOST}/get`, 'GET', data);
    return res;
  } catch (error) {
    return error;
  }
}

//修改个人资料
export async function myRemarks(data: any) {
  try {
    const res: any = await request(`${API_HOST}/myRemarks`, 'POST', data);
    return res;
  } catch (error) {
    return error;
  }
}
//消息清零
export async function messageClear(data: any) {
  try {
    const res: any = await request(`${API_HOST}/post6`, 'POST', data);
    return res;
  } catch (error) {
    return error;
  }
}

//消息请求
export async function requestMessage(data: any) {
  try {
    const res: any = await request(`${API_HOST}/get1`, 'GET', data);
    return res;
  } catch (error) {
    return error;
  }
}

// 添加好友
export async function addFriend(data: any) {
  try {
    const res: any = await request(`${API_HOST}/post4`, 'POST', data);
    return res;
  } catch (error) {
    return error;
  }
}

// 同意或拒绝添加好友
export async function requestResponse(data: any) {
  try {
    const res: any = await request(`${API_HOST}/post5`, 'POST', data);
    return res;
  } catch (error) {
    return error;
  }
}

// 资料详情
export async function informationDetails(data: any) {
  try {
    const res: any = await request(`${API_HOST}/remarks1`, 'POST', data);
    return res;
  } catch (error) {
    return error;
  }
}

// 添加备注
export async function addNotes(data: any) {
  try {
    const res: any = await request(`${API_HOST}/remarks`, 'POST', data);
    return res;
  } catch (error) {
    return error;
  }
}

// 移除好友
export async function removeFriend(data: any) {
  try {
    const res: any = await request(`${API_HOST}/post4_1`, 'POST', data);
    return res;
  } catch (error) {
    return error;
  }
}

// 建群
export async function buildGroup(data: any) {
  try {
    const res: any = await request(`${API_HOST}/buildingGroup`, 'POST', data);
    return res;
  } catch (error) {
    return error;
  }
}

// 群成员添加
export async function addBuildingGroup(data: any) {
  try {
    const res: any = await request(
      `${API_HOST}/buildingGroup_add`,
      'POST',
      data
    );
    return res;
  } catch (error) {
    return error;
  }
}

// 移除某群
export async function buildingGroupMove(data: any) {
  try {
    const res: any = await request(
      `${API_HOST}/buildingGroup_move`,
      'POST',
      data
    );
    return res;
  } catch (error) {
    return error;
  }
}

//注销
export async function logout(data: any) {
  try {
    const res: any = await request(`${API_HOST}/post2`, 'POST', data);
    return res;
  } catch (error) {
    return error;
  }
}
// 退出登录
export async function signOut(data: any) {
  try {
    const res: any = await request(`${API_HOST}/post3`, 'POST', data);
    return res;
  } catch (error) {
    return error;
  }
}

// 远端请求 开始呼叫
export async function remo(data: any) {
  try {
    const res: any = await request(`${API_HOST}/data/remo`, 'GET', data);
    return res;
  } catch (error) {
    return error;
  }
}

// 调用视频方法
export async function local(data: any) {
  try {
    const res: any = await request(`${API_HOST}/data/local`, 'POST', data);
    return res;
  } catch (error) {
    return error;
  }
}
