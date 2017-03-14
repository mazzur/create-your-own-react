import React from '../../React';
import ReactDOM from '../../../renderer/ReactDOM';

describe('BaseComponent', () => {
    var container;
    var freeze = function(expectation) {
        Object.freeze(expectation);
        return expectation;
    };
    var Inner;
    var attachedListener = null;
    var renderedName = null;

    beforeEach(() => {
        container = document.createElement('div');
        attachedListener = null;
        renderedName = null;
        Inner = class extends React.Component {
            getName() {
                return this.props.name;
            }
            render() {
                attachedListener = this.props.onClick;
                renderedName = this.props.name;
                return <div className={this.props.name} />;
            }
        };
    });

    function test(element, expectedTag, expectedClassName) {
        var instance = ReactDOM.render(element, container);
        expect(container.firstChild).not.toBeNull();
        expect(container.firstChild.tagName).toBe(expectedTag);
        expect(container.firstChild.className).toBe(expectedClassName);
        return instance;
    }

    it('renders based on state using props in the constructor', () => {
        class Foo extends React.Component {
            constructor(props) {
                super(props);
                this.state = {bar: props.initialValue};
            }
            changeState() {
                this.setState({bar: 'bar'});
            }
            render() {
                if (this.state.bar === 'foo') {
                    return <div className="foo" />;
                }
                return <span className={this.state.bar} />;
            }
        }
        var instance = test(<Foo initialValue="foo" />, 'DIV', 'foo');
        instance.changeState();
        test(<Foo />, 'SPAN', 'bar');
    });

    it('renders only once when setting state in componentWillMount', () => {
        var renderCount = 0;
        class Foo extends React.Component {
            constructor(props) {
                super(props);
                this.state = {bar: props.initialValue};
            }
            componentWillMount() {
                this.setState({bar: 'bar'});
            }
            render() {
                renderCount++;
                return <span className={this.state.bar} />;
            }
        }
        test(<Foo initialValue="foo" />, 'SPAN', 'bar');
        expect(renderCount).toBe(1);
    });

    it('setState through an event handler', () => {
        class Foo extends React.Component {
            constructor(props) {
                super(props);
                this.state = {bar: props.initialValue};
            }
            handleClick() {
                this.setState({bar: 'bar'});
            }
            render() {
                return (
                    <Inner
                        name={this.state.bar}
                        onClick={this.handleClick.bind(this)}
                    />
                );
            }
        }
        test(<Foo initialValue="foo" />, 'DIV', 'foo');
        attachedListener();
        expect(renderedName).toBe('bar');
    });

    it('will call all the normal life cycle methods', () => {
        var lifeCycles = [];
        class Foo extends React.Component {
            constructor(props) {
                super(props);
                this.state = {};
            }
            componentWillMount() {
                lifeCycles.push('will-mount');
            }
            componentDidMount() {
                lifeCycles.push('did-mount');
            }
            componentWillReceiveProps(nextProps) {
                lifeCycles.push('receive-props', nextProps);
            }
            shouldComponentUpdate(nextProps, nextState) {
                lifeCycles.push('should-update', nextProps, nextState);
                return true;
            }
            componentWillUpdate(nextProps, nextState) {
                lifeCycles.push('will-update', nextProps, nextState);
            }
            componentDidUpdate(prevProps, prevState) {
                lifeCycles.push('did-update', prevProps, prevState);
            }
            componentWillUnmount() {
                lifeCycles.push('will-unmount');
            }
            render() {
                return <span className={this.props.value} />;
            }
        }
        test(<Foo value="foo" />, 'SPAN', 'foo');
        expect(lifeCycles).toEqual([
            'will-mount',
            'did-mount',
        ]);
        lifeCycles = []; // reset
        test(<Foo value="bar" />, 'SPAN', 'bar');
        expect(lifeCycles).toEqual([
            'receive-props', freeze({value: 'bar'}),
            'should-update', freeze({value: 'bar'}), {},
            'will-update', freeze({value: 'bar'}), {},
            'did-update', freeze({value: 'foo'}), {},
        ]);
        lifeCycles = []; // reset
        // ReactDOM.unmountComponentAtNode(container);
        // expect(lifeCycles).toEqual([
        //     'will-unmount',
        // ]);
    });
});