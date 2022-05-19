import React, { useEffect, useState } from "react";
import { LoaderLarge } from "../ui_utilities/Loaders";
import Base from "../Base";
import Doughnut from "./dashboard/charts/Doughnut";
import HeaderStats from "./dashboard/HeaderStats";
import Pie from "./dashboard/charts/Pie";
import { BiCheck } from "react-icons/bi";
import {RiCloseLine} from "react-icons/ri";
import { httpsGET } from "../../backend_api/menteeAPI";
import { API_GET_MY_ASSESSMENTS } from "../../backend";
import { connect } from "react-redux";
import { firebase } from "../../config/fbConfig";
import { toast } from "react-toastify";

const AssessmentDetails = ({ auth, history, match }) => {
    const [showLoader, setShowLoader] = useState(true);
    const [activeAssessment, setActiveAssessment] = useState("pre");
    const [preExamDetail, setPreExamDetail] = useState([]);
    const [postExamDetail, setPostExamDetail] = useState([]);
    const [moduleExamDetail, setModuleExamDetail] = useState([])
    const [selectedEvent,setSelectedEvent] = useState({})
    const [doughnutData, setdoughnutData] = useState({
        data: [],
        labels: ["Total Questions", "Right Answers", "Wrong Answers"],
    });
    const [pieData, setPieData] = useState({
        data: [],
        labels: [],
    });
    const [activeAssessmentId, setActiveAssessmentId] = useState(null);

    useEffect(() => {
        setShowLoader(true);
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsGET(
                    { idToken, uid: auth.uid },
                    `${API_GET_MY_ASSESSMENTS}${match.params.studentId}`
                ).then((data) => {
                    if (data && data.error) {
                        toast(data.error)
                        console.log(data.techMsg);
                    } else if (data) {
                        console.log("AssesmentData",data);
                        if (data.pre.length > 0) {
                            data.pre.forEach((d,i)=>{
                                let categories = [];
                                let rightAnswers = [];

                                d.Result_Categories__r.records.forEach((category,index)=>{
                                    categories.push(category.Name)
                                    rightAnswers.push(category.Right_Answered_Ques__c)
                                })
                                const chartPoints = [
                                    d.Total_Questions__c,
                                    d.Total_Marks_Obtained__c,
                                    d.Total_Questions__c-d.Total_Marks_Obtained__c
                                ]
                                d.doughnutCharts= chartPoints
                                d.piechat= {labels:categories,data:rightAnswers}
                            })
                            setPreExamDetail(data.pre);
                        }
                        if (data.post.length > 0) {
                            data.post.forEach((d,i)=>{
                                let categories = [];
                                let rightAnswers = [];

                                d.Result_Categories__r.records.forEach((category,index)=>{
                                    categories.push(category.Name)
                                    rightAnswers.push(category.Right_Answered_Ques__c)
                                })
                                const chartPoints = [
                                    d.Total_Questions__c,
                                    d.Total_Marks_Obtained__c,
                                    d.Total_Questions__c-d.Total_Marks_Obtained__c
                                ]
                                d.doughnutCharts= chartPoints
                                d.piechat= {labels:categories,data:rightAnswers}
                            })
                            setPostExamDetail(data.post);
                        }
                        if(data.module.length > 0){
                            data.module.forEach((d,i)=>{
                                let categories = [];
                                let rightAnswers = [];

                                d.Result_Categories__r.records.forEach((category,index)=>{
                                    categories.push(category.Name)
                                    rightAnswers.push(category.Right_Answered_Ques__c)
                                })
                                const chartPoints = [
                                    d.Total_Questions__c,
                                    d.Total_Marks_Obtained__c,
                                    d.Total_Questions__c-d.Total_Marks_Obtained__c
                                ]
                                d.doughnutCharts= chartPoints
                                d.piechat= {labels:categories,data:rightAnswers}
                            })
                            setModuleExamDetail(data.module)
                        }
                    }
                    setShowLoader(false);
                });
            });
    }, []);

    const changeHandler = (data) => {
        debugger;
        if (data.Total_Marks_Obtained__c && data.Total_Questions__c) {
            const chartPoints = [
                data.Total_Questions__c,
                data.Total_Marks_Obtained__c,
                data.Total_Questions__c - data.Total_Marks_Obtained__c,
            ];
            setdoughnutData({ ...doughnutData, data: chartPoints });
        }

        if (data.Result_Categories__r && data.Result_Categories__r.records) {
            let categories = [];
            let rightAnswers = [];
            data.Result_Categories__r.records.forEach((category) => {
                if (
                    category.Name !== undefined &&
                    category.Right_Answered_Ques__c !== null
                )
                    categories.push(category.Name);
                if (
                    category.Right_Answered_Ques__c !== undefined &&
                    category.Right_Answered_Ques__c !== null
                )
                    rightAnswers.push(category.Right_Answered_Ques__c);
            });
            setPieData({ labels: categories, data: rightAnswers });
        }
        setActiveAssessmentId(data.Id);
    };

    const assessmentChangeHandler = (type) => {
        setdoughnutData({
            ...doughnutData,
            data: [],
        });
        setPieData({
            data: [],
            labels: [],
        });
        setActiveAssessment(type);
    };

    const assessmentActions = () => {
        return (
            <div className="grid grid-cols-2 divide-x mt-4 mb-4 p-4">
                <div className="flex justify-center">
                    <button
                        className={`text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                            activeAssessment === "pre"
                                ? "bg-orange-500"
                                : "bg-gray-500"
                        }`}
                        onClick={() => assessmentChangeHandler("pre")}
                    >
                        {activeAssessment === "pre" ? (
                            <BiCheck size={23} className="inline text-white " />
                        ) : (
                            <RiCloseLine
                                size={23}
                                className="inline text-white"
                            />
                        )}
                        <span>Pre Assessment</span>
                    </button>
                </div>
                <div className="flex justify-center">
                    <button
                        className={`text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                            activeAssessment === "post"
                                ? "bg-orange-500"
                                : "bg-gray-500"
                        }`}
                        onClick={() => assessmentChangeHandler("post")}
                    >
                        {activeAssessment === "post" ? (
                            <BiCheck size={23} className="inline text-white " />
                        ) : (
                            <RiCloseLine
                                size={23}
                                className="inline text-white"
                            />
                        )}
                        <span>Post Assessment</span>
                    </button>
                </div>
            </div>
        );
    };

    const myAssessment = () => {
        return (
            <div className="flex flex-col bg-gray-700 mt-4">
                <div className="bg-gray-900">{assessmentActions()}</div>
                <div>
                    <HeaderStats
                        preDetails={preExamDetail}
                        postDetails={postExamDetail}
                        activeAssessment={activeAssessment}
                        changeHandler={changeHandler}
                        activeAssessmentId={activeAssessmentId}
                    />
                    {doughnutData.data.length > 0 && (
                        <div className="flex md:flex-row sm:flex-col justify-center px-4 md mx-auto w-full -m-24">
                            <div className="mb-12 xl:mb-0 px-4">
                                <Doughnut
                                    data={doughnutData.data}
                                    labels={doughnutData.labels}
                                />
                            </div>
                            <div className="mb-12 xl:mb-0 px-4">
                                <Pie
                                    data={pieData.data}
                                    labels={pieData.labels}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const sideLeftUi =()=>{
        return(
            <h1>SSSSSS</h1>
        )
    }

    return (
        <Base history={history}>
            <div className="container mx-auto py-4 px-12">
                <center>
                    <h3>Assessment Details</h3>
                </center>
                {showLoader ? (
                    <div className="flex items-center justify-center h-3/6">
                        <LoaderLarge type="ThreeDots" />
                    </div>
                ) : (
                    <>
                    {myAssessment()}
                    {/* {sideLeftUi()} */}
                    </>
                )}
            </div>
        </Base>
    );
}
const mapStateToProps = (state) => {
    // console.log(state);
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile,
    };
};

export default connect(mapStateToProps)(AssessmentDetails);