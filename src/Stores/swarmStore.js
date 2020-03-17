import { initialState } from "./initialState";

// Actions
const INIT = "INIT";
const UPDATE_FIELD = "UPDATE_FIELD";
const UPDATE_FIELD_IN_GROUP = "UPDATE_FIELD_IN_GROUP";

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case INIT: {
      console.log("INIT");
      return newState;
    }
    case UPDATE_FIELD: {
      const fieldIdToUpdate = action.payload.field;
      const fieldValueToUpdate = action.payload.value;
      const newState = {
        ...state,
        [fieldIdToUpdate]: fieldValueToUpdate
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
export function init() {
  return { type: INIT };
}
export function updateField(fieldID, value) {
  return { type: UPDATE_FIELD, payload: { field: fieldID, value } };
}
export function updateFieldInGroup(groupID, fieldID, value) {
  return {
    type: UPDATE_FIELD_IN_GROUP,
    payload: { group: groupID, field: fieldID, value }
  };
}
