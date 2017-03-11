import {reactComponentKey} from './reactComponentKey';
import BaseComponent from '../isomorphic/BaseComponent';

const PUBLIC_COMPONENT_TYPES = {
    PURE_FUNCTION: 'PURE_FUNCTION',
    IMPURE_CLASS: 'IMPURE_CLASS'
};

const RESERVED_PROPS = {
    children: true
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
        this._currentNode = null;
        this._currentReactElement = reactElement;
        this._currentPublicComponentInstance = null;
        this._currentChildInternalComponentInstance = null;
        this._currentChildInternalComponentInstances = null;
        this._currentComponentType = null;
    }

    mount(container, append) {
        this._currentContainer = container;

        const {type, props} = this._currentReactElement;

        if (container.lastChild && !append) {
            while (container.lastChild) {
                container.removeChild(container.lastChild);
            }
        }

        let node = null;
        if (typeof type === 'string') {
            node = document.createElement(type);
            this._currentPublicComponentInstance = null;
            this._currentChildInternalComponentInstance = null;

            if (props && props.children) {
                const {children} = props;
                if (typeof children === 'string') {
                    node.textContent = children;
                } else {
                    this._currentChildInternalComponentInstances = (Array.isArray(children) ? children : [children]).map((childReactElement) => new InternalComponent(childReactElement));
                    this._currentChildInternalComponentInstances.forEach((childInternalComponentInstance) => {
                        childInternalComponentInstance.mount(node, true);
                    });
                }
            }
        } else if (typeof type === 'function') {
            this._currentNode = null;

            if (type.prototype instanceof BaseComponent) {
                this._currentPublicComponentInstance = new type(props);
                this._currentChildInternalComponentInstance = new InternalComponent(this._currentPublicComponentInstance.render());
                this._currentComponentType = PUBLIC_COMPONENT_TYPES.IMPURE_CLASS;
            } else {
                this._currentChildInternalComponentInstance = new InternalComponent(type(props));
                this._currentComponentType = PUBLIC_COMPONENT_TYPES.PURE_FUNCTION;
            }
        }

        if (node) {
            for (let propName in props) {
                if (props.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                    node[propName] = props[propName];
                }
            }

            this._currentNode = node;
            container.appendChild(node);
        } else if (this._currentChildInternalComponentInstance) {
            this._currentChildInternalComponentInstance.mount(container);
        }

        if (this._isRoot) {
            linkHostNodeToComponent(this, this);
        }
    }

    update(newReactElement) {
        const {type, props} = newReactElement;

        if (type !== this._currentReactElement.type) {
            this._currentReactElement = newReactElement;
            this.mount(this._currentContainer);
        }

        if (this._currentNode) {
            for (let propName in props) {
                if (props.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                    this._currentNode[propName] = props[propName];
                }
            }

            if (props && props.children) {
                const {children} = props;
                if (typeof children === 'string') {
                    this._currentNode.textContent = children;
                } else {
                    const childReactElements = Array.isArray(children) ? children : [children];
                    this._currentChildInternalComponentInstances.forEach((childInternalComponentInstance, i) => {
                        childInternalComponentInstance.update(childReactElements[i]);
                    });
                }
            }
        } else if (this._currentChildInternalComponentInstance) {
            let newChildReactElement;

            if (this._currentComponentType === PUBLIC_COMPONENT_TYPES.PURE_FUNCTION) {
                newChildReactElement = type(props);
            } else if (this._currentComponentType === PUBLIC_COMPONENT_TYPES.IMPURE_CLASS) {
                this._currentPublicComponentInstance.props = props;
                newChildReactElement = this._currentPublicComponentInstance.render();
            }

            this._currentChildInternalComponentInstance.update(newChildReactElement);
        }
    }
}