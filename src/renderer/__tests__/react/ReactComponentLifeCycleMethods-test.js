import React from '../../../isomorphic/React';
import ReactDOM from '../../ReactDOM';

describe('Component', () => {
    it('should call nested lifecycle methods in the right order', () => {
        var log;
        var logger = function(msg) {
            return function() {
                // return true for shouldComponentUpdate
                log.push(msg);
                return true;
            };
        };
        class Outer extends React.Component {
            render() {
                return <div><Inner x={this.props.x} /></div>;
            }
            componentWillMount() {
                return logger('outer componentWillMount')();
            }
            componentDidMount() {
                return logger('outer componentDidMount')();
            }
            componentWillReceiveProps() {
                return logger('outer componentWillReceiveProps')();
            }
            shouldComponentUpdate() {
                return logger('outer shouldComponentUpdate')();
            }
            componentWillUpdate() {
                return logger('outer componentWillUpdate')();
            }
            componentDidUpdate() {
                return logger('outer componentDidUpdate')();
            }
            componentWillUnmount() {
                return logger('outer componentWillUnmount')();
            }
        }
        class Inner extends React.Component {
            render() {
                return <span>{this.props.x}</span>;
            }
            componentWillMount() { return logger('inner componentWillMount')()}
            componentDidMount() { return logger('inner componentDidMount')()}
            componentWillReceiveProps() { return logger('inner componentWillReceiveProps')()}
            shouldComponentUpdate() { return logger('inner shouldComponentUpdate')()}
            componentWillUpdate() { return logger('inner componentWillUpdate')()}
            componentDidUpdate() { return logger('inner componentDidUpdate')()}
            componentWillUnmount() { return logger('inner componentWillUnmount')()}
        }


        var container = document.createElement('div');
        log = [];
        ReactDOM.render(<Outer x={17} />, container);
        expect(log).toEqual([
            'outer componentWillMount',
            'inner componentWillMount',
            'inner componentDidMount',
            'outer componentDidMount',
        ]);

        log = [];
        ReactDOM.render(<Outer x={42} />, container);
        expect(log).toEqual([
            'outer componentWillReceiveProps',
            'outer shouldComponentUpdate',
            'outer componentWillUpdate',
            'inner componentWillReceiveProps',
            'inner shouldComponentUpdate',
            'inner componentWillUpdate',
            'inner componentDidUpdate',
            'outer componentDidUpdate',
        ]);
        //
        // log = [];
        // ReactDOM.unmountComponentAtNode(container);
        // expect(log).toEqual([
        //     'outer componentWillUnmount',
        //     'inner componentWillUnmount',
        // ]);
    });
});