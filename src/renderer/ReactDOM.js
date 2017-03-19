import {reactComponentKey} from './reactComponentKey';
import internalComponentFactory from './internalComponentFactory';
import shouldUpdateInternalInstance from './shouldUpdateInternalInstance';
import ReactBatchingStrategy from './ReactBatchingStrategy';
import ReactReconcileTransaction from './ReactReconcileTransaction';

function getMountedRootComponent(container) {
    return container[reactComponentKey];
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
                const reactReconcileTransaction = new ReactReconcileTransaction();
                reactReconcileTransaction.perform(mountedRootInternalComponent.update.bind(mountedRootInternalComponent), null, reactReconcileTransaction, reactElement);
                return getPublicInstance(mountedRootInternalComponent);
            } else {
                mountedRootInternalComponent.unmount();
            }
        }

        const rootInternalComponent = internalComponentFactory.createInternalComponent(reactElement);
        ReactBatchingStrategy.batchedUpdates(batchedMountComponent);
        container[reactComponentKey] = rootInternalComponent;

        return getPublicInstance(rootInternalComponent);

        function batchedMountComponent() {
            const reactReconcileTransaction = new ReactReconcileTransaction();
            reactReconcileTransaction.perform(rootInternalComponent.mount.bind(rootInternalComponent), null, reactReconcileTransaction, container);
        }
    }
};

export default ReactDOM;