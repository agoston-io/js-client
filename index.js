class Client {

  async init(backendUrl, bearerToken) {
    if (backendUrl === undefined) {
      throw new Error('no backend url provided in "backendUrl".');
    }
    this.backendUrl = backendUrl;
    if (backendUrl.slice(-1) === '/') {
      this.backendUrl = backendUrl.slice(0, -1)
    }
    this.headers = {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    }
    if (bearerToken !== undefined) {
      this.headers['Authorization'] = 'Bearer ' + bearerToken;
    }
    await this.loadConfiguration();
    await this.loadSession();
    return this;
  };

  async loadConfiguration() {
    const options = {
      method: "GET",
      headers: this.headers,
    };
    const response = await fetch(`${this.backendUrl}/.well-known/configuration`, options);
    this.configuration = await response.json();
  }

  async loadSession() {
    const options = {
      method: "POST",
      credentials: "include",
      headers: this.headers,
      body: JSON.stringify({
        query: 'query { session }'
      }),
    };
    const response = await fetch(`${this.backendUrl}/data/graphql`, options);
    var s = await response.json();
    this.session = {}
    this.session.role = s.data.session.role
    this.session.userId = s.data.session.user_id
    this.session.sessionID = s.data.session.session_id
    this.session.isAuthenticated = s.data.session.is_authenticated
  }
}

async function AgostonClient(backendUrl, bearerToken) {
  c = new Client()
  return c.init(backendUrl, bearerToken)
}

module.exports = AgostonClient;
