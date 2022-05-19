import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { httpsGET } from "../../backend_api/mentorAPI";
import { API_GET_COURSE_OVERVIEW,API_GET_COURSE_DETAIL } from "../../backend";
import { LoaderLarge } from "../ui_utilities/Loaders";
import Base from "../Base";
import { updateMyEnrollment } from "../../store/actions/appActions";

import { toast } from "react-toastify";
import {IoCheckmarkSharp} from 'react-icons/all'
import { firebase } from "../../config/fbConfig";
import { PATH_COURSE_SCHEDULE } from "../path_constants";


const CourseView = ({
    auth,
    profile,
    history,
    match
}) => {

    let mentorEnrolId; 
    const [courseOverview,setCourseOverView] = useState([])
    console.log("History",history);

    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        getSchedules()
    }, []);

    const getSchedules =()=>{
        
        if(profile.userType==="student"){
            mentorEnrolId = history.location.state.courseEnrollment.Mentor_Course_Enrollment__c
        }else{
            mentorEnrolId = history.location.state.courseEnrollment.Id
        }
        if(mentorEnrolId){
            firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsGET(
                    { idToken, uid: auth.uid},
                    `${API_GET_COURSE_OVERVIEW}${mentorEnrolId}`
                ).then((courseDetail) => {
                    console.log("Offering response ",courseDetail)
                    debugger;
                    if (courseDetail && courseDetail.error) {
                        console.log(courseDetail.techMsg);
                    } else {
                        if(courseDetail.length===0){
                           console.log("Module not found")
                        }else{
                            setCourseOverView(courseDetail)
                            debugger;
                        } 
                    }
                    setShowLoader(false);
                });
            });
        }else{
            httpsGET(null, `${API_GET_COURSE_DETAIL}${match.params.courseId}`).then(
                (data) => {
                    debugger;
                    if(data && data.error) {
                        console.log(data.techMsg);
                    }
                    else if (data && data.error) {
                        console.log(data.error);
                    }
                    else{
                        console.log("Course Details",data);
                        const course = data.course_master;
                        // setCourseDetail({
                        //     ...courseDetail,
                        //     name: course.Name,
                        //     shortDescription: course.Short_Description__c?course.Short_Description__c:"",
                        //     description: course.Description__c?course.Description__c:"",
                        //     thumbnailURL: course.Thumbnail_URL__c,
                        //     offerings: course.Course_Offerings__r
                        //         ? course.Course_Offerings__r.records
                        //         : [],
                        //     reviews: course.Students_Feedback__r
                        //         ? course.Students_Feedback__r.records
                        //         : [],
                        //     coursePrice: course.Course_Price__c,
                        //     paidCourse: course.Paid_Course__c,
                        //     avgRating: course.Average_review_rating__c
                        //         ? course.Average_review_rating__c
                        //         : 0,
                        //     upcomingSessions: data.upcoming_sessions ? data.upcoming_sessions : [],
                        //     topMentors: data.top_mentors ? data.top_mentors : []
                        // });
                        setShowLoader(false);
                    }
                }
            );
        }

    }

    if (!auth.uid) return <Redirect to="/signin" />;

    const getTime=(moduleTime)=>{
        var hour = parseInt(moduleTime.split(":")[0])
        var min = parseInt(moduleTime.split(":")[1])
        return `~ ${hour} hrs ${min} mins`
    }

    const trailUi=()=>{
        return(
            <div className="overflow-hidden  bg-gray-100">
      <div className="bg-red-700 h-20 "></div>
        <div className="bg-white border-b-2 shadow-none px-12">
            <div className="mx-auto py-4 max-w-7xl">
              <div className="flex flex-col justify-start -mt-16">
                <div className="flex flex-row justify-between">
                    <img src={history.location.state.courseEnrollment.Course_Master__r.Thumbnail_URL__c?history.location.state.courseEnrollment.Course_Master__r.Thumbnail_URL__c:"https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/trails/force_com_dev_beginner/39ed2e90cae0e0428a8ea1a110425370_icon.png"}className="h-24 w-24 bg-red-600 rounded-lg z-auto" alt="thumbnail"/>
                    <div className="flex flex-col-reverse">
                        <h2 className="bg-gray-200  px-5 py-1 rounded-full opacity-70 text-sm text-black font-bold">{history.location.state.courseEnrollment.Total_Points__c?history.location.state.courseEnrollment.Total_Points__c:"0 "} POINTS</h2>
                    </div>
                </div>
            
                <div className="w-full flex flex-row justify-between">
                    <h2 className="md:text-3xl text-2xl font-bold md:mt-7 mt-3 text-gray-900">{history.location.state.courseEnrollment.Course_Master__r.Name}</h2>
                </div>

                <div className="w-full flex flex-row justify-between">
                  <p className="md:mt-2 mt-1 text-gray-700 md:text-base text-sm">{history.location.state.courseEnrollment.Course_Master__r.Short_Description__c}</p>
                </div>

                <div className="flex justify-end mt-2">
                              <h1 className="text-sm text-gray-700 text-end">{history.location.state.courseEnrollment.Total_Hours__c? getTime(history.location.state.courseEnrollment.Total_Hours__c):"00:00 "}</h1>
                            </div>
              </div>
            </div>
          </div>

          <div id="content" className="md:max-w-4xl md:mx-auto mx-5 pb-7">
            
          {courseOverview.map((courseDetail,index)=>{
              console.log("CourseDetail",courseDetail)
                return(
                
            <div id="module" className="flex flex-col justify-center">
                
              <div id="modulecontent" className="w-full flex flex-col mt-3">
                <div className="flex justify-center">
                  <div className="h-3 w-3 bg-gray-300 opacity-75 rounded-full"/>
                </div>
                <div className="flex justify-center">
                  <div className="h-3 w-3 bg-gray-300 opacity-75 mt-1 rounded-full"/>
                </div>

                <div id="particularModule" className="w-full flex flex-col bg-white rounded-tr-lg rounded-tl-lg h-48 mt-3">
                    <div className="h-2 w-full bg-red-400 rounded-t-lg"/>
                    <div className="py-5 px-5 w-full flex flex-row">
                    <img src={courseDetail.Module_Icon__c?courseDetail.Module_Icon__c:"https://png.pngtree.com/png-vector/20190726/ourmid/pngtree-business-office-color-data-module-infographic-png-image_1513556.jpg"} className="rounded-full border-solid  border-blue-900 border-3 md:h-24 md:w-24 h-12 w-12" alt="profile"/>		
                        <div className="ml-5 md:mt-3 flex flex-col w-full">
                            <div className="flex flex-row justify-between">
                            <h1 className="text-sm text-gray-700">Module</h1>
                            <div className="flex flex-row">
                                <div className="bg-gray-200 md:px-5 py-1 px-3 rounded-full md:h-7 h-5 opacity-70">
                                    <h2 className="md:text-sm text-xs text-black font-bold">{courseDetail.Session_s_Point__c?courseDetail.Session_s_Point__c+" ":"0 "}POINTS</h2>
                                </div>
                            </div>
                          </div> 
                            <h1 className="cursor-pointer md:text-xl text-base text-blue-600 font-bold md:-mt-3 mt-1">{courseDetail.Name}</h1>
                            <h1 className="text-sm text-gray-700">{courseDetail.Module_Agenda__c}</h1>
                            <div className="flex justify-end">
                              <h1 className="text-sm text-gray-700 text-end">{courseDetail.Total_Sessions_Duration__c?getTime(courseDetail.Total_Sessions_Duration__c):"0 h"}</h1>
                            </div>
                        </div>
                    </div>
                </div>
              
              </div>
              <div className="flex flex-col border-b rounded-br-lg rounded-bl-lg border-gray-300">
                  {courseDetail.CE_Sessions__r && courseDetail.CE_Sessions__r.records.map((sessions,i)=>{
                      console.log("Session Details",sessions)
                      return(
                        <div className="w-full bg-white px-5 py-3 text-blue-600 border-gray-300 border-t" 
                        onClick={()=>{
                            let body = {
                                title:sessions.Session_Title__c,
                                id:sessions.Id,
                                start:sessions.Start_DateTime__c,
                                end:sessions.End_DateTime__c,
                                meetingLink:sessions.Meeting_Link__c,
                                status:sessions.Status__c,
                                sessionAgenda:sessions.Session_Agenda__c,
                                CE_Module__r:sessions.CE_Module__r
                            }
                            if(profile.userType === "student"){
                                history.push({
                                    pathname:`/learn/${history.location.state.courseEnrollment.Id}`,
                                    state:{sessionId:sessions.Id}
                                })
                                // console.log("MENTORFBID",courseDetail.Course_Enrollment__r.Contact__r.Firebase_Id__c)
                                // history.push({
                                //     pathname: `/s/${history.location.state.courseEnrollment.Mentor_Course_Enrollment__c}/${sessions.Id}`,
                                //     state: {mentorCourseId:history.location.state.courseEnrollment.Mentor_Course_Enrollment__c,
                                //         mentorFBId:courseDetail.Course_Enrollment__r.Contact__r.Firebase_Id__c,
                                //         sessionDetail:body,
                                //         courseMaster:{name:history.location.state.courseEnrollment.Course_Master__r.Name,thumbnailUrl:history.location.state.courseEnrollment.Course_Master__r.Thumbnail_URL__c}
                                //     }
                                // });
                            }else{
                                history.push({
                                    pathname:`/learn/${history.location.state.courseEnrollment.Id}`,
                                    state:{sessionId:sessions.Id}
                                })
                                console.log("MENTORFBID",courseDetail.Course_Enrollment__r.Contact__r.Firebase_Id__c)
                                // history.push({
                                //     pathname:`/s/${history.location.state.courseEnrollment.Id}/${sessions.Id}`,
                                //     state:{sessionDetail:body,
                                //         mentorFBId:courseDetail.Course_Enrollment__r.Contact__r.Firebase_Id__c,
                                //         courseMaster:{name:history.location.state.courseEnrollment.Course_Master__r.Name,thumbnailUrl:history.location.state.courseEnrollment.Course_Master__r.Thumbnail_URL__c}
                                //     }
                                // });
                            }
                        }}>
                            <div className="w-full flex flex-row justify-between">
                                <div className="flex flex-col">
                                <h1 className="cursor-pointer text-sm text-blue-600 font-bold">{sessions.Session_Title__c}</h1>
                                <h1 className="cursor-pointer text-sm text-gray-500 mt-1">~{sessions.Session_Duration__c} mins</h1>
                                </div>
                                {
                                        sessions.Status__c==="COMPLETED"?
                                        <div className="rounded-full bg-green-500 h-8 w-8 p-2">
                                            <IoCheckmarkSharp size={17} className="fill-current text-white"/>
                                        </div>:
                                        <div className="rounded-full bg-gray-100 h-8 w-8 p-2">
                                            <img src = "https://cdn0.iconfinder.com/data/icons/feather/96/591276-arrow-right-512.png" alt="pic"/>
                                        </div>
                                            
                                    }
                              
                            </div>
                        </div>
                      )
                  })}
              </div>
            </div>  
            )
        })}
        </div>
      </div>      
        )
    }

    return (
        <>
        <Base history={history} 
         pathList={[
            ...PATH_COURSE_SCHEDULE,
            { to: "#", name: history.location.state.courseEnrollment.Course_Master__r.Name},
        ]}
        >
             {showLoader ? (
                   <div className="container mx-auto px-12">
                        <div className="flex items-center py-4 justify-center h-3/6">
                            <LoaderLarge type="ThreeDots" />
                        </div>
                    </div>
                ) : 
                <>
                {trailUi()}
                </>
                }
          
           
            
        </Base>
         </>
    );
};

const mapStateToProps = (state) => {
    // console.log(state);
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile,
        rEnrollments: state.app.enrollments,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        cacheEnrollments: (enrollments) =>
            dispatch(updateMyEnrollment(enrollments)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseView);
