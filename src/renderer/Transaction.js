const Transaction = {
    wrappers: [],

    reinitializeTransaction() {
        if (this.getWrappers) {
            this.wrappers = this.getWrappers();
        }
    },

    initializeAll() {
        this.wrappers.forEach((wrapper) => {
            if (wrapper.initialize) {
                wrapper.initialize.call(this);
            }
        });
    },

    perform(method, context, ...args) {
        this.initializeAll();
        method.call(context, ...args);
        this.closeAll();
    },

    closeAll() {
        this.wrappers.forEach((wrapper) => {
            if (wrapper.close) {
                wrapper.close.call(this);
            }
        });
    }
};

export default Transaction;