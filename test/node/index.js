var { AgostonClient } = require('@agoston-io/client');
var assert = require('assert');

/**
 * This test is based on a backend configuration allowing the
 * user creation "on the fly" while log in for the first time.
 */

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
}).then(async agostonClient => {

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
  var username1 = `user-${Date.now()}`
  var username2 = `user-${Date.now() + 1}`
  var username3 = `user-${Date.now() + 2}`
  await agostonClient.loginOrSignUpFromProvider({ strategyName: "google-oauth20", options: { redirectSuccess: '/profile', redirectError: '/login' } });
  await agostonClient.loginOrSignUpFromProvider({ strategyName: "google-oauth20" });

  // loginOrSignUpWithUserPassword with weak password must fail
  await agostonClient.loginOrSignUpWithUserPassword({
    username: username1,
    password: "password2024",
    freeValue: {
      dateOfBirth: "1986.01.12"
    },
    signUpOnly: false,
  }).then(session => {
    console.log(`auth_success: ${JSON.stringify(session)}`)
  }).catch(error => {
    console.log(`auth_error: ${JSON.stringify(error)}`)
  });
  assert(typeof agostonClient.isAuthenticated() === "boolean");
  assert(!agostonClient.isAuthenticated());
  assert(typeof agostonClient.userRole() === "string");
  assert(agostonClient.userRole() === "anonymous");
  assert(typeof agostonClient.userId() === "number");
  assert(agostonClient.userId() === 0);

  // loginOrSignUpWithUserPassword with allowed password must succeed
  await agostonClient.loginOrSignUpWithUserPassword({
    username: username1,
    password: "easypassword",
    options: {
      freeValue: {
        dateOfBirth: "1986.01.12"
      },
      signUpOnly: false,
    }
  }).then(session => {
    console.log(`auth_success: ${JSON.stringify(session)}`)
  }).catch(error => {
    console.log(`auth_error: ${JSON.stringify(error)}`)
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
  assert(agostonClient.userAuthSubject() === username1);
  assert(typeof agostonClient.userAuthData() === "object");
  assert(agostonClient.userAuthData()["dateOfBirth"] === "1986.01.12");
  assert(typeof agostonClient.userRole() === "string");
  assert(agostonClient.userRole() === "authenticated");
  assert(typeof agostonClient.sessionId() === "string");
  assert(typeof agostonClient.apolloClient() === "object");
  assert(typeof agostonClient.apolloClient() === "object");

  /**
   * loginOrSignUpWithUserPassword when already logged in with
   * allowed password must work.
   */
  await agostonClient.loginOrSignUpWithUserPassword({
    username: username2,
    password: "easypassword",
    options: {
      freeValue: {
        dateOfBirth: "2014.01.12"
      },
      signUpOnly: false,
    }
  }).then(session => {
    console.log(`auth_success: ${JSON.stringify(session)}`)
  }).catch(error => {
    console.log(`auth_error: ${JSON.stringify(error)}`)
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
  assert(agostonClient.userAuthSubject() === username2);
  assert(typeof agostonClient.userAuthData() === "object");
  assert(agostonClient.userAuthData()["dateOfBirth"] === "2014.01.12");
  assert(typeof agostonClient.userRole() === "string");
  assert(agostonClient.userRole() === "authenticated");
  assert(typeof agostonClient.sessionId() === "string");
  assert(typeof agostonClient.apolloClient() === "object");
  assert(typeof agostonClient.apolloClient() === "object");

  /**
   * Sign up only with allowed password but existing user
   * should not be possible and return an explicit message
   * to the user.
   */
  await agostonClient.loginOrSignUpWithUserPassword({
    username: username1,
    password: "easypassword",
    options: {
      freeValue: {
        dateOfBirth: "1986.01.12",
      },
      signUpOnly: true,
    }
  }).then(session => {
    console.log(`signup_success: ${JSON.stringify(session)}`)
  }).catch(error => {
    assert(error.message === "user-already-exists");
    console.log(`signup_error: ${JSON.stringify(error)}`)
  });
  assert(typeof agostonClient.isAuthenticated() === "boolean");
  assert(!agostonClient.isAuthenticated());
  assert(typeof agostonClient.userRole() === "string");
  assert(agostonClient.userRole() === "anonymous");
  assert(typeof agostonClient.userId() === "number");
  assert(agostonClient.userId() === 0);

  /**
   * Sign up only with allowed password and a new user
   * should be possible and return.
   */
  await agostonClient.loginOrSignUpWithUserPassword({
    username: username3,
    password: "easypassword",
    options: {
      freeValue: {
        dateOfBirth: "2023.01.12",
      },
      signUpOnly: true,
    }
  }).then(session => {
    console.log(`signup_success: ${JSON.stringify(session)}`)
  }).catch(error => {
    console.log(`signup_error: ${JSON.stringify(error)}`)
  });
  assert(typeof agostonClient.isAuthenticated() === "boolean");
  assert(!agostonClient.isAuthenticated());
  assert(typeof agostonClient.userRole() === "string");
  assert(agostonClient.userRole() === "anonymous");
  assert(typeof agostonClient.userId() === "number");
  assert(agostonClient.userId() === 0);

  /**
   * Login with user 3 create from previous signup
   * should work.
   */
  await agostonClient.loginOrSignUpWithUserPassword({
    username: username3,
    password: "easypassword",
  }).then(session => {
    console.log(`login_success: ${JSON.stringify(session)}`)
  }).catch(error => {
    console.log(`login_error: ${JSON.stringify(error)}`)
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
  assert(agostonClient.userAuthSubject() === username3);
  assert(typeof agostonClient.userAuthData() === "object");
  assert(agostonClient.userAuthData()["dateOfBirth"] === "2023.01.12");
  assert(typeof agostonClient.userRole() === "string");
  assert(agostonClient.userRole() === "authenticated");
  assert(typeof agostonClient.sessionId() === "string");
  assert(typeof agostonClient.apolloClient() === "object");
  assert(typeof agostonClient.apolloClient() === "object");

  // Change the user password with wrong current password
  await agostonClient.changeUserPaswword({
    username: username3,
    currentPassword: "wrong",
    password: "simplepassword",
  }).then(session => {
    console.log(`changeUserPaswword_success: ${JSON.stringify(session)}`)
    assert(false);
  }).catch(error => {
    console.log(`changeUserPaswword_error: ${JSON.stringify(error)}`)
    assert(true);
  });

  // Change the user password with correct current password
  await agostonClient.changeUserPaswword({
    username: username3,
    currentPassword: "easypassword",
    password: "simplepassword",
  }).then(session => {
    console.log(`changeUserPaswword_success: ${JSON.stringify(session)}`)
    assert(true);
  }).catch(error => {
    console.log(`changeUserPaswword_error: ${JSON.stringify(error)}`)
    assert(false);
  });

  // Login with previous password should fail
  await agostonClient.loginOrSignUpWithUserPassword({
    username: username3,
    password: "easypassword",
  }).then(session => {
    console.log(`login_success: ${JSON.stringify(session)}`)
    assert(false);
  }).catch(error => {
    console.log(`login_error: ${JSON.stringify(error)}`)
    assert(true);
  });

  // Login with new password should work
  await agostonClient.loginOrSignUpWithUserPassword({
    username: username3,
    password: "simplepassword",
  }).then(session => {
    console.log(`login_success: ${JSON.stringify(session)}`)
    assert(true);
  }).catch(error => {
    console.log(`login_error: ${JSON.stringify(error)}`)
    assert(false);
  });

  // logout
  await agostonClient.logout({
    options: { redirectLogout: 'https://example.com' }
  }).then(session => {
    console.log(`logout_success: ${JSON.stringify(session)}`)
  }).catch(error => {
    console.log(`logout_error: ${JSON.stringify(error)}`)
  });

  assert(typeof agostonClient.isAuthenticated() === "boolean");
  assert(!agostonClient.isAuthenticated());
  assert(agostonClient.userRole() === "anonymous");

});

