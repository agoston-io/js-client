var { AgostonClient } = require('@agoston-io/client');
var { gql } = require('@apollo/client/core');

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
}).then(agostonClient => {
  if (agostonClient.isAuthenticated()) {
    console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`);
  }

  // Authentication
  agostonClient.loginOrSignUpFromProvider({ strategyName: "google-oauth20" });
  agostonClient.loginOrSignUpWithUserPassword({ username: "niolap", password: "password", options: { redirectSuccess: '/' } });
  agostonClient.loginOrSignUpWithUserPassword({ username: "niolap", password: "password", options: { free_value: { dateOfBirth: "1986.01.12" }, redirectSuccess: '/' } });
  console.log(`agostonClient.session() => ${JSON.stringify(agostonClient.session())}`);
  console.log(`agostonClient.userId() => ${JSON.stringify(agostonClient.userId())}`);
  console.log(`agostonClient.userAuthProvider() => ${JSON.stringify(agostonClient.userAuthProvider())}`);
  console.log(`agostonClient.userAuthSubject() => ${JSON.stringify(agostonClient.userAuthSubject())}`);
  console.log(`agostonClient.userAuthData() => ${JSON.stringify(agostonClient.userAuthData())}`);
  console.log(`agostonClient.userRole() => ${JSON.stringify(agostonClient.userRole())}`);
  console.log(`agostonClient.sessionId() => ${JSON.stringify(agostonClient.sessionId())}`);
  agostonClient.apolloClient();
  agostonClient.apolloProvider();
  agostonClient.logout({ options: { redirectLogout: '/logout' } });

  // GraphQL
  const apolloClient = agostonClient.createEmbeddedApolloClient();
  apolloClient.query({ query: gql`query {session} ` }).then((result) => console.log(result));
  const apolloProvider = agostonClient.createEmbeddedApolloProvider();
  apolloClient2 = agostonClient.apolloClient();
  apolloClient2.query({ query: gql`query {session} ` }).then((result) => console.log(result));
});
