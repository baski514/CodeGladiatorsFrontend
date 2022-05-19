import React from "react";
import { Pie } from "react-chartjs-2";
import { FiPlus } from "react-icons/fi";

export default function CustomPie({ data, labels }) {
    // let data = [9, 5, 3];
    // let labels = ["Total Questions", "Right Answers", "Wrong Answers"];

    let customLabels = labels.map((label, index) => `${label}: ${data[index]}`);

    const chartdata = {
        labels: customLabels,
        datasets: [
            {
                label: "Category Wise Results",
                backgroundColor: [
                    "#00B3FC",
                    "#83ce83",
                    "#f96a5d",
                    "#00A6B4",
                    "#6800B4",
                ],
                data: data,
            },
        ],
    };
    React.useEffect(() => {}, []);
    return (
        <>
            <div className="relative flex flex-col min-w-0 break-words bg-white mb-6 shadow-md rounded-lg border">
                <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
                    <div className="flex flex-wrap items-center">
                        <div className="relative flex-grow flex-1">
                            <h6 className="uppercase text-blueGray-700 text-xl font-semibold">
                                Results
                            </h6>
                            <h2 className=" text-blueGray-400 mb-1 text-xs font-semibold">
                                Category Wise
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="p-4 flex-auto">
                    {/* chart */}
                    <div className="relative h-350-px">
                        <Pie
                            data={chartdata}
                            options={{
                                legend: { display: true, position: "right" },

                                datalabels: {
                                    display: true,
                                    color: "white",
                                },
                                tooltips: {
                                    backgroundColor: "#5a6e7f",
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
