import Swarm from "./Swarm";
import { connect } from "react-redux";
import { init, updateField } from "../../Stores/swarmStore";

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
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Swarm);
