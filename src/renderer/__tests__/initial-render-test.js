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
        className = 'somClassName';
    });
    
    it('should render react host element into a container', () => {
        const reactParagraphElement = <p>{innerText}</p>;
        ReactDOM.render(reactParagraphElement, container);
        expect(container.firstChild.tagName).toBe('P');
        expect(container.firstChild.innerHTML).toBe(innerText);
    });

    it('should render nested react host elements into a container', () => {
        const reactListElement = <ul><li>first</li><li>second</li></ul>;
        ReactDOM.render(reactListElement, container);
        expect(container.firstChild.tagName).toBe('UL');
        expect(container.firstChild.childNodes[0].tagName).toBe('LI');
        expect(container.firstChild.childNodes[1].innerHTML).toBe('second');
    });

    it('should apply props to host elements', () => {
        const reactParagraphElement = <p className={className}>{innerText}</p>;
        ReactDOM.render(reactParagraphElement, container);
        expect(container.firstChild.className).toBe(className);
    });

    it('should apply props to functional react components', () => {
        const MyParagraph = ({className, innerText}) => <div><div><p className={className}>{innerText}</p></div></div>;
        const myParagraphReactElement = <MyParagraph className={className} innerText={innerText}/>;
        ReactDOM.render(myParagraphReactElement, container);
        expect(container.firstChild.firstChild.firstChild.className).toBe(className);
        expect(container.firstChild.firstChild.firstChild.innerHTML).toBe(innerText);
    });

    it('should apply props to react class components', () => {
        const myParagraphReactElement = <MyComponent className={className} innerText={innerText}/>;
        ReactDOM.render(myParagraphReactElement, container);
        expect(container.firstChild.className).toBe(className);
        expect(container.firstChild.innerHTML).toBe(innerText);
    });

    it('should clean up the container before mounting', () => {
        container.appendChild(document.createElement('div'));
        const myParagraphReactElement = <MyComponent className={className} innerText={innerText}/>;
        ReactDOM.render(myParagraphReactElement, container);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.className).toBe(className);
    });
});