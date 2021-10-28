import { preventThrottle } from "./utils"

export default async function getVariants(endpoint: string, token: string) {
  console.log(endpoint)
  let variants = []
  try {
    // get the first 100 variants
    const response = await fetch("/.netlify/functions/get-variants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ endpoint, token }),
    })
    const Json = await response.json()
    console.log(Json)
    console.log("fetched page 1")
    variants = variants.concat(Json.data.productVariants.edges)

    // get the remaining variants, 100 at a time
    if (Json.data.productVariants.pageInfo.hasNextPage) {
      const {
        data: {
          productVariants: { edges },
        },
      } = Json
      let { cursor } = edges[edges.length - 1]
      let hasNextPage = true
      while (hasNextPage) {
        await preventThrottle(1100)
        try {
          const _response = await fetch("/.netlify/functions/get-variants", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              endpoint,
              token,
              cursor,
            }),
          })
          const _Json = await _response.json()
          console.log(_Json)
          variants = variants.concat(_Json.data.productVariants.edges)
          console.log(variants)
          if (_Json.data.productVariants.pageInfo.hasNextPage) {
            const {
              data: {
                productVariants: { edges: _edges },
              },
            } = _Json
            cursor = _edges[_edges.length - 1].cursor
          } else {
            hasNextPage = false
          }
        } catch (e) {
          console.log(e)
          hasNextPage = false
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
  return variants
}
