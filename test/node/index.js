var { AgostonClient } = require('@agoston-io/client');
var { gql } = require('@apollo/client/core');
var assert = require('assert');

(async () => {

  // promise with async/await
  const agostonClient = await AgostonClient({
    backendUrl: process.env.AGOSTON_BACKEND_URL,
    bearerToken: process.env.AGOSTON_BACKEND_URL_BEARER_TOKEN
  });
  if (agostonClient.isAuthenticated()) {
    console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`);
  }

  // Demo backend
  const agostonClientDemo = await AgostonClient();
  if (agostonClientDemo.isAuthenticated()) {
    console.log(`Welcome user ${agostonClientDemo.userId()} 👋! Your role is: ${agostonClientDemo.userRole()}.`);
  }

})();

// promise with then/catch
AgostonClient({
  backendUrl: process.env.AGOSTON_BACKEND_URL,
  bearerToken: process.env.AGOSTON_BACKEND_URL_BEARER_TOKEN
}).then(async (agostonClient) => {
  if (agostonClient.isAuthenticated()) {
    console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`);
  }

  // Authentication
  var username = `test-js-client-${Date.now()}`
  agostonClient.loginOrSignUpFromProvider();
  agostonClient.loginOrSignUpFromProvider({ options: { redirectSuccess: '/profile', redirectError: '/login' } });
  agostonClient.loginOrSignUpFromProvider({ strategyName: "google-oauth20" });
  console.log(`# TEST: loginOrSignUpWithUserPassword with weak password`);
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

  console.log(`# TEST: loginOrSignUpWithUserPassword with allowed password`);
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

  console.log(`# TEST: logout`);
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
