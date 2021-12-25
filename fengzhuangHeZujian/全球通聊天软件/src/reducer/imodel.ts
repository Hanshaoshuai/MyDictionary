const initialState = {
  data: 'reducer',
  list: [],
};

export const schedule = (
  state = initialState,
  action: { type: any; data: any }
) => {
  // debugger
  switch (action.type) {
    case 'SET_SCHEDULE':
      return {
        ...state,
        data: action.data.data || '',
        list: action.data.list || [],
      };
    default:
      return state;
  }
};
