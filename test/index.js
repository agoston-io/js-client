var AgostonClient = require('@agoston-io/client');

// promise with then/catch
AgostonClient(process.env.BACKEND_URL, process.env.BACKEND_URL_BEARER_TOKEN).then(agostonClient => {
  console.log(agostonClient);
});

// promise with async/await
(async () => {
  try {
    const agostonClient = await AgostonClient(process.env.BACKEND_URL, process.env.BACKEND_URL_BEARER_TOKEN);
    console.log(agostonClient);
  } catch (err) {
    console.error(err);
  }
})();
