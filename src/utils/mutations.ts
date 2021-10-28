export const productVariantUpdate = `    
mutation productVariantUpdate($input: ProductVariantInput!) {
  productVariantUpdate(input: $input) {
    product {
      title
    }
    productVariant {
      id
      title
    }
    userErrors {
      field
      message
    }
  }
}
`
export const tagsAdd = `
mutation tagsAdd($id: ID!, $tags: [String!]!) {
  tagsAdd(id: $id, tags: $tags) {
    node {
      id
    }
    userErrors {
      field
      message
    }
  }
}
`
