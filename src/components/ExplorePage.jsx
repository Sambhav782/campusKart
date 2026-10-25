import React from "react";
import Marketplace from "./Marketplace";

/** Dedicated /explore route: all listings, filters, and sorting. */
export default function ExplorePage(props) {
  return (
    <div className="explore-page">
      <Marketplace {...props} showFilters={true} pageTitle="All listings" />
    </div>
  );
}
