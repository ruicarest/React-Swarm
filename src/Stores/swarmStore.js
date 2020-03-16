import { initialState } from "./initialState";

// Actions
const INIT = "INIT";
const UPDATE_FIELD = "UPDATE_FIELD";

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
    default:
      return state;
  }
}

// Action Creators
export function init() {
  return { type: INIT };
}
export function updateField(fieldId, value) {
  return { type: UPDATE_FIELD, payload: { field: fieldId, value } };
}
