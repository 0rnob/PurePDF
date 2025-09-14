import * as contentful from 'contentful';

// IMPORTANT: These should be set as environment variables in your hosting provider.
// Do not commit them directly into your code. The component using this client
// will handle errors if these are not configured.
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID || '';
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN || '';

export const contentfulClient = contentful.createClient({
  space: SPACE_ID,
  accessToken: ACCESS_TOKEN,
});
