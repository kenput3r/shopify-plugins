export const getVariants = `
query GetVariants {
  productVariants(first: 100) {
    pageInfo {
      hasNextPage
    }
    edges {
      cursor
      node {
        id
        sku
        price
        compareAtPrice
        product {
          id
          title
        }
      }
    }
  }
}
`

export const getVariantsAfter = `
query GetVariantsAfter($cursor: String) {
  productVariants(first: 100, after: $cursor) {
    pageInfo {
      hasNextPage
    }
    edges {
      cursor
      node {
        id
        sku
        price
        compareAtPrice
        product {
          id
          title
        }
      }
    }
  }
}
`
