# Ract Hook Shared (WIP)

Divide/Share your states and effects among components with ease.

- Experimental
- No Flux
- No HOC
- Handy but scalable
- (Maybe) Code Splitting / Micro Frontends (?) friendly

## Motivation

Inspired by [Application State Management with React](https://kentcdodds.com/blog/application-state-management-with-react).

React Hook does not conflicts with a concept of Flux or a single state management like Redux at all,
but I feel a possibility that it may enable us to organize application logic including state management and effect handling in a scalable manner, yet without these architectures.

However, it is cumbersome to use React Context heavily.
A necessity of wrapping component tree by a context provider everytime can lead to maintenance cost and performance issues
if a provider must be lifted up to include components
that are far apart in the tree when they need to share some state.

It would be useful if we can share states and effects when necessary
among with components that are in arbitrary position of the UI tree.

## Handy scaling

Start from a stateless component:

```javascript
const UserStatus = () => {
  return <div>Signed in as Bob</div>;
};
```

Add state and effect if necessary, using `useState` and `useEffect`.

```javascript
const UserStatus = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = auth.subscribeSignIn(setUser);
    return unsubscribe;
  }, []);
  return user ? <div>Signed in as {user.name}</div> : <div>Please sign in</div>;
};

```

If some states and effects need to be used in multiple components, extract them as a custom hook.

```javascript
const signIn = () => auth.signInWithGoogle();
const signOut = () => auth.signOut();
const useCurrentUser = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = auth.subscribeSignIn(setUser);
    return unsubscribe;
  }, []);
  return user;
};

const UserStatus = () => {
  const user = useCurrentUser();
  return user ? (
    <div>
      Signed in as {user.name}
      <button onClick={signOut}>Sign out</button>
    </div>
  ) : (
    <div>
      Please sign in
      <button onClick={signIn}>Sign in</button>
    </div>
  );
};
```

If some states and effects should be shared in multiple components, use this `react-hook-shared` to share them.

```javascript
const spaceId = Symbol();

const useCurrentUser = () => {
  const shared = useShared(spaceId);

  // The state is shared in all components who use this custom hook.
  const [user, setUser] = shared.useState(null);

  // This effect runs only once even if multiple components use this custom hook.
  shared.useEffect(() => {
    const unsubscribe = auth.subscribeSignIn(setUser);
    return unsubscribe;
  }, []);
  return user;
};

const UserStatus = () => {
  const user = useCurrentUser();
  // ... render UI ...
};

const Profile = () => {
  const user = useCurrentUser();
  // ... render UI ...
};
```

## API

```javascript
const shared = useShared(uniqueId)
shared.useState(initialState)
shared.useReducer(/* ? */)
shared.useEffect(effect, dependencies)
shared.useEffectPer(key, effect, dependencies?)
shared.useRef(initialValue)
```