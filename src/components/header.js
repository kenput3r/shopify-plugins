import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"
import tw, { styled } from "twin.macro"

const Header = ({ siteTitle }) => (
  <Component>
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img className="h-8 w-8" src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg" alt="Workflow" />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className="homeButton">Home</Link>
                <Link to="/update-shopify-pricing">Update Shopify Pricing</Link>
                <Link to="/csv-from-skus">CSV From SKUs</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </Component>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header

const Component = styled.header`
  ${tw`mb-8`}
  a {
    ${tw`text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium`}
    &.homeButton {
      ${tw`bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium`}
    }
  }
`