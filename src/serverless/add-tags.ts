import { APIGatewayProxyEvent, Context } from "aws-lambda"
import fetch from "node-fetch"
import { tagsAdd } from "../utils/mutations"

interface FunctionParams extends APIGatewayProxyEvent {
  id: string
  tags: [string]
  endpoint: string
  token: string
}

export async function handler(event: FunctionParams, context: Context) {
  const data = JSON.parse(event.body)
  const query = tagsAdd
  const variables = {
    id: data.id,
    tags: data.tags,
  }
  try {
    const response = await fetch(data.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Shopify-Access-Token": data.token,
      },
      body: JSON.stringify({ query, variables }),
    })
    const Json = await response.json()
    return {
      statusCode: 200,
      body: JSON.stringify(Json),
    }
  } catch (e) {
    console.log(e)
    return {
      statusCode: 418,
      body: JSON.stringify({ error: "There was an error" }),
    }
  }
}
