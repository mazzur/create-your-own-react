import HostInternalComponent from './HostInternalComponent';
import CompositeInternalComponent from './CompositeInternalComponent';

const internalComponentFactory = {
    createInternalComponent(reactElement, isRoot) {
        if (typeof reactElement.type === 'string') {
            return new HostInternalComponent(reactElement, isRoot);
        } else if (typeof reactElement.type === 'function') {
            return new CompositeInternalComponent(reactElement, isRoot);
        }
    }
};

export default internalComponentFactory;