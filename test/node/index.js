var AgostonClient = require('@agoston-io/client');
var { gql } = require('@apollo/client/core');

(async () => {

  // promise with async/await
  const agostonClient = await AgostonClient({
    backendUrl: process.env.AGOSTON_BACKEND_URL,
    bearerToken: process.env.AGOSTON_BACKEND_URL_BEARER_TOKEN
  });
  if (agostonClient.isAuthenticated) {
    console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`);
  }

  // Demo backend
  const agostonClientDemo = await AgostonClient();
  if (agostonClientDemo.isAuthenticated) {
    console.log(`Welcome user ${agostonClientDemo.userId()} 👋! Your role is: ${agostonClientDemo.userRole()}.`);
  }

})();

// promise with then/catch
AgostonClient({
  backendUrl: process.env.AGOSTON_BACKEND_URL,
  bearerToken: process.env.AGOSTON_BACKEND_URL_BEARER_TOKEN
}).then(agostonClient => {
  if (agostonClient.isAuthenticated()) {
    console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`);
  }

  // Authentication
  agostonClient.loginOrSignUpFromProvider({ strategyName: "google-oauth20" });
  agostonClient.loginOrSignUpFromProvider({ strategyName: "auth0-oidc", options: { redirectSuccess: '/' } });
  agostonClient.loginOrSignUpWithUserPassword({ username: "niolap", password: "password", options: { redirectSuccess: '/' } });
  agostonClient.loginOrSignUpWithUserPassword({ username: "niolap", password: "password", options: { free_value: { dateOfBirth: "1986.01.12" }, redirectSuccess: '/' } });
  agostonClient.logout({ options: { redirectLogout: '/logout' } });

  // GraphQL
  const apolloClient = agostonClient.createEmbeddedApolloClient();
  apolloClient.query({ query: gql`query {session} ` }).then((result) => console.log(result));
});
