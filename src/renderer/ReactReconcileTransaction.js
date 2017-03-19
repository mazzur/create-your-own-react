import Transaction from './Transaction';

function ReactReconcileTransaction() {
    this.reinitializeTransaction();
}

const ON_DOM_READY_QUEUEING = {
    initialize() {
        this._reactMountReady.reset();
    },
    close() {
        this._reactMountReady.notifyAll();
    }
};

Object.assign(
    ReactReconcileTransaction.prototype,
    Transaction,
    {
        getWrappers() {
            return [ON_DOM_READY_QUEUEING];
        },
        _reactMountReady: {
            enqueue(cb, context, ...args) {
                this._queue.push({cb, context, args});
            },
            notifyAll() {
                this._queue.forEach(({cb, context, args}) => cb.call(context, ...args));
            },
            reset() {
                this._queue = [];
            }
        },
        getReactMountReady() {
            return this._reactMountReady;
        }
    }
);

export default ReactReconcileTransaction;