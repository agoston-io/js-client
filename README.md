# Agoston.io js client

A client that connects an [Agoston.io](https://agoston.io) backend to your frontend project.
The client allows you to authenticate and log out your users and exposes a preconfigured
Apollo client ready to handle your GraphQL queries, mutations, subscriptions and file uploads.

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

**NOTE:** For test purposes, you can just call the client with no parameters: `AgostonClient()`.
This will connect you to the default demo Agoston backend.

```js
// promise with async/await
const agostonClient = await AgostonClient({
  backendUrl: process.env.AGOSTON_BACKEND_URL,
});
if (agostonClient.isAuthenticated()) {
  console.log(
    `Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`
  );
}

// GraphQL
const apolloClient = agostonClient.createEmbeddedApolloClient();
apolloClient
  .query({
    query: gql`
      query {
        session
      }
    `,
  })
  .then((result) => console.log(result));
```

```js
// promise with then/catch
AgostonClient({ backendUrl: process.env.AGOSTON_BACKEND_URL }).then(
  (agostonClient) => {
    if (agostonClient.isAuthenticated()) {
      console.log(
        `Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`
      );
    }

    // GraphQL
    const apolloClient = agostonClient.createEmbeddedApolloClient();
    apolloClient
      .query({
        query: gql`
          query {
            session
          }
        `,
      })
      .then((result) => console.log(result));
  }
);
```

## Examples

### Create client with the demo backend

```js
AgostonClient().then(async (agostonClient) => {
  if (agostonClient.isAuthenticated()) {
    console.log(
      `Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`
    );
    console.log(`Auth provider: ${agostonClient.userAuthProvider()}`);
    console.log(`User data: ${agostonClient.userAuthData()}`);
  }
});
```

### Custom query

You may want to add an extra custom GraphQL query at the `AgostonClient` initialization time.
This query will be run within the backend and returned to the client, avoiding an extra round trip to the backend if you need to initialize application data, for instance.

```js
AgostonClient({
  backendUrl: process.env.AGOSTON_BACKEND_URL,
  customGraphQLQuery: {
    query: `query channels {
                channels {
                    totalCount
                    aggregates {
                        distinctCount {
                            userId
                        }
                    }
                }
            }`,
    variables: { id: 1 }, // if your query has variables
  },
}).then(async (agostonClient) => {
  customGraphQLQueryResult = agostonClient.customGraphQLQueryResult();
  // customGraphQLQueryResult:
  // {
  //   "data": {
  //     "channels": {
  //       "totalCount": 2703,
  //       "aggregates": {
  //         "distinctCount": {
  //           "userId": "55"
  //         }
  //       }
  //     }
  //   }
  // }
});
```

### Authenticate with user/password

```js
agostonClient
  .loginOrSignUpWithUserPassword({
    username: "niolap",
    password: "password7-F4-",
    options: {
      free_value: {
        dateOfBirth: "1986.01.12",
      },
      redirectSuccess: "/",
    },
  })
  .then((session) => {
    console.log(`auth_success: ${JSON.stringify(session)}`);
  })
  .catch((error) => {
    console.log(`auth_error: ${error}`);
  });
```

#### Change the user password

```js
await agostonClient
  .changeUserPaswword({
    username: username3,
    currentPassword: "easypassword",
    password: "simplepassword",
  })
  .then((session) => {
    console.log(`changeUserPaswword_success: ${JSON.stringify(session)}`);
  })
  .catch((error) => {
    console.log(`changeUserPaswword_error: ${JSON.stringify(error)}`);
  });
```

### Authenticate with bearer token

```js
AgostonClient({
  backendUrl: process.env.AGOSTON_BACKEND_URL,
  bearerToken: process.env.AGOSTON_BACKEND_URL_BEARER_TOKEN,
}).then(async (agostonClient) => {
  if (agostonClient.isAuthenticated()) {
    console.log(
      `Welcome user ${agostonClient.userId()} 👋! Your role is: ${agostonClient.userRole()}.`
    );
  }
});
```

### Authenticate with an external provider

```js
agostonClient.loginOrSignUpFromProvider({ strategyName: "google-oauth20" });
agostonClient.loginOrSignUpFromProvider({
  strategyName: "auth0-oidc",
  options: {
    redirectSuccess: "/profile",
    redirectError: "/login",
  },
});

agostonClient.loginOrSignUpFromProvider({ strategyName: "github-oauth20" });
agostonClient.loginOrSignUpFromProvider({
  strategyName: "auth0-oidc",
  options: {
    redirectSuccess: "/profile",
  },
});

agostonClient.loginOrSignUpFromProvider({ strategyName: "facebook-oauth20" });
agostonClient.loginOrSignUpFromProvider({
  strategyName: "auth0-oidc",
  options: {
    redirectSuccess: "/profile",
  },
});
```

### Logout

```js
agostonClient
  .logout()
  .then((session) => {
    console.log(`logout_success: ${JSON.stringify(session)}`);
    window.location.href = "/";
  })
  .catch((error) => {
    console.log(`logout_error: ${error}`);
  });
```

### GraphQL Query

The Agoston package comes with an embedded Apollo client preconfigured with your backend.
In most cases, it's good enough. You can create your own Apollo client if you need more specific Apollo configuration.

```js
AgostonClient({ backendUrl: process.env.AGOSTON_BACKEND_URL }).then(
  (agostonClient) => {
    const apolloClient = agostonClient.createEmbeddedApolloClient();
    apolloClient
      .query({
        query: gql`
          query {
            session
          }
        `,
      })
      .then((result) => console.log(result));
  }
);
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

## Agoston backend compatibility

| Client version | Minimum backend version | Maximum backend version |
| -------------- | ----------------------- | ----------------------- |
| >= 1.4.0       | >= 3.17.0               | none                    |
| >= 1.3.0       | >= 3.16.0               | < 3.17.0                |
