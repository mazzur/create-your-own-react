import componentInstanceMap from './componentInstanceMap';

export default class BaseComponent {
    constructor(props) {
        this.props = props;
    }

    setState(newState) {
        const internalInstance = componentInstanceMap.get(this);
        internalInstance._pendingState.push(newState);
        internalInstance.handleStateChange();
    }
}