Repo used to re-implement essential react internals in order to learn its inner working.

##### Steps (in respective branches)
###### 1-initial-render-only
- minimalistic implementation of ReactElement, BaseComponent
- initial rendering impl

###### 2-subsequent-rendering-optimisation
- CompositeComponent, HostComponent internal classes implementation

###### 3-initial-mount-unmount-hooks:
- componentWillMount
- componentDidMount
- componentWillUnmount

###### 4-set-state-and-hooks:
- setState (no batching yet)
- componentWillReceiveProps
- shouldComponentUpdate
- ComponentWIllUpdate
- componentDidUpdate

###### 5-batch-updates:
- generic Transaction (mixin defining essential transaction flow - initialization, performing, closing)
- ReactReconcileTransaction (used to queue up componentDiDMount/Update and callbacks at mounting/updating)
- BatchingStrategyTransaction (used to queue up state updates during mounting/updating)
- ReactUpdatesTransaction (used to queue up state changes which happens during updates flushing)
- ReactDefaultBatchingStrategy (performs batched mounting/update with batchingStrategyTransaction)
- ReactUpdates (fills up and flushes dirty components queue during mounting/updating)
- refs support (only functional, as sting are deprecating)

##### Current limitations:
- unit tests share single framework instance which is essentially wrong, but helps us at current steps to think about the necessity of pooling and other memory consumption optimisations
- all the exceptional flows are ignored
- optimisations not related directly to the main success flows are ignored

#### React internals notes
- ReactCurrentOwner - seems to be used only to implement string refs (as functional does not need to bind to owner public instance. Used to define _owner during react element creation)
- PooledClass - add static methods/properties to classes to create their instance pool to reuse later instead of creating new and (it seems) relying on garbage collection
