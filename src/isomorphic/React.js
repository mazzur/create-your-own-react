import BaseComponent from './BaseComponent';

const React = {
    createElement(type, config, ...children) {
        const props = Object.assign({}, config);

        if (children && children.length) {
            props.children = children.length === 1 ? children[0] : children;
        }

        return {
            type,
            props
        }
    },

    Component: BaseComponent
};

export default React;