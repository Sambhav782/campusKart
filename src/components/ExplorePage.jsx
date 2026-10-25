import React from "react";
import Marketplace from "./Marketplace";

export default function ExplorePage(props) {
  return (
    <div className="explore-page">
      <div className="explore-intro">
        <span className="section-kicker">CampusKart marketplace</span>
        <h1>Explore</h1>
        <p>Browse campus finds, compare prices, and discover something useful.</p>
      </div>
      <Marketplace {...props} showFilters={true} pageTitle="All listings" />
    </div>
  );
}
