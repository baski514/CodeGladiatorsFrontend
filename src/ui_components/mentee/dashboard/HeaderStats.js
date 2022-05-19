import React from "react";
import CardStats from "./CardStats";
// components

export default function HeaderStats({activeAssessment, preDetails, postDetails, changeHandler, activeAssessmentId}) {
    
    return (
        <>
            {/* Header */}
            <div className="relative bg-gray-700 md:pt-32 pb-32 pt-12">
                <div className="px-4 md:px-10 mx-auto w-full">
                    <div>
                        {/* Card stats */}
                            <div className="flex flex-wrap justify-center">
                                {activeAssessment === "pre" && preDetails && preDetails.map((assessment, index)=>{
                                    return (
                                        <div
                                            className="w-full lg:w-6/12 xl:w-3/12 px-4 cursor-pointer mt-2"
                                            key={index}
                                            onClick={() => {
                                                changeHandler(assessment);
                                            }}
                                        >
                                            <CardStats
                                                statSubtitle={
                                                    assessment.Template__c
                                                }
                                                statTitle={`${Math.round(
                                                    (assessment.Total_Marks_Obtained__c /
                                                        assessment.Total_Questions__c) *
                                                        100
                                                )}%`}
                                                statArrow="up"
                                                statPercent=""
                                                statPercentColor="text-emerald-500"
                                                statDescripiron={
                                                    assessment.CreatedDate
                                                }
                                                statIconName=""
                                                statIconColor="bg-red-500"
                                                customClasses={
                                                    assessment.Id ===
                                                    activeAssessmentId
                                                        ? `bg-purple-500`
                                                        : "bg-white"
                                                }
                                            />
                                        </div>
                                    );
                                })}
                                
                                {activeAssessment === "post" && postDetails && postDetails.map((assessment, index)=>{
                                    return (
                                        <div
                                            className="w-full lg:w-6/12 xl:w-3/12 px-4 cursor-pointer mt-2"
                                            key={index}
                                            onClick={() => {
                                                changeHandler(assessment);
                                            }}
                                        >
                                            <CardStats
                                                statSubtitle={
                                                    assessment.Template__c
                                                }
                                                statTitle={`${Math.round(
                                                    (assessment.Total_Marks_Obtained__c /
                                                        assessment.Total_Questions__c) *
                                                        100
                                                )}%`}
                                                statArrow="up"
                                                statPercent=""
                                                statPercentColor="text-emerald-500"
                                                statDescripiron={
                                                    assessment.CreatedDate
                                                }
                                                statIconName=""
                                                statIconColor="bg-red-500"
                                                customClasses={
                                                    assessment.Id ===
                                                    activeAssessmentId
                                                        ? `bg-purple-500`
                                                        : "bg-white"
                                                }
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            
                    </div>
                </div>
            </div>
        </>
    );
}
