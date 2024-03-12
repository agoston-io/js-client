var { AgostonClient } = require('@agoston-io/client');
var { gql } = require('@apollo/client/core');
var assert = require('assert');

// Auth with Token
AgostonClient({
  backendUrl: process.env.AGOSTON_BACKEND_URL,
  bearerToken: process.env.AGOSTON_BACKEND_URL_BEARER_TOKEN,
  customGraphQLQuery: { query: `query {session}` }
}).then(async (agostonClient) => {

  // Check custom query variables
  assert(typeof agostonClient.customGraphQLQueryResult() === "object");
  assert(agostonClient.customGraphQLQueryResult().data.session.role === 'authenticated');
  assert(agostonClient.customGraphQLQueryResult().data.session.user_id >= 0);
  // Check session variables
  assert(typeof agostonClient.isAuthenticated() === "boolean");
  assert(agostonClient.isAuthenticated());
  assert(typeof agostonClient.userRole() === "string");
  assert(agostonClient.userRole() === "authenticated");
  assert(typeof agostonClient.userId() === "number");
  assert(agostonClient.userId() >= 0);
});


// Auth with provider/user/password
AgostonClient({
  backendUrl: process.env.AGOSTON_BACKEND_URL,
  customGraphQLQuery: { query: `query {session}` }
}).then(async (agostonClient) => {

  // Session
  assert(typeof agostonClient.isAuthenticated() === "boolean");
  assert(!agostonClient.isAuthenticated());
  assert(typeof agostonClient.userRole() === "string");
  assert(agostonClient.userRole() === "anonymous");
  assert(typeof agostonClient.userId() === "number");
  assert(agostonClient.userId() === 0);

  // Check custom query variables
  assert(typeof agostonClient.customGraphQLQueryResult() === "object");
  assert(agostonClient.customGraphQLQueryResult().data.session.role === 'anonymous');
  assert(agostonClient.customGraphQLQueryResult().data.session.user_id === 0);

  // Authentication
  var username = `test-js-client-${Date.now()}`
  await agostonClient.loginOrSignUpFromProvider({ strategyName: "google-oauth20", options: { redirectSuccess: '/profile', redirectError: '/login' } });
  await agostonClient.loginOrSignUpFromProvider({ strategyName: "google-oauth20" });

  // loginOrSignUpWithUserPassword with weak password
  await agostonClient.loginOrSignUpWithUserPassword({
    username: username,
    password: "password",
    options: { redirectSuccess: '/' }
  }).then(session => {
    console.log(`auth_success: ${JSON.stringify(session)}`)
  }).catch(error => {
    console.log(`auth_error: ${error}`)
  });
  assert(typeof agostonClient.isAuthenticated() === "boolean");
  assert(!agostonClient.isAuthenticated());
  assert(typeof agostonClient.userRole() === "string");
  assert(agostonClient.userRole() === "anonymous");
  assert(typeof agostonClient.userId() === "number");
  assert(agostonClient.userId() === 0);

  // loginOrSignUpWithUserPassword with allowed password
  await agostonClient.loginOrSignUpWithUserPassword({
    username: username,
    password: "password7-F4-",
    options: {
      free_value: {
        dateOfBirth: "1986.01.12"
      },
      redirectSuccess: '/'
    }
  }).then(session => {
    console.log(`auth_success: ${JSON.stringify(session)}`)
  }).catch(error => {
    console.log(`auth_error: ${error}`)
  });
  assert(typeof agostonClient.isAuthenticated() === "boolean");
  assert(agostonClient.isAuthenticated());
  console.log(`agostonClient.session() => ${JSON.stringify(agostonClient.session())}`);
  assert(typeof agostonClient.session() === "object");
  console.log(`agostonClient.userId() => ${JSON.stringify(agostonClient.userId())}`);
  assert(typeof agostonClient.userId() === "number");
  assert(typeof agostonClient.userAuthProvider() === "string");
  assert(agostonClient.userAuthProvider() === "user-pwd");
  assert(typeof agostonClient.userAuthSubject() === "string");
  assert(agostonClient.userAuthSubject() === username);
  assert(typeof agostonClient.userAuthData() === "object");
  assert(agostonClient.userAuthData()["dateOfBirth"] === "1986.01.12");
  assert(typeof agostonClient.userRole() === "string");
  assert(agostonClient.userRole() === "authenticated");
  assert(typeof agostonClient.sessionId() === "string");
  assert(typeof agostonClient.apolloClient() === "object");
  assert(typeof agostonClient.apolloClient() === "object");

  // logout
  await agostonClient.logout({
    options: { redirectLogout: 'https://f753b978-a7db-4375-8adf-0649aeff2673.2c059b20-a200-45aa-8492-0e2891e14832.backend.agoston.io/auth/session' }
  }).then(session => {
    console.log(`logout_success: ${JSON.stringify(session)}`)
  }).catch(error => {
    console.log(`logout_error: ${error}`)
  });
  assert(typeof agostonClient.isAuthenticated() === "boolean");
  assert(!agostonClient.isAuthenticated());
  assert(agostonClient.userRole() === "anonymous");

  // GraphQL
  const apolloClient = agostonClient.createEmbeddedApolloClient();
  apolloClient.query({ query: gql`query {session} ` }).then((result) => console.log(result));
  const apolloProvider = agostonClient.createEmbeddedApolloProvider();
  apolloClient2 = agostonClient.apolloClient();
  apolloClient2.query({ query: gql`query {session} ` }).then((result) => console.log(result));
});

