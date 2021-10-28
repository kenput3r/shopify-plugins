import React, { useEffect, useState } from "react"
import { CSVReader, jsonToCSV } from "react-papaparse"
import tw, { styled } from "twin.macro"
import Layout from "../components/layout"
import getVariants from "../utils/getVariants"
import updateVariant from "../utils/updateVariant"
import addTags from "../utils/addTags"
import { preventThrottle } from "../utils/utils"

interface CsvData {
  data: {
    SKU: string
    NewPrice: number
    NewCompareAtPrice: number
  }
}

interface ProductVariant {
  cursor: string
  node: {
    compareAtPrice: number | string | null
    id: string
    price: number | string
    product: {
      id: string
      title: string
    }
    sku: string
  }
}

interface Variant {
  id: string
  productId: string
  sku: string
  title: string
  originalPrice: number | string
  originalCompareAtPrice: number | string | null
  newPrice: number | string
  newCompareAtPrice: number | string
}

function handleOnError() {
  alert("There was an error uploading your file")
}

function handleOnRemoveFile() {
  console.log("the file has been removed")
}

function handleTagsChange(input: string, setState: React.SetStateAction<any>) {
  const tags = input.split(",")
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i].trim()
    if (tag.length) {
      tags[i] = tag
    } else {
      tags.splice(i, i + 1)
    }
  }
  setState(tags)
}

function match(sku1: string, sku2: string, exactMatching: boolean) {
  if (exactMatching) {
    return sku1 === sku2
  } else {
    return sku1.includes(sku2)
  }
}

function generateCsv(data: any[], fileName: string) {
  const csv = jsonToCSV(data)
  const _data = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(_data)
  const virtualButton = document.createElement("a")
  virtualButton.href = url
  virtualButton.setAttribute("download", `${fileName}.csv`)
  virtualButton.click()
}

function buildArrays(
  products: Array<ProductVariant>,
  csv: Array<CsvData>,
  exactMatching: boolean
) {
  const variantsArray: Variant[] = []
  const productsArray: string[] = []
  csv.forEach(({ data: csvVariant }) => {
    products.forEach(apiVariant => {
      if (apiVariant.node.sku) {
        if (match(apiVariant.node.sku, csvVariant.SKU, exactMatching)) {
          const newObject = {
            id: apiVariant.node.id,
            productId: apiVariant.node.product.id,
            sku: apiVariant.node.sku,
            title: apiVariant.node.product.title,
            originalPrice: apiVariant.node.price,
            originalCompareAtPrice: apiVariant.node.compareAtPrice,
            newPrice: csvVariant.NewPrice,
            newCompareAtPrice: csvVariant.NewCompareAtPrice
              ? csvVariant.NewCompareAtPrice
              : null,
          }
          variantsArray.push(newObject)
          if (productsArray.indexOf(apiVariant.node.product.id) === -1) {
            productsArray.push(apiVariant.node.product.id)
          }
        }
      }
    })
  })
  return { variantsArray, productsArray }
}

async function updateShopify(
  data: [CsvData],
  endpoint: string,
  token: string,
  tags: [string],
  exactMatching: boolean
) {
  const products = await getVariants(endpoint, token)
  const variantUpdateSuccesses = []
  const variantUpdateFailures = []
  const addTagSuccesses = []
  const addTagFailures = []
  const { variantsArray, productsArray } = buildArrays(
    products,
    data,
    exactMatching
  )
  console.log(variantsArray)
  console.log(productsArray)
  // for each variant, update price
  for (let i = 0; i < variantsArray.length; i++) {
    const variant = variantsArray[i]
    const input = {
      id: variant.id,
      compareAtPrice: variant.newCompareAtPrice,
      price: variant.newPrice,
    }
    const message = await preventThrottle(500)
    console.log(message, i)
    const response = await updateVariant(input, endpoint, token)
    console.log(response)
    if (
      !response.errors &&
      !response.data.errors &&
      !response.data.productVariantUpdate.userErrors.length
    ) {
      variantUpdateSuccesses.push(response)
    } else {
      variantUpdateFailures.push(response)
    }
  }
  if (tags && tags.length) {
    // for each product, add tag
    for (let i = 0; i < productsArray.length; i++) {
      const id = productsArray[i]
      const message = await preventThrottle(500)
      console.log(message, i)
      const response = await addTags({ id, tags }, endpoint, token)
      if (!response.data.errors && !response.data.tagsAdd.userErrors.length) {
        addTagSuccesses.push(response)
      } else {
        addTagFailures.push(response)
      }
    }
  }
  console.log("variant successes", variantUpdateSuccesses)
  console.log("variant failures", variantUpdateFailures)
  console.log("tag successes", addTagSuccesses)
  console.log("tag failures", addTagFailures)
  generateCsv(variantsArray, "price-updates")
}

