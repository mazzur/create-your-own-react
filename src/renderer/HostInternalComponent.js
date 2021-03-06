import internalComponentFactory from './internalComponentFactory';
import shouldUpdateInternalInstance from './shouldUpdateInternalInstance';

const RESERVED_PROPS = {
    children: true,
    ref: true
};

export default class HostInternalComponent {
    constructor(reactElement) {
        this._currentContainer = null;
        this._currentReactElement = reactElement;

        this._currentNode = null;
    }

    mount(reactReconcileTransaction, container, preserveChildren, insertBefore) {
        const {type, props} = this._currentReactElement;
        if (container.lastChild && !preserveChildren) {
            while (container.lastChild) {
                container.removeChild(container.lastChild);
            }
        }

        this._currentContainer = container;
        this._currentNode = document.createElement(type);

        if (props.children) {
            this._mountChildren(reactReconcileTransaction, props.children);
        }
        this._applyPropsToCurrentNode(props);
        this._insertNodeIntoContainer(insertBefore);
        const ref = this._currentReactElement.props.ref;
        if (ref) {
            ref(this._currentNode);
        }
    }

    update(reactReconcileTransaction, newReactElement) {
        const {props} = newReactElement;
        this._applyPropsToCurrentNode(props);
        if (props.children) {
            this._updateChildInstances(reactReconcileTransaction, props.children);
        }
    }

    unmount() {
        this._currentNode.remove();
    }

    _mountChildren(reactReconcileTransaction, children) {
        if (typeof children === 'string' || typeof children === 'number') {
            this._currentNode.textContent = children;
        } else {
            this._currentChildInternalComponentInstances = (Array.isArray(children) ? children : [children])
                .map((childReactElement) => internalComponentFactory.createInternalComponent(childReactElement));
            this._currentChildInternalComponentInstances.forEach((childInternalComponentInstance) => {
                childInternalComponentInstance.mount(reactReconcileTransaction, this._currentNode, true);
            });
        }
    }

    _insertNodeIntoContainer(insertBefore) {
        const currentNode = this._currentNode;
        const container = this._currentContainer;
        if (insertBefore !== undefined) {
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

    _updateChildInstances(reactReconcileTransaction, children) {
        if (typeof children === 'string' || typeof children === 'number') {
            this._currentNode.textContent = children;
        } else {
            const childReactElements = Array.isArray(children) ? children : [children];
            this._currentChildInternalComponentInstances.forEach((childInternalComponentInstance, i) => {
                const childReactElement = childReactElements[i];
                if (shouldUpdateInternalInstance(childInternalComponentInstance._currentReactElement, childReactElement)) {
                    childInternalComponentInstance.update(reactReconcileTransaction, childReactElement);
                } else {
                    this._currentChildInternalComponentInstances[i].unmount();
                    const currentChildInternalInstance = this._currentChildInternalComponentInstances[i] = internalComponentFactory.createInternalComponent(childReactElement);
                    currentChildInternalInstance.mount(reactReconcileTransaction, this._currentNode, true, i);
                }
            });
        }
    }
}