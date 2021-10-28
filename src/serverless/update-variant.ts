import { APIGatewayProxyEvent, Context } from "aws-lambda"
import fetch from "node-fetch"
import { productVariantUpdate } from "../utils/mutations"

interface FunctionParams extends APIGatewayProxyEvent {
  input: {
    id: string
    compareAtPrice?: number | string
    price?: number | string
  }
  endpoint: string
  token: string
}

export async function handler(event: FunctionParams, context: Context) {
  const data = JSON.parse(event.body)
  const query = productVariantUpdate
  const variables = { input: data.input }
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
      body: JSON.stringify({
        message: "There was an error",
        errors: e,
        variant: data.id,
      }),
    }
  }
}