const UpdateShopifyPricing = () => {
  const [csvData, setCsvData] = useState<[CsvData] | undefined>(undefined)
  const [isFileReady, setIsFileReady] = useState(false)
  const [endpoint, setEndpoint] = useState("")
  const [token, setToken] = useState("")
  const [tags, setTags] = useState<[string] | undefined>(undefined)
  const [exactMatching, setExactMatching] = useState(true)
  useEffect(() => {
    if (endpoint && token && csvData) {
      setIsFileReady(true)
    }
  }, [endpoint, token, csvData])
  return (
    <Layout>
      <div className="font-mono">
        <h2 className="text-2xl">Update Product Pricing</h2>
        <form className="bg-white border mt-8 p-4 rounded shadow">
          <div className="grid grid-cols-2 mb-4 mt-4">
            <h3 className="col-span-2 mb-4 text-xl">
              Step 1 <br />
              <small>
                input your Shopify Admin API graphql enpoint url and token
              </small>
            </h3>
            <div className="col-span-1 p-2">
              <label htmlFor="Endpoint">
                Endpoint <br />
                <Input
                  type="text"
                  id="Endpoint"
                  placeholder="https://your-store.myshopify.com/admin/api/2021-01/graphql"
                  onChange={e =>
                    setEndpoint((e.target as HTMLInputElement).value)
                  }
                />
              </label>
            </div>
            <div className="col-span-1 p-2">
              <label htmlFor="Token">
                Token <br />
                <Input
                  type="text"
                  id="Token"
                  placeholder="shppa_54fc9axxxxxxxxxxe9f407504f97a2d9"
                  onChange={e => setToken((e.target as HTMLInputElement).value)}
                />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 mb-4 mt-4">
            <h3 className="col-span-2 mb-4 text-xl">
              Step 2 <br />
              <small>input tags to be added to products, if any</small>
            </h3>
            <div className="col-span-2 p-2">
              <label htmlFor="Tags">
                Tags <br />
                <Input
                  type="text"
                  id="Tags"
                  placeholder="On Sale, Black Friday, Last Chance"
                  onChange={e =>
                    handleTagsChange(
                      (e.target as HTMLInputElement).value,
                      setTags
                    )
                  }
                />
              </label>
            </div>
          </div>
          <div>
            <h3 className="text-xl">Step 3</h3>
            <label>
              upload your CSV{" "}
              <small>
                <button
                  className="text-blue-500"
                  onClick={() =>
                    generateCsv(
                      [
                        {
                          SKU: "S001BL",
                          NewPrice: 19.99,
                          NewCompareAtPrice: 24.99,
                        },
                      ],
                      "example-file"
                    )
                  }
                >
                  sample file
                </button>
              </small>{" "}
              <br />
              <CSVReader
                onFileLoad={data => setCsvData(data)}
                onError={handleOnError}
                noDrag
                config={{ header: true }}
                style={{}}
                onRemoveFile={handleOnRemoveFile}
              >
                <div>Select File</div>
              </CSVReader>
            </label>
          </div>
          <div className="grid grid-cols-2 mb-4 mt-4">
            <h3 className="col-span-2 mb-4 text-xl">
              Step 4 <br />
              <small>select SKU matching type and start 'er up</small>
            </h3>
            <div className="col-span-2 p-2 text-right">
              <label htmlFor="MatchingType">
                Use Exact Matching
                <input
                  className="mr-4"
                  id="MatchingType"
                  type="checkbox"
                  checked={exactMatching}
                  onChange={() => setExactMatching(!exactMatching)}
                />
              </label>
              <Button
                className=".btn"
                type="button"
                disabled={!isFileReady}
                value="Update Pricing"
                onClick={() =>
                  updateShopify(csvData, endpoint, token, tags, exactMatching)
                }
              />
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default UpdateShopifyPricing

const Button = styled.input`
  ${tw`bg-blue-500 cursor-pointer disabled:opacity-50 inline-block ml-auto p-4 rounded text-white`}
`
const Input = styled.input`
  ${tw`border focus:border-blue-500 focus:ring-blue-500 h-8 rounded shadow-sm text-xs w-full`}
`
