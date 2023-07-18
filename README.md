# Agoston.io js client

## TODO

- TODO: private function // attribute
- TODO: if no backendUrl provided, go to demo one with demo message WEB
- TODO: auth for subscription? Working with WEB?
- TODO: make next scroll liveshooping working
---
- TODO: doc here with more examples + explanations + link to docs quick start

## Implement

### 1. Install the library

```bash
npm install @agoston-io/client
```

### 2. Import

```bash
import { AgostonClient } from '@agoston-io/client'
```

### 3. Create the client

```js
// promise with async/await
const agostonClient = await AgostonClient(process.env.AGOSTON_BACKEND_URL);
if (agostonClient.isAuthenticated) {
    console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`);
}
```

```js
// promise with then/catch
AgostonClient(process.env.AGOSTON_BACKEND_URL).then(agostonClient => {
    if (agostonClient.isAuthenticated()) {
        console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`);
    }
});
```

## Examples

### Create client with the demo backend

```js
AgostonClient().then(agostonClient => {
    if (agostonClient.isAuthenticated()) {
        console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`);
    }
});
```

### Authenticate with user/password

```js
agostonClient.loginOrSignUpWithUserPassword("niolap", "password")
```

### Authenticate with bearer token

```js
agostonClient.loginOrSignUpWithUserPassword("niolap", "password")
```

### Authenticate with an external provider

```js
agostonClient.loginOrSignUpFromProvider("google-oauth20")
agostonClient.loginOrSignUpFromProvider("github-oauth20")
agostonClient.loginOrSignUpFromProvider("facebook-oauth20")
```

### GraphQL Query

The Agoston package comes with an embedded Apollo client preconfigured with your backend.
In most cases, it's good enough. You can create your own Apollo client if you need more specific Apollo configuration.

```js
const apolloClient = agostonClient.createEmbeddedApolloClient()
apolloClient.query({ query: gql`query {session}` }).then((result) => console.log(result));
```

```js
// return
{
  data: {
    session: {
      role: 'authenticated',
      user_id: 3,
      auth_data: {},
      session_id: 'yXV_RXuVYhnrOLOB_A-tVRzxJBYb4z8_',
      auth_subject: '3',
      auth_provider: 'http-bearer',
      is_authenticated: true
    }
  },
  loading: false,
  networkStatus: 7
}
```