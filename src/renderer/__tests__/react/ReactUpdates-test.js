import React from '../../../isomorphic/React';
import ReactDOM from '../../ReactDOM';

describe('ReactUpdates', () => {
    it('should batch state when updating state twice', () => {
        var updateCount = 0;

        class Component extends React.Component {
            state = {x: 0};

            componentDidUpdate() {
                updateCount++;
            }

            render() {
                return <div>{this.state.x}</div>;
            }
        }

        var instance = ReactTestUtils.renderIntoDocument(<Component />);
        expect(instance.state.x).toBe(0);

        ReactDOM.unstable_batchedUpdates(function() {
            instance.setState({x: 1});
            instance.setState({x: 2});
            expect(instance.state.x).toBe(0);
            expect(updateCount).toBe(0);
        });

        expect(instance.state.x).toBe(2);
        expect(updateCount).toBe(1);
    });
});