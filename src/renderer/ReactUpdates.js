import ReactBatchingStrategy from './ReactBatchingStrategy';
import Transaction from './Transaction';
import ReactReconcileTransaction from './ReactReconcileTransaction';

function ReactUpdatesTransaction() {
    this.reinitializeTransaction();
}

const NESTED_UPDATES = {
    initialize() {
        this.dirtyComponentsLength = ReactUpdates.dirtyComponents.length;
    },
    close() {
        if (this.dirtyComponentsLength < ReactUpdates.dirtyComponents.length) {
            ReactUpdates.dirtyComponents.splice(0, this.dirtyComponentsLength);
            ReactUpdates.flushUpdates();
        } else {
            ReactUpdates.dirtyComponents.length = 0;
        }
    }
};

Object.assign(
    ReactUpdatesTransaction.prototype,
    Transaction,
    {
        getWrappers() {
            return [NESTED_UPDATES];
        }
    }
);

const reactUpdatesTransaction = new ReactUpdatesTransaction();

let callbacks;
const ReactUpdates = {
    dirtyComponents: [],

    enqueueUpdate(internalInstance) {
        if (ReactBatchingStrategy.batchingStrategyTransaction.alreadyBatching) {
            ReactUpdates.dirtyComponents.push(internalInstance);
            callbacks = internalInstance._pendingCallbacks;
        } else {
            ReactBatchingStrategy.batchedUpdates(ReactUpdates.enqueueUpdate, internalInstance);
        }
    },

    flushUpdates() {
        reactUpdatesTransaction.perform(runBatchedUpdatesInReconcileTransaction);

        function runBatchedUpdatesInReconcileTransaction() {
            const reactReconcileTransaction = new ReactReconcileTransaction();
            reactReconcileTransaction.perform(ReactUpdates._runBatchUpdates, null, reactReconcileTransaction);
        }
    },

    _runBatchUpdates(reactReconcileTransaction) {
        const length = ReactUpdates.dirtyComponents.length;
        ReactUpdates.dirtyComponents.sort((a, b) => a._mountOrder - b._mountOrder);
        for (let i = 0; i < length; i++) {
            const internalInstance = ReactUpdates.dirtyComponents[i];
            internalInstance.updateIfNecessary(reactReconcileTransaction);
        }
    },

    batchedUpdates(callback, ...args) {
        ReactBatchingStrategy.batchedUpdates(callback, ...args);
    }
};

export default ReactUpdates;