import componentInstanceMap from './componentInstanceMap';
import ReactUpdates from '../renderer/ReactUpdates';

export default class BaseComponent {
    constructor(props) {
        this.props = props;
    }

    setState(newState, callback) {
        const internalInstance = componentInstanceMap.get(this);
        internalInstance._pendingState.push(newState);
        if (callback) {
            internalInstance._pendingCallbacks.push(callback);
        }
        ReactUpdates.enqueueUpdate(internalInstance);
    }
}