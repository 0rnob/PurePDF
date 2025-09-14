import * as contentful from 'contentful';

// We get the credentials from environment variables.
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

// We only create a client if both credentials are provided.
// This prevents the application from crashing on startup if the blog
// feature is not configured. The BlogPage component will handle the
// case where the client is null.
export const contentfulClient = (SPACE_ID && ACCESS_TOKEN)
  ? contentful.createClient({
      space: SPACE_ID,
      accessToken: ACCESS_TOKEN,
    })
  : null;
