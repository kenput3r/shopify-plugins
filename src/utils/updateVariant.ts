interface VariantInput {
  id: string
  compareAtPrice?: number | string
  price?: number | string
}

export default async function updateVariant(
  input: VariantInput,
  endpoint: string,
  token: string
) {
  try {
    const response = await fetch("/.netlify/functions/update-variant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        input,
        endpoint,
        token,
      }),
    })
    const Json = await response.json()
    return Json
  } catch (e) {
    console.log("error", e)
    return { message: "Something went wrong", errors: e }
  }
}
