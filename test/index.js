var AgostonClient = require('@agoston-io/client');

// promise with then/catch
AgostonClient(process.env.BACKEND_URL, process.env.BACKEND_URL_BEARER_TOKEN).then(agostonClient => {
  if (agostonClient.isAuthenticated()) {
    console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is ${agostonClient.userRole()}.`);
  }
});

// promise with async/await
(async () => {
  try {
    const agostonClient = await AgostonClient(process.env.BACKEND_URL, process.env.BACKEND_URL_BEARER_TOKEN);
    if (agostonClient.isAuthenticated) {
      console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is ${agostonClient.userRole()}.`);
    }
  } catch (err) {
    console.error(err);
  }
})();
