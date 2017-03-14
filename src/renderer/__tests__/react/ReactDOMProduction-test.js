import React from '../../../isomorphic/React';
import ReactDOM from '../../ReactDOM';

describe('ReactDOM', () => {
    it('should handle a simple flow', () => {
        class Component extends React.Component {
            render() {
                return <span>{this.props.children}</span>;
            }
        }

        var container = document.createElement('div');
        var inst = ReactDOM.render(
            <div className="blue">
                <Component key={1}>A</Component>
                <Component key={2}>B</Component>
                <Component key={3}>C</Component>
            </div>,
            container
        );

        expect(container.firstChild).toBe(inst);
        expect(inst.className).toBe('blue');
        expect(inst.textContent).toBe('ABC');

        ReactDOM.render(
            <div className="red">
                <Component key={2}>B</Component>
                <Component key={1}>A</Component>
                <Component key={3}>C</Component>
            </div>,
            container
        );

        expect(inst.className).toBe('red');
        expect(inst.textContent).toBe('BAC');

        // ReactDOM.unmountComponentAtNode(container);
        //
        // expect(container.childNodes.length).toBe(0);
    });

    it('should call lifecycle methods', () => {
        var log = [];
        class Component extends React.Component {
            constructor(props) {
                super(props);
                this.state = {y: 1};
            }

            shouldComponentUpdate(nextProps, nextState) {
                log.push(['shouldComponentUpdate', nextProps, nextState]);
                return nextProps.x !== this.props.x || nextState.y !== this.state.y;
            }
            componentWillMount() {
                log.push(['componentWillMount']);
            }
            componentDidMount() {
                log.push(['componentDidMount']);
            }
            componentWillReceiveProps(nextProps) {
                log.push(['componentWillReceiveProps', nextProps]);
            }
            componentWillUpdate(nextProps, nextState) {
                log.push(['componentWillUpdate', nextProps, nextState]);
            }
            componentDidUpdate(prevProps, prevState) {
                log.push(['componentDidUpdate', prevProps, prevState]);
            }
            componentWillUnmount() {
                log.push(['componentWillUnmount']);
            }
            render() {
                log.push(['render']);
                return <p></p>;
            }
        }

        var container = document.createElement('div');
        var inst = ReactDOM.render(
            <Component x={1} />,
            container
        );
        expect(log).toEqual([
            ['componentWillMount'],
            ['render'],
            ['componentDidMount'],
        ]);
        log = [];

        inst.setState({y: 2});
        expect(log).toEqual([
            ['shouldComponentUpdate', {x: 1}, {y: 2}],
            ['componentWillUpdate', {x: 1}, {y: 2}],
            ['render'],
            ['componentDidUpdate', {x: 1}, {y: 1}],
        ]);
        log = [];

        inst.setState({y: 2});
        expect(log).toEqual([
            ['shouldComponentUpdate', {x: 1}, {y: 2}],
        ]);
        log = [];

        ReactDOM.render(
            <Component x={2} />,
            container
        );
        expect(log).toEqual([
            ['componentWillReceiveProps', {x: 2}],
            ['shouldComponentUpdate', {x: 2}, {y: 2}],
            ['componentWillUpdate', {x: 2}, {y: 2}],
            ['render'],
            ['componentDidUpdate', {x: 1}, {y: 2}],
        ]);
        log = [];

        ReactDOM.render(
            <Component x={2} />,
            container
        );
        expect(log).toEqual([
            ['componentWillReceiveProps', {x: 2}],
            ['shouldComponentUpdate', {x: 2}, {y: 2}],
        ]);
        // log = [];

        // ReactDOM.unmountComponentAtNode(container);
        // expect(log).toEqual([
        //     ['componentWillUnmount'],
        // ]);
    });
});