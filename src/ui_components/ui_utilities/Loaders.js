import React from "react";
import Loader from "react-loader-spinner";

export const LoaderLarge = ({ type }) => (
    <div className="loader">
        <Loader type={type} color="gray" height={50} width={50} />
    </div>
);

export const LoaderSmall = ({ type }) => (
    <div className="loader">
        <Loader type={type} color="gray" height={28} width={28} />
    </div>
);

export const BannerLoader = ({ type }) => (
    <div className="loader">
        <Loader type={type} color="gray" height={80} width={80} />
    </div>
);
