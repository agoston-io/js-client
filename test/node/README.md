# Test for the Agoston client

## TODO

- auth for subscription? Working with WEB?
- Nicer auth page
- doc here with more examples + explanations + link to docs quick start
- clean this help + force commit level 1
---------------------------------- send people
- make next scroll liveshooping working

## Run test

```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
export AGOSTON_BACKEND_URL='https://graphile.agoston-dev.io/'
export AGOSTON_BACKEND_URL_BEARER_TOKEN='sHVTs0hWmlhmrmlFApXuegK7UjwaunCKHYZbHkwgTRkZR9NNvjEqL6dqGZ1Ya51uTa0eswMMwcxUn6ZTXHjltJ0t9JzZCWHUNucG8EYEfFsY2ghFH1EaFWPr'
export AGOSTON_DEMO_BACKEND_URL='https://graphile.agoston-dev.io'
npm install
npm run test
```

