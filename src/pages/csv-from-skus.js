import React from "react"
import styled from "styled-components"
import { CSVReader, jsonToCSV } from "react-papaparse"
import Layout from "../components/layout"

function handleOnError() {
  console.log("an error has occured")
}

function handleOnRemoveFile() {
  console.log("the file has been removed")
}

async function preventThrottle() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("I have waited long enough")
    }, 2000)
  })
}

async function fetchProducts() {
  let products = []
  try {
    const response = await fetch("/.netlify/functions/get-products", {
      method: "POST",
      type: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ message: "hello" }),
    })
    console.log(response)
    const Json = await response.json()
    console.log(Json)
    console.log("fetched page 1")
    products = products.concat(Json.data.productVariants.edges)
    if (Json.data.productVariants.pageInfo.hasNextPage) {
      const {
        data: {
          productVariants: { edges },
        },
      } = Json
      console.log("edges", edges)
      let { cursor } = edges[edges.length - 1]
      let hasNextPage = true
      while (hasNextPage) {
        await preventThrottle()
        try {
          const _response = await fetch(
            "/.netlify/functions/get-products-after",
            {
              method: "POST",
              type: "cors",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                cursor,
              }),
            }
          )
          const _Json = await _response.json()
          products = products.concat(_Json.data.productVariants.edges)
          console.log(products)
          if (_Json.data.productVariants.pageInfo.hasNextPage) {
            const {
              data: {
                // eslint-disable-next-line no-shadow
                productVariants: { edges },
              },
            } = _Json
            cursor = edges[edges.length - 1].cursor
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
  return products
}

function processData(data) {
  const returnData = []
  data.forEach(obj => {
    returnData.push(obj.data)
  })
  return returnData
}

async function handleOnDrop(data) {
  const products = await fetchProducts()
  const processedData = processData(data)
  console.log(processedData)
  const newArray = []
  processedData.forEach(item => {
    products.forEach(variant => {
      if (variant.node.sku) {
        if (variant.node.sku.includes(item.SKU)) {
          const newObject = {
            sku: variant.node.sku,
            title: variant.node.product.title,
            originalPrice: variant.node.price,
            originalCompareAtPrice: variant.node.compareAtPrice,
            salePrice: item.NewRetail,
            saleCompareAtPrice:
              variant.node.compareAtPrice || variant.node.price,
          }
          newArray.push(newObject)
        }
      }
    })
  })
  const csv = jsonToCSV(newArray)
  const _data = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(_data)
  const virtualButton = document.createElement("a")
  virtualButton.href = url
  virtualButton.setAttribute("download", "price-updates.csv")
  virtualButton.click()
}

const CsvFromSkus = () => {
  console.log("hello")
  return (
    <Layout>
      <Page>
        <h2>Generate A Formatted CSV From A Non Formatted CSV</h2>
        <form>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="FileInput">
            CSV <br />
            <CSVReader
              id="FileInput"
              onFileLoad={handleOnDrop}
              onError={handleOnError}
              noDrag
              config={{ header: true }}
              style={{}}
              onRemoveFile={handleOnRemoveFile}
            >
              <div>Upload File</div>
            </CSVReader>
          </label>
        </form>
      </Page>
    </Layout>
  )
}

export default CsvFromSkus

const Page = styled.div``
