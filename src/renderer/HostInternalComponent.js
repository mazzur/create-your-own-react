import {reactComponentKey} from './reactComponentKey';
import internalComponentFactory from './internalComponentFactory';

const RESERVED_PROPS = {
    children: true
};

export default class HostInternalComponent {
    constructor(reactElement, isRoot) {
        this._isRoot = isRoot;
        this._currentContainer = null;
        this._currentReactElement = reactElement;

        this._currentNode = null;
    }

    mount(container, preserveChildren, insertBefore) {
        const {type, props} = this._currentReactElement;
        if (container.lastChild && !preserveChildren) {
            while (container.lastChild) {
                container.removeChild(container.lastChild);
            }
        }

        this._currentContainer = container;
        this._currentNode = document.createElement(type);

        if (props.children) {
            this._mountChildren(props.children);
        }
        this._applyPropsToCurrentNode(props);
        this._insertNodeIntoContainer(container, insertBefore);

        if (this._isRoot) {
            this._currentNode[reactComponentKey] = this;
        }
    }

    update(newReactElement) {
        const {props} = newReactElement;
        this._applyPropsToCurrentNode(props);
        if (props.children) {
            this._updateChildInstances(props.children);
        }
    }

    _mountChildren(children) {
        if (typeof children === 'string') {
            this._currentNode.textContent = children;
        } else {
            this._currentChildInternalComponentInstances = (Array.isArray(children) ? children : [children])
                .map((childReactElement) => internalComponentFactory.createInternalComponent(childReactElement));
            this._currentChildInternalComponentInstances.forEach((childInternalComponentInstance) => {
                childInternalComponentInstance.mount(this._currentNode, true);
            });
        }
    }

    _insertNodeIntoContainer(insertBefore) {
        const currentNode = this._currentNode;
        const container = this._currentContainer;
        if (insertBefore) {
            container.insertBefore(currentNode, container.children[insertBefore]);
        } else {
            container.appendChild(currentNode);
        }
    }

    _applyPropsToCurrentNode(props) {
        for (let propName in props) {
            if (props.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                this._currentNode[propName] = props[propName];
            }
        }
    }

    _updateChildInstances(children) {
        if (typeof children === 'string') {
            this._currentNode.textContent = children;
        } else {
            const childReactElements = Array.isArray(children) ? children : [children];
            this._currentChildInternalComponentInstances.forEach((childInternalComponentInstance, i) => {
                const childReactElement = childReactElements[i];
                if (childInternalComponentInstance._currentReactElement.type === childReactElement.type) {
                    childInternalComponentInstance.update(childReactElement);
                } else {
                    const currentChildInternalInstance = this._currentChildInternalComponentInstances[i] = internalComponentFactory.createInternalComponent(childReactElement);
                    currentChildInternalInstance.mount(this._currentNode, true, i);
                }
            });
        }
    }
}