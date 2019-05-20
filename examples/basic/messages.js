import React, { useState } from 'react';
import { useShared } from '../../';

const MESSAGES = {
  general: ['hello'],
  react: ['React is a UI library', 'JSX syntax is unique', 'React Hook is fun'],
  typescript: ["I don't want to write JavaScript without TypeScript anymore", 'How smart you are!'],
};

const api = {
  fetchChannels: () =>
    Promise.resolve({
      current: 'react',
      list: ['general', 'react', 'typescript'],
    }),

  search: (channel, query) => {
    let msgs = MESSAGES[channel];
    if (query) {
      const lq = query.toLowerCase();
      msgs = msgs.filter(msg => msg.toLowerCase().includes(lq));
    }
    return Promise.resolve(msgs);
  },
};

const initState = () => {
  return {
    channels: {
      current: null,
      list: [],
    },
    messages: [],
    query: '',
  };
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_CHANNELS':
      return {
        ...state,
        channels: action.channels,
      };
    case 'SELECT_CHANNEL':
      return {
        ...state,
        channels: {
          ...state.channels,
          current: action.channel,
        },
      };
    case 'SET_MESSAGES': {
      return {
        ...state,
        messages: action.messages,
      };
    }
    case 'SEARCH':
      return {
        ...state,
        query: action.query,
      };
  }
  return state;
};

const spaceId = Symbol();

const useChat = ({ mapState }) => {
  const shared = useShared(spaceId);

  const [state, mappedState, dispatch] = shared.useReducer(reducer, {
    initState,
    mapState,
  });

  shared.useEffect(() => {
    console.log('fetch channels');
    api.fetchChannels().then(channels => {
      dispatch({ type: 'SET_CHANNELS', channels });
    });
  }, []);

  const { current: currentChannel } = state.channels;

  shared.useEffect(() => {
    console.log('fetch messages');
    if (currentChannel != null) {
      api.search(currentChannel, state.query).then(messages => {
        dispatch({ type: 'SET_MESSAGES', messages });
      });
    }
  }, [currentChannel, state.query]);

  const actions = {
    selectChannel: channel => dispatch({ type: 'SELECT_CHANNEL', channel }),
    searchMessages: query => dispatch({ type: 'SEARCH', query }),
  };
  return [mappedState, actions];
};

const ChannelList = () => {
  const [channels, { selectChannel }] = useChat({ mapState: s => s.channels });
  console.log('render channel list', channels);
  return (
    <div className="channels">
      <ul>
        {channels.list.map(channel => {
          return (
            <li key={channel}>
              <a href="#" onClick={() => selectChannel(channel)}>
                {channel}
              </a>
              {channels.current === channel ? '*' : ''}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const Search = ({ search }) => {
  const [query, setQuery] = useState('');
  return (
    <form
      className="search"
      onSubmit={event => {
        event.preventDefault();
        search(query);
      }}
    >
      <input type="text" value={query} onChange={e => setQuery(e.target.value)} />
      <button type="submit">Search</button>
    </form>
  );
};

const MessageList = ({ messages }) => {
  return (
    <div className="messages">
      <ul>
        {messages.map(msg => {
          return <li key={msg}>{msg}</li>;
        })}
      </ul>
    </div>
  );
};

const Chat = () => {
  const [{ messages }, { searchMessages }] = useChat({
    // XXX: Currently, we need to subscribe the changes of 'query'
    // even if we don't use it in the component. Without this,
    // effects depending on this 'query' does not run.
    // We need to re-render components always to fire React Hooks.
    mapState: s => ({ messages: s.messages, query: s.query }),
  });
  console.log('render chat', messages.length);
  return (
    <div>
      <Search search={searchMessages} />
      <MessageList messages={messages} />
    </div>
  );
};

export const MessagesExample = () => {
  return (
    <div>
      <div className="side-bar">
        <ChannelList />
      </div>
      <main>
        <Chat />
      </main>
    </div>
  );
};
