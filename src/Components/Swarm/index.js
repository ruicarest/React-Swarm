import Swarm from "./Swarm";
import { connect } from "react-redux";
import {
  updateState,
  updateGroup,
  updateFieldInGroup
} from "../../Stores/swarmStore";

const mapStateToProps = state => {
  return {
    ...state
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateState: value => {
      dispatch(updateState(value));
    },
    updateGroup: (fieldId, newValue) => {
      dispatch(updateGroup(fieldId, newValue));
    },
    updateFieldInGroup: (groupID, value) => {
      dispatch(updateFieldInGroup(groupID, value));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Swarm);
