import BaseComponent from '../isomorphic/BaseComponent';
import internalComponentFactory from './internalComponentFactory';
import shouldUpdateInternalInstance from './shouldUpdateInternalInstance';
import componentInstanceMap from '../isomorphic/componentInstanceMap';

function StatelessComponent(Component) {
}

StatelessComponent.prototype.render = function () {
    const Component = componentInstanceMap.get(this)._currentReactElement.type;
    return Component(this.props);
};

function initializePublicComponent(type, props) {
    if (type.prototype instanceof BaseComponent) {
        return new type(props);
    } else {
        return new StatelessComponent(type);
    }
}

let nextMountID = 1;

export default class InternalComponent {
    constructor(reactElement) {
        this._currentContainer = null;
        this._currentReactElement = reactElement;

        this._currentPublicComponentInstance = null;
        this._currentChildInternalComponentInstance = null;

        this._pendingState = [];
        this._pendingCallbacks = [];
        // used to sort dirty components from up to bottom in order to optimise their update
        this._mountOrder = 0;
    }

    mount(reactReconcileTransaction, container, preserveChildren, insertBefore) {
        const {type, props} = this._currentReactElement;
        this._currentContainer = container;
        this._mountOrder = nextMountID++;

        const inst = this._currentPublicComponentInstance = initializePublicComponent(type, props);
        componentInstanceMap.set(inst, this);

        inst.props = props;
        inst.state = inst.state || {};
        this._prevState = inst.state;

        if (inst.componentWillMount) {
            inst.componentWillMount.call(inst);
            if (this._pendingState.length) {
                inst.state = this._processPendingState(inst.state);
                this._pendingState.length = 0;
            }
        }
        if (this._nextState) {
            inst.state = this._nextState;
        }
        const childReactElement = inst.render();
        this._currentChildInternalComponentInstance = internalComponentFactory.createInternalComponent(childReactElement);
        this._currentChildInternalComponentInstance.mount(reactReconcileTransaction, container, preserveChildren, insertBefore);

        if (inst.componentDidMount) {
            reactReconcileTransaction.getReactMountReady().enqueue(
                inst.componentDidMount,
                inst
            );
        }
        const ref = this._currentReactElement.props.ref;
        if (ref) {
            ref(this._currentPublicComponentInstance);
        }

        this._enqueueCallbacks(reactReconcileTransaction);
    }

    update(reactReconcileTransaction, nextReactElement) {
        const prevReactElement = this._currentReactElement;
        const nextProps = nextReactElement.props;
        const currentInst = this._currentPublicComponentInstance;
        this._prevState = currentInst.state;
        this._nextState = this._nextState || currentInst.state;

        const willReceive = nextReactElement !== prevReactElement;
        if (willReceive) {
            if (currentInst.componentWillReceiveProps) {
                currentInst.componentWillReceiveProps.call(currentInst, nextProps);
            }
        }

        if (this._pendingState.length) {
            this._nextState = this._processPendingState(this._currentPublicComponentInstance.state);
        }

        let shouldUpdate = currentInst.shouldComponentUpdate
            ? currentInst.shouldComponentUpdate.call(currentInst, nextProps, this._nextState)
            : true;
        if (shouldUpdate) {
            this._performUpdate(reactReconcileTransaction, prevReactElement, nextReactElement);
        }
    }

    updateIfNecessary(reactReconcileTransaction) {
        if (this._pendingState.length) {
            this._nextState = this._processPendingState();
            if (this._currentChildInternalComponentInstance) {
                this.update(reactReconcileTransaction, this._currentReactElement);
            }
        }
    }

    _enqueueCallbacks(reactReconcileTransaction) {
        if (this._pendingCallbacks.length) {
            const length = this._pendingCallbacks.length;
            for (let i = 0; i < length; i++) {
                reactReconcileTransaction.getReactMountReady().enqueue(
                    this._pendingCallbacks[i],
                    this._currentPublicComponentInstance
                );
            }
            this._pendingCallbacks.length = 0;
        }
    }

    _processPendingState(instState) {
        const pendingState = [].concat(this._pendingState);
        this._pendingState.length = 0;
        return pendingState.reduce((newState, partialState) => {
             return Object.assign({}, newState, partialState);
        }, instState);
    }

    _performUpdate(reactReconcileTransaction, prevReactElement, nextReactElement) {
        const nextProps = nextReactElement.props;
        const currentInst = this._currentPublicComponentInstance;
        let newChildReactElement;

        if (currentInst.componentWillUpdate) {
            currentInst.componentWillUpdate.call(currentInst, nextProps, this._nextState);
        }

        this._currentReactElement = nextReactElement;
        currentInst.state = this._nextState;
        currentInst.props = nextProps;
        newChildReactElement = currentInst.render();

        if (shouldUpdateInternalInstance(this._currentChildInternalComponentInstance._currentReactElement, newChildReactElement)) {
            this._currentChildInternalComponentInstance.update(reactReconcileTransaction, newChildReactElement);
        } else {
            this._currentChildInternalComponentInstance.unmount();
            this._currentChildInternalComponentInstance = internalComponentFactory.createInternalComponent(newChildReactElement);
            this._currentChildInternalComponentInstance.mount(reactReconcileTransaction, this._currentContainer);
        }

        if (currentInst.componentDidUpdate) {
            reactReconcileTransaction.getReactMountReady().enqueue(
                currentInst.componentDidUpdate,
                currentInst,
                prevReactElement.props,
                this._prevState
            );
        }
        this._enqueueCallbacks(reactReconcileTransaction);
    }

    unmount() {
        if (this._currentPublicComponentInstance.componentWillUnmount) {
            this._currentPublicComponentInstance.componentWillUnmount.call(this._currentPublicComponentInstance);
        }

        this._currentChildInternalComponentInstance.unmount();
    }
}