# React Hook Shared

Share your states and effects among multiple components with ease.

## First of all

I created this library as an experiment, but concluded that this is not a practical idea.
Though this library provides somewhat useful features, it has several pitfalls and downsides (and probably bugs too. I don’t test much because of the conclusion).

## What it looks like

```javascript
import React from 'react';
import { SharedProvider, useShared } from 'react-hook-shared';

const App = () => (
  <SharedProvider>
    <Content />
    <ThemeEdit />
  </SharedProvider>
);

const Content = ({ children }) => {
  const { theme } = useTheme();
  return <Theme with={theme}>{children}</Theme>;
}

const ThemeEdit = () => {
  const { theme, changeTheme } = useTheme();
  return (/* edit form using changeTheme */);
}

const spaceId = Symbol();

// Custom hook that uses shared state and effect.
// States and effects are initialized only once even if multiple components use this hook.
const useTheme = () => {
  const shared = useShared(spaceId);

  const [theme, setTheme] = shared.useState(lightTheme);
  const [themeName, changeTheme]  = shared.useState('light');

  shared.useEffect(() => {
    api.fetchTheme(themeName).then(setTheme);
  }, [themeName]);

  return { themse, changeTheme };
};
```

## Motivation

Inspired by [Application State Management with React][app-state-management-with-react].

This blog post shows a way of state management without any Flux libraries, just using React Context.
I enjoyed this blog and thought that it would be useful if we can do the same thing
— sharing states and effects with multiple components in a UI tree — without Context Providers.  
A necessity of wrapping certain part by a Provider component could be a maintenance cost.
We need to determine where is the smallest root to wrap all components that use the state provided by a Provider every time when a component need the state (otherwise need to wrap the whole tree by a Provider).
Also, JavaScript/TypeScript could not warn you if you forgot to wrap it by a Provider.

So I created this library to share custom hooks among with components that are in arbitrary position of a UI tree, without Provider.

[app-state-management-with-react]: https://kentcdodds.com/blog/application-state-management-with-react

## Usability

- Easy to introduce
- No Flux
- No HOC
- Maybe Code Splitting friendly?

However, using this library would encourage you to compose your business logic by custom hooks.
This have several disadvantages:

- Less testable - You need to render a component to test your logic, because React Hook cannot run outside of a component lifecycle.
- Less portable - Your logic will be tightly coupled with React Hook. 

Essentially React Hook itself is tightly coupled with components, of course.
This is fine and useful but this is not suited for complicated domain logic that should be independent from views and be tested carefully.

## Usage

1. Wrap your component tree by `SharedProvider`.
2. Use `useShared` hook to obtain shared API.

```javascript
// You need to pass an id to useShared. This id must be unique per custom hook so Symbol is suited.
const spaceId = Symbol();
const shared = useShared(spaceId);
```

The functions obtained from `useShared` share the _same space_.
The space will be initialized when the first component accesses it,
and cleaned up after the last component is unmounted.

## API

### useState

```javascript
const useSharedCount = () => {
  const shared = useShared(spaceId);
  const [count, setCount] = shared.useState(0);
  const increment = () => setCount(count + 1);
  return [count, increment];
};
```

Multiple components can share the state.
For example, when component A and B use this shared state,

- The state is initialized with the value provided by a first-rendered component.
  - If A is rendered first, an initial state set by B is ignored, and the current value is returned when B calls `useState(0)` first.
- If any component changes the state by `setCount`, all components using this hook will be re-rendered.
- **Pitfall**: You cannot skip rendering only for some components. Always all components are re-rendered when a shared state changed. If you want to share a state but each component uses a part of the state, use `useReducer` and state mapping to avoid unnecessary re-rendering.

### useReducer

```javascript
const initState = () => ({
  articles: [],
  category: null,
});

const useArticles = mapState => {
  const shared = useShared(spaceId);
  const [state, mappedState, dispatch] = shared.useReducer(reducer, { initState, mapState });

  shared.useEffect(() => {
    api.fetchArticles(state.category).then(articles => {
        dispatch({ type: 'FETCH_ARTICLES_OK', articles });
    });
  }, [state.category]);

  const actions = {
    changeCategory: category => dispatch({ type: 'CHANGE_CATEGORY', category }),
  };
  return [mappedState, actions];
};

```

Multiple components can share the state while each component can use some part of the state.

```javascript
const ArticleIndex = () => {
  const [articles] = useArticles(state => state.articles);
  return <ArticleList articles={articles} />;
};

// This component will be re-rendered only when `state.category` is changed.
const Header = () => {
  const [category, {changeCategory}] = useArticles(state => state.cateogry);
  return (
    <ArticleFilter
      category={category}
      onCategoryChange={changeCategory}
    />
  );
}
```

- Like `useState`, the state is initialized with te value provided by a first-rendered component.
- You need to pass two functions for `useReducer` as a second argument:
  - `initState` - A function that returns an initial state. This is called only once.
  - `mapState` - A function that maps a state for specific use. Each component can use different partial state by passing  `mapState`.
- Each component is re-rendered only when its mapped state changes.
- **Pitfall**: When a shared effect depends on a partial state, at least one component must map and use that state. This is because React Hook cannot run without rendering. For example, if no components use the `state.category` via `mapState` in the above sample code, the effect never runs as no rendering fired when `state.category` changes.

### useEffect

```javascript
const useSearch = () => {
  const shared = useShared(spaceId);
  const [result, setResult] = shared.useState(null);
  const [query, setQuery] = shared.useState('');

  shared.useEffect(() => {
    return api.search(query).then(setResult);
  }, [query]);

  return { result, search: setQuery };
}
```

Multiple components can share the effect.

- The effect runs first when a first component uses this hook. If another component uses this hook but the dependencies (`[sharedState]`) does not change, the effect does not run.
- You can specify the empty dependency (`[]`) to run the effect only once like React Hook’s `useEffect`.
- **Pitfall**: Do not depends on local states (component’s state and props). It results in unexpected behavior. A shared effect can depend on shared states only. You can use `useEffectPer` to partially depends on a local state.

### useEffectPer

```javascript
const reducer = (state = {}, action) => ({
  ...state,
  [action.friendID]: action.isOnline,
})

const useFriendStatus = (friendID) => {
  const shared = useShared(spaceId);
  const [_statues, isOnline, dispatch] = shared.useReducer(reducer, {
    initState: () => ({}),
    mapState: s => s[friendID],
  });

  shared.useEffectPer(friendID, () => {
    const handleChange = status => dispatch({ friendID, ...status });
    ChatAPI.subscribeFriendStatus(friendID, handleChange);
    return ChatAPI.unsubscribeFriendStatus(friendID, handleChange);
  });

  return isOnline;
}
```

Multiple component can share multiple effects.
Consider `useFriendStatus` example in React Hook reference.
If multiple components use this `useFriendStatus`, it should be like below:

- Each component can subscribe a different friend status simultaniously.
- There is always one subscription for a same friend. No duplicate API calls.
- A subscription is cancelled when all subscribing components are unmounted.

`useEffectPer` achieves this. You can run different effect per component by providing a key (`friendID`). 

- **Pitfall**: Currently you cannot pass dependencies to this hook.