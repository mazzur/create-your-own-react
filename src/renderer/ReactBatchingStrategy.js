import ReactUpdates from './ReactUpdates';
import Transaction from './Transaction';

function BatchingStrategyTransaction() {
    this.reinitializeTransaction();
}

const FLUSH_BATCHED_UPDATES = {
    close() {
        ReactUpdates.flushUpdates();
    }
};

const RESET_BATCHED_UPDATES = {
    initialize() {
        this.alreadyBatching = true;
    },
    close() {
        this.alreadyBatching = false;
    }
};

Object.assign(
    BatchingStrategyTransaction.prototype,
    Transaction,
    {
        getWrappers() {
            return [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];
        }
    }
);

const batchingStrategyTransaction = new BatchingStrategyTransaction();

const ReactBatchingStrategy = {
    batchingStrategyTransaction,
    batchedUpdates(callback, ...args) {
        batchingStrategyTransaction.perform(callback, null, ...args);
    }
};

export default ReactBatchingStrategy;