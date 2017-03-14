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

export default class InternalComponent {
    constructor(reactElement) {
        this._currentContainer = null;
        this._currentReactElement = reactElement;

        this._currentPublicComponentInstance = null;
        this._currentChildInternalComponentInstance = null;

        this._pendingState = [];
    }

    mount(container, preserveChildren, insertBefore) {
        const {type, props} = this._currentReactElement;
        this._currentContainer = container;

        const inst = this._currentPublicComponentInstance = initializePublicComponent(type, props);
        componentInstanceMap.set(inst, this);

        inst.props = props;
        inst.state = inst.state || {};
        this._prevState = inst.state;

        if (inst.componentWillMount) {
            inst.componentWillMount.call(inst);
        }
        if (this._nextState) {
            inst.state = this._nextState;
        }
        this._currentChildInternalComponentInstance = internalComponentFactory.createInternalComponent(inst.render());
        this._currentChildInternalComponentInstance.mount(container, preserveChildren, insertBefore);

        if (inst.componentDidMount) {
            inst.componentDidMount.call(inst);
        }
    }

    update(nextReactElement) {
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

        let shouldUpdate = currentInst.shouldComponentUpdate
            ? currentInst.shouldComponentUpdate.call(currentInst, nextProps, this._nextState)
            : true;
        if (shouldUpdate) {
            this._performUpdate(prevReactElement, nextReactElement);
        }
    }

    _performUpdate(prevReactElement, nextReactElement) {
        const nextProps = nextReactElement.props;
        const currentInst = this._currentPublicComponentInstance;
        let newChildReactElement;

        if (currentInst.componentWillUpdate) {
            currentInst.componentWillUpdate.call(currentInst, nextProps, this._nextState);
        }

        currentInst.state = this._nextState;
        currentInst.props = nextProps;
        newChildReactElement = currentInst.render();

        if (shouldUpdateInternalInstance(this._currentChildInternalComponentInstance._currentReactElement, newChildReactElement)) {
            this._currentChildInternalComponentInstance.update(newChildReactElement);
        } else {
            this._currentChildInternalComponentInstance.unmount();
            this._currentChildInternalComponentInstance = internalComponentFactory.createInternalComponent(newChildReactElement);
            this._currentChildInternalComponentInstance.mount(this._currentContainer);
        }

        if (currentInst.componentDidUpdate) {
            currentInst.componentDidUpdate.call(currentInst, prevReactElement.props, this._prevState);
        }
    }

    handleStateChange() {
        this._pendingState.forEach((partialState) => {
            this._nextState = Object.assign({}, this._currentPublicComponentInstance.state, partialState);
        });
        this._pendingState.length = 0;
        if (this._currentChildInternalComponentInstance) {
            this.update(this._currentReactElement);
        }
    }

    unmount() {
        if (this._currentPublicComponentInstance.componentWillUnmount) {
            this._currentPublicComponentInstance.componentWillUnmount.call(this._currentPublicComponentInstance);
        }

        this._currentChildInternalComponentInstance.unmount();
    }
}