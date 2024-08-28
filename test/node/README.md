# Test for the Agoston client

## Run test

```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
export AGOSTON_BACKEND_URL='https://graphile.agoston.dev.local:8043'
# Generate a valid token from the backend and export it below
export AGOSTON_BACKEND_URL_BEARER_TOKEN='167:TeCUvJ6h8k2btsxRA0W1UpKPAV2BNmFURU1DFWEEb9QJgfS036YxmhXWwLDw5kPfe44'
npm install
npm run test
```
