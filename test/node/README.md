# Test for the Agoston client

## Run test

```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
export AGOSTON_BACKEND_URL='https://graphile.agoston.dev.local:8043'
# Generate a valid token from the backend and export it below
export AGOSTON_BACKEND_URL_BEARER_TOKEN='1:VUGafcwQF1NuGac2j49elJ2AMEFsxP6pSWWg2dVTrF6xQggcZzJblWgpzu7YXsvyLBGclY'
npm install
npm run test
```
