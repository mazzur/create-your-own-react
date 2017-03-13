export default function shouldUpdateInternalInstance(prevReactElement, nextReactElement) {
    return nextReactElement.type === prevReactElement.type
        && nextReactElement.props.key === prevReactElement.props.key;
}