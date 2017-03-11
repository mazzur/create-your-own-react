import React from '../React';

describe('React', () => {
    let innerText;
    let styles;
    let paragraphElementType;

    class ParagraphTextComponent extends React.Component {
        render() {
            return <p>this.props.text</p>;
        }
    }

    beforeEach(() => {
        innerText = 'some text';
        styles = {color: 'red'};
        paragraphElementType = 'p';
    });

    it('should provide API to create elements (providers)', () => {
        const reactParagraphElement = React.createElement(paragraphElementType, {style: styles}, innerText);
        expect(reactParagraphElement.type).toBe(paragraphElementType);
        expect(reactParagraphElement.props).toEqual({style: styles, children: innerText});
    });

    it('should work with jsx and component types', () => {
        const reactComponentElement = <ParagraphTextComponent text={innerText}/>;
        expect(reactComponentElement.type).toBe(ParagraphTextComponent);
        expect(reactComponentElement.props).toEqual({text: innerText});
    });
});