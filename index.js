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
  #cookie = null;
  #customGraphQLQueryEncoded = null;
  #customGraphQLQueryVariablesEncoded = null;
  #configurationUrlParam = `?`;

  async init(params = {}) {

    // Checks
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
      console.log(`To use your own backend, get your backend URL in the Agoston.io console.`)
    }

    if (params.bearerToken !== undefined) {
      this.#headers['Authorization'] = 'Bearer ' + params.bearerToken;
    }

    // Custom query
    if (params.customGraphQLQuery !== undefined) {
      if (typeof params.customGraphQLQuery !== 'object') {
        throw new Error('customGraphQLQuery must be an object.');
      }
      if (params.customGraphQLQuery.query === undefined) {
        throw new Error('customGraphQLQuery.query missing.');
      }
      this.#configurationUrlParam = this.#configurationUrlParam + '&gq=' + encodeURI(params.customGraphQLQuery.query);
      if (params.customGraphQLQuery.variables !== undefined) {
        if (typeof params.customGraphQLQuery.variables !== 'object') {
          throw new Error('customGraphQLQuery.variables must be an object.');
        }
        this.#configurationUrlParam = this.#configurationUrlParam + '&gqv=' + encodeURI(JSON.stringify(params.customGraphQLQuery.variables));
      }
    }

    // Load configuration
    await this.#loadConfiguration();
    this.#endpoints = this.#configuration.endpoints;

    // Checks with config
    if (params.bearerToken !== undefined && !this.#configuration.authentication.without_link["http-bearer"].enable) {
      throw new Error('Bearer authentication is not enabled on the backend.');
    }

    // Redirect
    if (this.#mode === this.CMD) {
      this.#base_url = this.#backendUrl
      this.#redirectSuccess = this.#configuration.authentication.session_link;
      this.#redirectError = this.#configuration.authentication.session_link;
      this.#redirectLogout = this.#configuration.authentication.session_link;
    }

    // Load session
    this.#session = this.#configuration.currentSession;
    return this;
  };

  async #loadConfiguration() {
    const options = {
      method: "GET",
      credentials: "include",
      headers: this.#headers,
    };
    const configurationUrl = `${this.#backendUrl}/.well-known/configuration${this.#configurationUrlParam}`;
    const response = await fetch(configurationUrl, options);
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
    if (this.#mode === this.#CMD) {
      options.headers["Cookie"] = this.#cookie
    }
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
  session() { return this.#session || "{}" }
  customGraphQLQueryResult() { return this.#configuration.customGraphQLQueryResult }

  // Auth with user/password
  async loginOrSignUpWithUserPassword(params = {}) {
    if (params.username === undefined || params.password === undefined) {
      throw new Error(`Missing username or password.`);
    }
    var post_option = `?redirect=false`;
    var post_link = `${this.#configuration.authentication.without_link["user-pwd"].post_auth_endpoint}${post_option}`;

    return new Promise((resolve, reject) => {
      fetch(post_link, {
        method: "POST",
        credentials: "include",
        headers: this.#headers,
        body: JSON.stringify({
          username: params.username || 'null',
          password: params.password || 'null',
          free_value: params.options?.free_value || {}
        })
      })
        .then((response) => {
          response.json().then((responseJson) => {
            if (response.ok) {
              if (this.#mode === this.#CMD) {
                this.#cookie = response.headers.get('set-cookie');
              }
              this.#loadSession().then(() => {
                resolve(this.#session)
              }).catch((error) => {
                reject(error);
              });;
            } else {
              reject(responseJson.message)
            }
          })
        })
        .catch((error) => {
          reject(error);
        });

    });
  }

  // Auth with link
  async loginOrSignUpFromProvider(params = {}) {
    if (params.strategyName === undefined) { params.strategyName = 'default-auth0-oidc'; }
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
  async logout(params = {}) {
    var logout_link = `${this.#configuration.authentication.logout_link}`;
    const options = {
      method: "POST",
      credentials: "include",
      headers: this.#headers
    };
    if (this.#mode === this.#CMD) {
      options.headers["Cookie"] = this.#cookie
    }
    return new Promise((resolve, reject) => {
      fetch(logout_link, options)
        .then((response) => {
          if (response.ok) {
            this.#loadSession().then(() => {
              resolve(this.#session)
            }).catch((error) => {
              reject(error);
            });
          } else {
            reject(JSON.stringify(response))
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
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