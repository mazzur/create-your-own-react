import {reactComponentKey} from './reactComponentKey';
import internalComponentFactory from './internalComponentFactory';
import shouldUpdateInternalInstance from './shouldUpdateInternalInstance';

function getMountedRootComponent(container) {
    return container.firstChild && container.firstChild[reactComponentKey];
}

function getPublicInstance(internalComponent) {
    return internalComponent._currentPublicComponentInstance
        || internalComponent._currentNode
        || null
}

const ReactDOM = {
    render(reactElement, container) {
        const mountedRootInternalComponent = getMountedRootComponent(container);
        if (mountedRootInternalComponent) {
            const currentRootReactElement = mountedRootInternalComponent._currentReactElement;
            if (currentRootReactElement === reactElement) {
                return;
            }

            if (shouldUpdateInternalInstance(currentRootReactElement, reactElement)) {
                mountedRootInternalComponent.update(reactElement);
                return getPublicInstance(mountedRootInternalComponent);
            } else {
                mountedRootInternalComponent.unmount();
            }
        }

        const rootInternalComponent = internalComponentFactory.createInternalComponent(reactElement, true);
        rootInternalComponent.mount(container);

        return getPublicInstance(rootInternalComponent);
    }
};

export default ReactDOM;