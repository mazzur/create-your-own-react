import {reactComponentKey} from './reactComponentKey';
import BaseComponent from '../isomorphic/BaseComponent';
import internalComponentFactory from './internalComponentFactory';
import shouldUpdateInternalInstance from './shouldUpdateInternalInstance';

const PUBLIC_COMPONENT_TYPES = {
    PURE_FUNCTION: 'PURE_FUNCTION',
    IMPURE_CLASS: 'IMPURE_CLASS'
};

function linkHostNodeToComponent(internalInstance, rootInternalInstance) {
    if (internalInstance._currentNode) {
        internalInstance._currentNode[reactComponentKey] = rootInternalInstance;
    } else {
        linkHostNodeToComponent(internalInstance._currentChildInternalComponentInstance, rootInternalInstance);
    }
}

export default class InternalComponent {
    constructor(reactElement, isRoot) {
        this._isRoot = isRoot;
        this._currentContainer = null;
        this._currentReactElement = reactElement;

        this._currentPublicComponentInstance = null;
        this._currentChildInternalComponentInstance = null;
        this._currentComponentType = null;
    }

    mount(container, preserveChildren, insertBefore) {
        const {type, props} = this._currentReactElement;
        this._currentContainer = container;

        if (type.prototype instanceof BaseComponent) {
            this._currentPublicComponentInstance = new type(props);
            const componentWIllMountHook = this._currentPublicComponentInstance.componentWillMount;
            if (componentWIllMountHook) {
                componentWIllMountHook();
            }
            this._currentChildInternalComponentInstance = internalComponentFactory.createInternalComponent(this._currentPublicComponentInstance.render());
            this._currentComponentType = PUBLIC_COMPONENT_TYPES.IMPURE_CLASS;
        } else {
            this._currentChildInternalComponentInstance = internalComponentFactory.createInternalComponent(type(props));
            this._currentComponentType = PUBLIC_COMPONENT_TYPES.PURE_FUNCTION;
        }

        this._currentChildInternalComponentInstance.mount(container, preserveChildren, insertBefore);

        if (this._isRoot) {
            linkHostNodeToComponent(this, this);
        }

        if (this._currentPublicComponentInstance && this._currentPublicComponentInstance.componentDidMount) {
            this._currentPublicComponentInstance.componentDidMount();
        }
    }

    update(newReactElement) {
        const {type, props} = newReactElement;
        let newChildReactElement;

        if (this._currentComponentType === PUBLIC_COMPONENT_TYPES.PURE_FUNCTION) {
            newChildReactElement = type(props);
        } else if (this._currentComponentType === PUBLIC_COMPONENT_TYPES.IMPURE_CLASS) {
            this._currentPublicComponentInstance.props = props;
            newChildReactElement = this._currentPublicComponentInstance.render();
        }

        if (shouldUpdateInternalInstance(this._currentChildInternalComponentInstance._currentReactElement, newChildReactElement)) {
            this._currentChildInternalComponentInstance.update(newChildReactElement);
        } else {
            this._currentChildInternalComponentInstance.unmount();
            this._currentChildInternalComponentInstance = internalComponentFactory.createInternalComponent(newChildReactElement);
            this._currentChildInternalComponentInstance.mount(this._currentContainer);
        }
    }

    unmount() {
        const willUnmountHook = this._currentPublicComponentInstance && this._currentPublicComponentInstance.componentWillUnmount;

        if (willUnmountHook) {
            willUnmountHook();
        }

        this._currentChildInternalComponentInstance.unmount();
    }
}