import React from '../../../isomorphic/React';
import ReactDOM from '../../ReactDOM';
import ReactUpdates from '../../ReactUpdates';

describe('ReactUpdates', () => {
    it('should batch updates on initial render', () => {
        const initialText = 'initialText';
        const newText = 'newText';

        class MyComponent extends React.Component {
            constructor() {
                super();
                this.state = {
                    text: initialText
                };
            }

            componentDidMount() {
                this.setState({text: newText});
                expect(this.state.text).toBe(initialText);
            }

            render() {
                return <p>this.state.text</p>
            }
        }

        const container = document.createElement('div');
        const inst = ReactDOM.render(<MyComponent/>, container);
        expect(inst.state.text).toBe(newText);
    });

    it('should batch state when updating state twice', () => {
        var updateCount = 0;

        class Component extends React.Component {
            constructor() {
                super();
                this.state = {x: 0};
            }

            componentDidUpdate() {
                updateCount++;
            }

            render() {
                return <div>{this.state.x}</div>;
            }
        }

        const container = document.createElement('div');
        var instance = ReactDOM.render(<Component />, container);
        expect(instance.state.x).toBe(0);

        ReactUpdates.batchedUpdates(function() {
            instance.setState({x: 1});
            instance.setState({x: 2});
            expect(instance.state.x).toBe(0);
            expect(updateCount).toBe(0);
        });

        expect(instance.state.x).toBe(2);
        expect(updateCount).toBe(1);
    });

    it('should batch state when updating two different state keys', () => {
        var updateCount = 0;

        class Component extends React.Component {
            constructor() {
                super();
                this.state = {x: 0, y: 0};
            }

            componentDidUpdate() {
                updateCount++;
            }

            render() {
                return <div><span>{this.state.x}</span><span>{this.state.y}</span></div>;
            }
        }

        var instance = ReactDOM.render(<Component />, document.createElement('div'));
        expect(instance.state.x).toBe(0);
        expect(instance.state.y).toBe(0);

        ReactUpdates.batchedUpdates(function() {
            instance.setState({x: 1});
            instance.setState({y: 2});
            expect(instance.state.x).toBe(0);
            expect(instance.state.y).toBe(0);
            expect(updateCount).toBe(0);
        });

        expect(instance.state.x).toBe(1);
        expect(instance.state.y).toBe(2);
        expect(updateCount).toBe(1);
    });

    it('should flush updates in the correct order', () => {
        var updates = [];

        class Outer extends React.Component {
            constructor() {
                super();
                this.state = {x: 0};
            }

            componentWillMount() {
                this.attachRef = this.attachRef.bind(this);
            }

            render() {
                updates.push('Outer-render-' + this.state.x);
                const tree = <div><Inner x={this.state.x} ref={this.attachRef} /></div>;
                return tree;
            }

            attachRef(el) {
                this.inner = el;
            }

            componentDidUpdate() {
                var x = this.state.x;
                updates.push('Outer-didUpdate-' + x);
                updates.push('Inner-setState-' + x);
                this.inner.setState({x: x}, function() {
                    updates.push('Inner-callback-' + x);
                });
            }
        }

        class Inner extends React.Component {
            constructor() {
                super();
                this.state = {x: 0};
            }

            render() {
                updates.push('Inner-render-' + this.props.x + '-' + this.state.x);
                return <div />;
            }

            componentDidUpdate() {
                updates.push('Inner-didUpdate-' + this.props.x + '-' + this.state.x);
            }
        }

        const container = document.createElement('div');
        var instance = ReactDOM.render(<Outer />, container);

        updates.push('Outer-setState-1');
        instance.setState({x: 1}, function() {
            updates.push('Outer-callback-1');
            updates.push('Outer-setState-2');
            instance.setState({x: 2}, function() {
                updates.push('Outer-callback-2');
            });
        });

        /* eslint-disable indent */
        expect(updates).toEqual([
            // initial render
            'Outer-render-0',
            'Inner-render-0-0',

            //___________
            // set outer state after render
            'Outer-setState-1',
            // outer render followed by setState x = 1
            'Outer-render-1',
            // inner render followed by outer setState with new prop x = 1
            'Inner-render-1-0',
            // inner component did update hook
            'Inner-didUpdate-1-0',
            // outer did update hook
            'Outer-didUpdate-1',
            // outer did updates sets inner state, inner component dirty
            // Happens in a batch, so don't re-render yet inner state.x = 1
            'Inner-setState-1',
            // initial outer setState callback
            'Outer-callback-1',
            // Happens in a batch
            // set outer state, outer component dirty outer state.x = 2
            'Outer-setState-2',

            // flush 2 dirty components


            // Flush batched updates all at once
            'Outer-render-2',
            'Inner-render-2-1',
            'Inner-didUpdate-2-1',
            'Inner-callback-1',
            'Outer-didUpdate-2',
            'Inner-setState-2',
            'Outer-callback-2',
            'Inner-render-2-2',
            'Inner-didUpdate-2-2',
            'Inner-callback-2',
        ]);
        /* eslint-enable indent */
    });
});