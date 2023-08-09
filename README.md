# Agoston.io js client

Client that connect an [Agoston.io](https://agoston.io) backend to you Vue.JS project.

## Usage

### 1. Install the library

```bash
npm install @agoston-io/client
```

### 2. Import

```bash
import { AgostonClient } from '@agoston-io/client'
```

### 3. Create the client

**NOTE:** if you don't have any backend yet, just call the client with no parameters: `AgostonClient()`.

```js
// promise with async/await
const agostonClient = await AgostonClient({ backendUrl: process.env.AGOSTON_BACKEND_URL });
if (agostonClient.isAuthenticated()) {
    console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`);
}

// GraphQL
const apolloClient = agostonClient.createEmbeddedApolloClient();
apolloClient.query({ query: gql`query {session} ` }).then((result) => console.log(result));
```

```js
// promise with then/catch
AgostonClient({ backendUrl: process.env.AGOSTON_BACKEND_URL }).then(agostonClient => {

    if (agostonClient.isAuthenticated()) {
        console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`);
    }

    // GraphQL
    const apolloClient = agostonClient.createEmbeddedApolloClient();
    apolloClient.query({ query: gql`query {session} ` }).then((result) => console.log(result));

});
```

## Examples

### Create client with the demo backend

```js
AgostonClient().then(agostonClient => {
    if (agostonClient.isAuthenticated()) {
        console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`);
        console.log(`Auth provider: ${agostonClient.userAuthProvider()}`);
        console.log(`User data: ${agostonClient.userAuthData()}`);
    }
});
```

### Authenticate with user/password

```js
var err = await agostonClient.loginOrSignUpWithUserPassword({
    username: "niolap",
    password: "password",
});
var err = await agostonClient.loginOrSignUpWithUserPassword({
    username: "niolap",
    password: "password",
    data: {
        dateOfBirth: "1986.01.12"
    }
});
if (err) {
    console.log(`Login error: ${err}`)
}
```

### Authenticate with bearer token

```js
AgostonClient({
  backendUrl: process.env.AGOSTON_BACKEND_URL,
  bearerToken: process.env.AGOSTON_BACKEND_URL_BEARER_TOKEN
}).then(agostonClient => {
  if (agostonClient.isAuthenticated()) {
    console.log(`Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`);
  }
});
```

### Authenticate with an external provider

```js
agostonClient.loginOrSignUpFromProvider({ strategyName: "google-oauth20" });
agostonClient.loginOrSignUpFromProvider({
    strategyName: "auth0-oidc",
    options: {
        redirectSuccess: '/profile',
        redirectError: '/login'
    }
});

agostonClient.loginOrSignUpFromProvider({ strategyName: "github-oauth20" });
agostonClient.loginOrSignUpFromProvider({
    strategyName: "auth0-oidc",
    options: {
        redirectSuccess: '/profile'
    }
});

agostonClient.loginOrSignUpFromProvider({ strategyName: "facebook-oauth20" });
agostonClient.loginOrSignUpFromProvider({
    strategyName: "auth0-oidc",
    options: {
        redirectSuccess: '/profile'
    }
});
```

### GraphQL Query

The Agoston package comes with an embedded Apollo client preconfigured with your backend.
In most cases, it's good enough. You can create your own Apollo client if you need more specific Apollo configuration.

```js
AgostonClient({ backendUrl: process.env.AGOSTON_BACKEND_URL }).then(agostonClient => {

    const apolloClient = agostonClient.createEmbeddedApolloClient();
    apolloClient.query({ query: gql`query {session} ` }).then((result) => console.log(result));

});
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