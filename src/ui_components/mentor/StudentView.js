import React, { useState, useEffect } from "react";
import { LoaderLarge } from "../ui_utilities/Loaders";
import { connect } from "react-redux";
import { API_GET_ENROLLED_STUDENTS } from "../../backend";
import { httpsGET } from "../../backend_api/mentorAPI";
import Base from "../Base";
import { HiChartSquareBar } from "react-icons/hi";
import {IoMdEye} from "react-icons/io";
import { randomColor } from "randomcolor";
import {firebase} from "../../config/fbConfig";
import { PATH_COURSE_SCHEDULE} from "../path_constants";
import {GiProgression} from 'react-icons/all'
const StudentView = ({ match, history, auth }) => {
    const [showLoader, setShowLoader] = useState(true);
    const [students, setStudents] = useState([]);
    useEffect(() => {
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsGET(
                    { idToken, uid: auth.uid },
                    `${API_GET_ENROLLED_STUDENTS}${match.params.courseId}/${match.params.mentorId}`
                ).then((data) => {
                    debugger;
                    console.log("Students",data);
                    if (data && data.length > 0) {
                        setStudents(data);
                    }
                    setShowLoader(false);
                });
            });
    }, []);

    const gotoStudentDetail = (studentId) => {
        // history.push(`/assessment/${studentId}`);
        history.push(`/testdetails/${studentId}`);
    };

    const studentsList = () => {
        
        if(students.length>0){
            return(
                students.map((student, index) => {
                    return (
                        <div
                            className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-2"
                            key={index}
                        >
                            <div className="flex items-center p-4">
                                <div className="flex justify-between w-full">
                                    <div className="flex items-center">
                                        {student.Profile_Picture__c ? (
                                            <div className="flex-shrink-0 w-12 h-12">
                                                <img
                                                    className="w-full h-full rounded-full"
                                                    src={
                                                        student.Contact__r
                                                            .Profile_Picture__c
                                                    }
                                                    alt="Profile"
                                                />
                                            </div>
                                        ) : (
                                            <div className="col-span-1 flex justify-center">
                                                <div
                                                    className="rounded-full text-white flex items-center justify-center w-10 h-10 font-semibold"
                                                    style={{
                                                        backgroundColor: randomColor({
                                                            luminosity: "dark",
                                                            hue: "random",
                                                        }),
                                                    }}
                                                >
                                                    {student.Contact__r.Initials__c}
                                                </div>
                                            </div>
                                        )}
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {`${student.Contact__r.FirstName} ${student.Contact__r.LastName}`}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {student.Contact__r.Email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <IoMdEye
                                            size={35}
                                            className="inline text-orange-500 bg-gray-600 mr-1 p-1 cursor-pointer rounded-full"
                                            onClick={() => {
                                                history.push(
                                                    `/mentee/detail/${student.Contact__r.Firebase_Id__c}`
                                                );
                                            }}
                                        />
                                        <HiChartSquareBar
                                            size={35}
                                            className="inline text-orange-500 bg-gray-600 mr-1 p-1 cursor-pointer rounded-full"
                                            onClick={() => {
                                                gotoStudentDetail(student.Contact__c);
                                            }}
                                        />


                                         {/* <GiProgression
                                            size={35}
                                            className="inline text-orange-500 bg-gray-600 p-1 cursor-pointer rounded-full"
                                            onClick={() => {
                                                history.push(`/sessiondetails/${student.Contact__c}`)
                                            }}
                                        /> */}
                                    </div>
                                </div>
                            </div>
                            <hr />
                        </div>
                    );
                })
            )
        }else{
            return(
                <div className="text-center text-xl">No Students enrolled</div>
            )
        }
        
    };

    return (
        <Base history={history} pathList={[
            ...PATH_COURSE_SCHEDULE,
            { to: "#", name: "Students" },
        ]}>
            <div className="container mx-auto md:py-4 py-2 md:px-12 px-2">
                <center>
                    <h3>Students</h3>
                </center>
                {showLoader ? (
                    <div className="flex items-center justify-center h-3/6">
                        <LoaderLarge type="ThreeDots" />
                    </div>
                ) : (
                    <div className="md:mt-10 mt-5">{studentsList()}</div>
                )}
            </div>
        </Base>
    );
};

const mapStateToProps = (state) => {
    // console.log(state);
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile
    };
};

export default connect(mapStateToProps)(StudentView);