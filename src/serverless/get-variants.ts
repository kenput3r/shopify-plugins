import { APIGatewayProxyEvent, Context } from "aws-lambda"
import fetch from "node-fetch"
import { getVariants, getVariantsAfter } from "../utils/queries"

interface FunctionParams extends APIGatewayProxyEvent {
  cursor?: string
  endpoint: string
  token: string
}

export async function handler(event: FunctionParams, context: Context) {
  const data = JSON.parse(event.body)
  const query = data.cursor ? getVariantsAfter : getVariants
  try {
    const response = await fetch(data.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Shopify-Access-Token": data.token,
      },
      body: JSON.stringify({
        query,
        variables: { cursor: data.cursor },
      }),
    })
    const Json = await response.json()
    console.log(Json)
    return {
      statusCode: 200,
      body: JSON.stringify(Json),
    }
  } catch (e) {
    console.log(e)
    return {
      statusCode: 418,
      body: JSON.stringify({ message: "There was an error", errors: e }),
    }
  }
}
