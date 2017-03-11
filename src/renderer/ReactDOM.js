import BaseComponent from '../isomorphic/BaseComponent';

const RESERVED_PROPS = {
    children: true
};

function createTreeFromReactElement(reactElement) {
    const {type, props} = reactElement;
    let rootElement;

    if (typeof type === 'string') {
        rootElement = document.createElement(type);
    } else if (typeof type === 'function') {
        if (type.prototype instanceof BaseComponent) {
            const publicComponentInstance = new type(props);
            rootElement = createTreeFromReactElement(publicComponentInstance.render());
        } else {
            rootElement = createTreeFromReactElement(type(props));
        }
    }

    if (props.children) {
        if (typeof props.children === 'string') {
            rootElement.textContent = props.children;
        } else {
            props.children.forEach((childReactElement) => {
                const childNode = createTreeFromReactElement(childReactElement);
                rootElement.appendChild(childNode);
            });
        }
    }

    for (let propName in props) {
        if (props.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
            rootElement[propName] = props[propName];
        }
    }

    return rootElement;
}

const ReactDOM = {
    render(reactElement, container) {
        const DOMTree = createTreeFromReactElement(reactElement);
        if (container.lastChild) {
            while (container.lastChild) {
                container.removeChild(container.lastChild);
            }
        }

        container.appendChild(DOMTree);
    }
};

export default ReactDOM;