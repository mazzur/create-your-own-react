import React from '../../../isomorphic/React';
import ReactDOM from '../../ReactDOM';

describe('ReactMount', () => {
    it('should render different components in same root', () => {
        var container = document.createElement('container');

        ReactDOM.render(<div />, container);
        expect(container.firstChild.nodeName).toBe('DIV');

        ReactDOM.render(<span />, container);
        expect(container.firstChild.nodeName).toBe('SPAN');
    });

    it('should unmount and remount if the key changes', () => {
        var container = document.createElement('container');

        var mockMount = jest.fn();
        var mockUnmount = jest.fn();

        class Component extends React.Component {
            componentDidMount() {
                return mockMount();
            }

            componentWillUnmount() {
                return mockUnmount();
            }

            render() {
                return <span>{this.props.text}</span>;
            }
        }

        expect(mockMount.mock.calls.length).toBe(0);
        expect(mockUnmount.mock.calls.length).toBe(0);

        ReactDOM.render(<Component text="orange" key="A" />, container);
        expect(container.firstChild.innerHTML).toBe('orange');
        expect(mockMount.mock.calls.length).toBe(1);
        expect(mockUnmount.mock.calls.length).toBe(0);

        // If we change the key, the component is unmounted and remounted
        ReactDOM.render(<Component text="green" key="B" />, container);
        expect(container.firstChild.innerHTML).toBe('green');
        expect(mockMount.mock.calls.length).toBe(2);
        expect(mockUnmount.mock.calls.length).toBe(1);

        // But if we don't change the key, the component instance is reused
        ReactDOM.render(<Component text="blue" key="B" />, container);
        expect(container.firstChild.innerHTML).toBe('blue');
        expect(mockMount.mock.calls.length).toBe(2);
        expect(mockUnmount.mock.calls.length).toBe(1);
    });

    it('should reuse markup if rendering to the same target twice', () => {
        var container = document.createElement('container');
        var instance1 = ReactDOM.render(<div />, container);
        var instance2 = ReactDOM.render(<div />, container);

        expect(instance1).not.toBeUndefined();
        expect(instance1 === instance2).toBe(true);
    });
});