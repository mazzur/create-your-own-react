import React from '../../isomorphic/React';
import ReactDOM from '../ReactDOM';

describe('ReactDOM', () => {
    let container;
    let innerText;
    let className;

    class MyComponent extends React.Component{
        render() {
            return <p className={this.props.className}>{this.props.innerText}</p>;
        }
    }

    beforeEach(() => {
        container = document.createElement('div');
        innerText = 'some text';
        className = 'someClassName';
    });

    it('should not re-mount the new tree to the dom if the root react element did not change', () => {
        const MyParagraph = ({className, innerText}) => <p className={className}>{innerText}</p>;
        const myParagraphReactElement = <MyParagraph className={className} innerText={innerText}/>;
        ReactDOM.render(myParagraphReactElement, container);
        container.firstChild.marked = true;
        ReactDOM.render(myParagraphReactElement, container);
        expect(container.firstChild.marked).toBe(true);
    });

    it('should NOT RE-MOUNT the new tree if root type did not change', () => {
        const MyParagraph = ({className, innerText}) => <p className={className}>{innerText}</p>;
        const myParagraphReactElement = <MyParagraph className={className} innerText={innerText}/>;
        ReactDOM.render(myParagraphReactElement, container);
        container.firstChild.marked = true;
        const newMyParagraphReactElement = <MyParagraph className='different name' innerText={innerText}/>;
        ReactDOM.render(newMyParagraphReactElement, container);
        expect(container.firstChild.marked).toBe(true);
    });

    it('should UPDATE the sub-tree node properties if only respective props changed', () => {
        const newClassName = 'differentClass';
        const MyParagraph = ({className, innerText}) => <div><p className={className}>{innerText}</p></div>;
        const myParagraphReactElement = <MyParagraph className={className} innerText={innerText}/>;
        ReactDOM.render(myParagraphReactElement, container);
        container.firstChild.firstChild.marked = true;

        const newMyParagraphReactElement = <MyParagraph className={newClassName} innerText={innerText}/>;
        ReactDOM.render(newMyParagraphReactElement, container);
        expect(container.firstChild.firstChild.marked).toBe(true);
        expect(container.firstChild.firstChild.className).toBe(newClassName);
    });

    it('should RE-MOUNT subtree if element type changed', () => {
        class HighlightedParagraph extends React.Component {
            render() {
                return <b>{this.props.innerText}</b>;
            }
        }
        const MyParagraph = ({highlight, innerText}) => highlight ? <HighlightedParagraph/> : <p>{innerText}</p>;
        const myParagraphReactElement = <MyParagraph innerText={innerText}/>;
        ReactDOM.render(myParagraphReactElement, container);

        const newMyParagraphReactElement = <MyParagraph highlight={true} innerText={innerText}/>;
        ReactDOM.render(newMyParagraphReactElement, container);
        expect(container.firstChild.tagName).toBe('B');
    });
});