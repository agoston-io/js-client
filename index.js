const fetch = require('node-fetch');

class Client {

  #ENV = process.env.NODE_ENV || 'development' === 'development';
  #BROWSER = 'browser';
  #CMD = 'cmd';
  #mode = this.#CMD;
  #demoMode = true;
  #backendUrl = 'https://f753b978-a7db-4375-8adf-0649aeff2673.2c059b20-a200-45aa-8492-0e2891e14832.backend.agoston.io';
  #endpoints = {
    graphql: `${this.#backendUrl}/data/graphql`,
    graphql_ws: `${this.#backendUrl}/data/graphql`
  };
  #headers = {
    Accept: "application/json",
    "Content-Type": "application/json;charset=UTF-8",
  };
  #base_url = this.backendUrl;
  #redirectSuccess = this.base_url;
  #redirectError = this.base_url;
  #redirectLogout = this.base_url;
  #configuration = {};
  #session = {};
  #apolloClient = null;
  #apolloProvider = null;

  async init(params = {}) {

    if (typeof Window !== 'undefined') {
      this.#mode = this.#BROWSER;
      this.#base_url = window.location.href;
      this.#redirectSuccess = this.#base_url;
      this.#redirectError = this.#base_url;
      this.#redirectLogout = this.#base_url;
    }

    if (params.backendUrl !== undefined) {
      this.#demoMode = false
      this.#backendUrl = params.backendUrl;
      if (this.#backendUrl.slice(-1) === '/') {
        this.#backendUrl = this.#backendUrl.slice(0, -1)
      }
    } else {
      console.log(`No backend URL provided, working with the demo backend '${this.#backendUrl}'.`)
    }

    // Load configuration
    await this.#loadConfiguration();
    this.#endpoints = this.#configuration.endpoints;

    // Redirect
    if (this.#mode === this.CMD) {
      this.#base_url = this.#backendUrl
      this.#redirectSuccess = this.#configuration.authentication.session_link;
      this.#redirectError = this.#configuration.authentication.session_link;
      this.#redirectLogout = this.#configuration.authentication.session_link;
    }

    // Load session
    if (params.bearerToken !== undefined && !this.#configuration.authentication.without_link["http-bearer"].enable) {
      throw new Error('Bearer authentication is not enabled on the backend.');
    }
    if (params.bearerToken !== undefined) {
      this.#headers['Authorization'] = 'Bearer ' + params.bearerToken;
    }
    await this.#loadSession();

    return this;
  };

  async #loadConfiguration() {
    const options = {
      method: "GET",
      headers: this.#headers,
    };
    const response = await fetch(`${this.#backendUrl}/.well-known/configuration`, options);
    this.#configuration = await response.json();
  }

  async #loadSession() {
    const options = {
      method: "POST",
      credentials: "include",
      headers: this.#headers,
      body: JSON.stringify({
        query: 'query { session }'
      }),
    };
    const response = await fetch(`${this.#backendUrl}/data/graphql`, options);
    var s = await response.json();
    this.#session = s.data.session
  }

  isAuthenticated() {
    return this.#session?.is_authenticated || false
  }

  // Getters
  userId() { return this.#session?.user_id || 0 }
  userAuthProvider() { return this.#session?.auth_provider || "" }
  userAuthSubject() { return this.#session?.auth_subject || "0" }
  userAuthData() { return this.#session?.auth_data || "{}" }
  userRole() { return this.#session?.role || "anonymous" }
  sessionId() { return this.#session?.session_id || "" }
  apolloClient() { return this.#apolloClient }
  apolloProvider() { return this.#apolloProvider }

  // Auth with user/password
  async loginOrSignUpWithUserPassword(params = {}) {
    if (params.username === undefined || params.password === undefined) {
      throw new Error(`Missing username or password.`);
    }
    var post_option = `?redirect=false`;
    var post_link = `${this.#configuration.authentication.without_link["user-pwd"].post_auth_endpoint}${post_option}`;
    if (this.#mode === this.#BROWSER) {
      var response = await fetch(post_link, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: params.username || 'null',
          password: params.password || 'null',
          free_value: params.data || {}
        })
      });
      var ret = await response.json()
      var error;
      if (response.status !== 200) { error = ret.message }
      return error
    }
    console.log(`POST LINK: ${post_link}`)
    return
  }

  // Auth with link
  loginOrSignUpFromProvider(params = {}) {
    if (!(params.strategyName in this.#configuration.authentication.with_link)) {
      throw new Error(`unknown strategy provided: ${params.strategyName}. Check which strategy is enabled on '${this.#backendUrl}/.well-known/configuration'.`);
    }
    var post_option = `?auth_redirect_success=${params.options?.redirectSuccess || this.#redirectSuccess}&auth_redirect_error=${params.options?.redirectError || this.#redirectError}`;
    var auth_link = `${this.#configuration.authentication.with_link[params.strategyName].auth_link}${post_option}`;

    if (this.#mode === this.#BROWSER) {
      window.location.href = auth_link;
    } else {
      console.log(`AUTH LINK: ${auth_link}`);
    }
  }

  // Logout
  logout(params = {}) {
    var auth_link = `${this.#configuration.authentication.logout_link}?auth_redirect_logout=${params.options?.redirectLogout || this.#redirectLogout}`;
    if (this.#mode === this.#BROWSER) {
      window.location.href = auth_link;
    } else {
      console.log(`LOGOUT LINK: ${auth_link}`);
    }
  }

  // Apollo client thin
  createEmbeddedApolloClient() {

    const { ApolloClient, HttpLink, ApolloLink, split, InMemoryCache } = require('@apollo/client/core');
    const { onError } = require('@apollo/client/link/error');
    const { GraphQLWsLink } = require('@apollo/client/link/subscriptions');
    const { createClient } = require('graphql-ws');
    const { getMainDefinition } = require('@apollo/client/utilities');

    const httpLink = new HttpLink({
      uri: this.#endpoints.graphql,
      credentials: 'include'
    })

    var link = httpLink;
    if (this.#mode === this.#BROWSER) {
      const wsLink = new GraphQLWsLink(
        createClient({
          url: this.#endpoints.graphql_ws,
          connectionParams: {
            credentials: 'include'
          }
        })
      );

      link = split(
        ({ query }) => {
          const definition = getMainDefinition(query)
          return definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        },
        wsLink,
        httpLink
      );
    }

    // Handle errors
    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, stack }) => {
          console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Stack: ${stack}`)
        }
        )

      if (networkError) console.error(`[Network]: ${networkError}`)
    })

    const authMiddleware = new ApolloLink((operation, forward) => {
      if ('Authorization' in this.#headers) {
        operation.setContext({
          headers: {
            Authorization: this.#headers['Authorization']
          }
        });
      }
      return forward(operation);
    })

    this.#apolloClient = new ApolloClient({
      link: errorLink.concat(authMiddleware.concat(link)),
      cache: new InMemoryCache(),
      connectToDevTools: this.#ENV === 'development' ? true : false
    })

    return this.#apolloClient
  }

  createEmbeddedApolloProvider() {
    const { createApolloProvider } = require('@vue/apollo-option');

    if (this.#apolloClient === null) {
      this.createEmbeddedApolloClient();
    }

    this.#apolloProvider = createApolloProvider({
      defaultClient: this.#apolloClient,
    })

    return this.#apolloProvider
  }

}

async function AgostonClient(params) {
  const c = new Client()
  return c.init(params)
}


exports.AgostonClient = AgostonClient