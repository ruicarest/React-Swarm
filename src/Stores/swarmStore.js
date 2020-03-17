import { initialState } from "./initialState";

// Actions
const UPDATE_STATE = "UPDATE_STATE";
const UPDATE_GROUP = "UPDATE_GROUP";
const UPDATE_FIELD_IN_GROUP = "UPDATE_FIELD_IN_GROUP";

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case UPDATE_STATE: {
      const value = action.payload.value;
      const newState = {
        ...state,
        value
      };
      return newState;
    }
    case UPDATE_GROUP: {
      const group = action.payload.group;
      const value = action.payload.value;
      const newState = {
        ...state,
        [group]: value
      };
      return newState;
    }
    case UPDATE_FIELD_IN_GROUP: {
      const group = action.payload.group;
      const field = action.payload.field;
      const value = action.payload.value;
      const newState = {
        ...state,
        [group]: {
          ...state[group],
          [field]: value
        }
      };
      return newState;
    }
    default:
      return state;
  }
}

// Action Creators
export function updateState(value) {
  return { type: UPDATE_STATE, payload: { value } };
}
export function updateGroup(groupID, value) {
  return { type: UPDATE_GROUP, payload: { group: groupID, value } };
}
export function updateFieldInGroup(groupID, fieldID, value) {
  return {
    type: UPDATE_FIELD_IN_GROUP,
    payload: { group: groupID, field: fieldID, value }
  };
}
