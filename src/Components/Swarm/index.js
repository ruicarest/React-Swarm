import Swarm from "./Swarm";
import { connect } from "react-redux";
import { init, updateField, updateFieldInGroup } from "../../Stores/swarmStore";

const mapStateToProps = state => {
  return {
    ...state
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    init: () => {
      dispatch(init());
    },
    updateField: (fieldId, newValue) => {
      dispatch(updateField(fieldId, newValue));
    },
    updateFieldInGroup: (groupID, fieldID, value) => {
      dispatch(updateFieldInGroup(groupID, fieldID, value));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Swarm);
