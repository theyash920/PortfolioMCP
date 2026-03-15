const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || require('./sanity/env').projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || require('./sanity/env').dataset,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN // I might need to generate one, or what if I just use `npx sanity exec`?
});
// Wait, I don't need token if I run `npx sanity exec updateOrders.js --with-user-token`
