import React from "react";
import PropTypes from "prop-types";
import {BsFillPieChartFill} from "react-icons/bs";
import moment from "moment";

export default function CardStats({
  statSubtitle,
  statTitle,
  statArrow,
  statPercent,
  statPercentColor,
  statDescripiron,
  statIconName,
  statIconColor,
  customClasses,
}) {
  return (
      <>
          <div
              className={`relative flex flex-col min-w-0 break-words rounded mb-6 xl:mb-0 shadow-lg ${customClasses}`}
          >
              <div className="flex-auto p-4">
                  <div className="flex flex-wrap">
                      <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                          <h5
                              className={`uppercase font-bold text-xs ${
                                  customClasses === "bg-white"
                                      ? "text-blueGray-400"
                                      : "text-white"
                              }`}
                          >
                              {statSubtitle}
                          </h5>
                          <span
                              className={`font-semibold text-xl ${
                                  customClasses === "bg-white"
                                      ? "text-blueGray-700"
                                      : "text-white"
                              }`}
                          >
                              {statTitle}
                          </span>
                      </div>
                      <div className="relative w-auto pl-4 flex-initial">
                          <div
                              className={
                                  "text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full " +
                                  statIconColor
                              }
                          >
                              <BsFillPieChartFill size={23} />
                              {/* <i className={statIconName}></i> */}
                          </div>
                      </div>
                  </div>
                  <p
                      className={`text-sm mt-4 ${
                          customClasses === "bg-white"
                              ? "text-blueGray-400"
                              : "text-white"
                      }`}
                  >
                      <span className="whitespace-nowrap">
                            {moment(statDescripiron).calendar()}
                      </span>
                  </p>
              </div>
          </div>
      </>
  );
}

CardStats.defaultProps = {
  statSubtitle: "Traffic",
  statTitle: "350,897",
  statArrow: "up",
  statPercent: "3.48",
  statPercentColor: "text-emerald-500",
  statDescripiron: "12/12/2021",
  statIconName: "far fa-chart-bar",
  statIconColor: "bg-red-500",
  customClasses: ""
};

CardStats.propTypes = {
    statSubtitle: PropTypes.string,
    statTitle: PropTypes.string,
    statArrow: PropTypes.oneOf(["up", "down"]),
    statPercent: PropTypes.string,
    // can be any of the text color utilities
    // from tailwindcss
    statPercentColor: PropTypes.string,
    statDescripiron: PropTypes.string,
    statIconName: PropTypes.string,
    // can be any of the background color utilities
    // from tailwindcss
    statIconColor: PropTypes.string,
    customClasses: PropTypes.string,
};
