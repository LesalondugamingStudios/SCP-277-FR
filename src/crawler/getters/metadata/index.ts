/*
 * Copyright (C) 2023-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { CromResponse, WikiMetadata } from "../../../types"
import { generateUserAgent } from "../../../config"

const query = `query GetSCP($url: URL!) {
  page(url: $url) {
    wikidotInfo {
      rating
      voteCount
      createdBy {
        name
      }
      createdAt
    }
  }
}`

export async function getMetadata(url: string): Promise<WikiMetadata> {
  try {
    const data = await cromRequest({ url })
    return { url, rating: `${data.page.wikidotInfo.rating}/${data.page.wikidotInfo.voteCount}`, author: data.page.wikidotInfo.createdBy.name, at: new Date(data.page.wikidotInfo.createdAt).toDateString() }
  } catch(error) {
    console.error(error)
    return { url, rating: "0", author: "unknown", at: "unknown" }
  }
}

async function cromRequest(variables: {[key: string]: any}): Promise<CromResponse> {
  const response = await fetch("https://api.crom.avn.sh/graphql", {
    method: "POST",
    headers: {
      "User-Agent": generateUserAgent(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(variables ? { query, variables } : { query })
  });

  if (!response.ok) {
    throw new Error("Got status code: " + response.status);
  }
  
  const { data, errors } = await response.json() as { data: CromResponse, errors?: any };

  if (errors && errors.length > 0) {
    throw new Error("Got errors: " + JSON.stringify(errors));
  }

  return data;
}