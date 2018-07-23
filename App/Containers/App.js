import '../Config'
import DebugConfig from '../Config/DebugConfig'
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import RootContainer from './RootContainer'
import createStore from '../Redux'
import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { AsyncStorage } from 'react-native';
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';

const cache = new InMemoryCache();


const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  },
  mutate: {
    errorPolicy: 'ignore',
  },
};



//
// use local router IP so you can test on the same wifi from a real device.
const httpLink = new HttpLink({ uri: 'http://localhost:8081/graphql/' });

let token;

const withToken = setContext(async request => {
   if (!token) {
     token = await AsyncStorage.getItem('userToken');
   }
  return {
    headers: {
      //authorization: token
      //username:'vetted', pwd:'vetted01',
      //Authorization: token
    }
  };
});

// const resetToken = onError(({ networkError }) => {
//   console.log('networkError - '+networkError)

//   if (networkError && networkError.statusCode === 401) {
//     // remove cached token on 401 from the server
//     token = undefined;
//   }
// });

const link1 = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const authFlowLink = withToken.concat(link1);

const link = authFlowLink.concat(httpLink);
//

const client = new ApolloClient({
  cache: cache,
  link: link,
  defaultOptions: defaultOptions
});

persistCache({
  cache,
  storage: AsyncStorage,
  defaultOptions,
  debug:true,
  maxSize:false
});

// create our store
const store = createStore()

/**
 * Provides an entry point into our application.  Both index.ios.js and index.android.js
 * call this component first.
 *
 * We create our Redux store here, put it into a provider and then bring in our
 * RootContainer.
 *
 * We separate like this to play nice with React Native's hot reloading.
 */
class App extends Component {
  render () {
    return (
      <ApolloProvider client={client}>
      <Provider store={store}>
        <RootContainer />
      </Provider>
      </ApolloProvider>
    )
  }
}

// allow reactotron overlay for fast design in dev mode
// export default DebugConfig.useReactotron
//   ? console.tron.overlay(App)
//   : App
export default App