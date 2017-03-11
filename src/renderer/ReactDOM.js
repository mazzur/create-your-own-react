import {reactComponentKey} from './reactComponentKey';
import internalComponentFactory from './internalComponentFactory';

function getMountedRootComponent(container) {
    return container.firstChild && container.firstChild[reactComponentKey];
}

const ReactDOM = {
    render(reactElement, container) {
        const mountedRootInternalComponent = getMountedRootComponent(container);
        if (mountedRootInternalComponent) {
            const currentRootReactElement = mountedRootInternalComponent._currentReactElement;
            if (currentRootReactElement === reactElement) {
                return;
            }

            if (currentRootReactElement.type === reactElement.type) {
                mountedRootInternalComponent.update(reactElement);
                return;
            }
        }

        const rootInternalComponent = internalComponentFactory.createInternalComponent(reactElement, true);
        rootInternalComponent.mount(container);
    }
};

export default ReactDOM;