var AgostonClient = require('@agoston-io/client');
var { gql } = require('@apollo/client/core');

(async () => {

  // promise with async/await
  const agostonClient = await AgostonClient(process.env.AGOSTON_BACKEND_URL, process.env.AGOSTON_BACKEND_URL_BEARER_TOKEN);
  if (agostonClient.isAuthenticated) {
    console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`);
  }

  // promise with then/catch
  await AgostonClient(process.env.AGOSTON_BACKEND_URL, process.env.AGOSTON_BACKEND_URL_BEARER_TOKEN).then(agostonClient => {
    if (agostonClient.isAuthenticated()) {
      console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`);
    }
    agostonClient.loginOrSignUpFromProvider("google-oauth20")
    agostonClient.loginOrSignUpFromProvider("auth0-oidc")
    agostonClient.loginOrSignUpWithUserPassword("niolap", "password")
    agostonClient.logout()
    const apolloClient = agostonClient.createEmbeddedApolloClient()
    apolloClient.query({ query: gql`query {session}` }).then((result) => console.log(result));
  });

})();
