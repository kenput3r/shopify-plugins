interface TagsInput {
  id: string
  tags: [string]
}

export default async function addTags(
  input: TagsInput,
  endpoint: string,
  token: string
) {
  try {
    const response = await fetch("/.netlify/functions/add-tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        id: input.id,
        tags: input.tags,
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
