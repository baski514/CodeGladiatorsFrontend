import React, { Component } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./ui_components/Home";
import Signup from "./ui_components/auth/Signup";
import Login from "./ui_components/auth/Signin";
import PrivateRoute from "./PrivateRoute";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CourseDetail from "./ui_components/mentor/CourseDetail";
import MyCourse from "./ui_components/mentor/MyCourse";
import CourseView from "./ui_components/mentor/CourseView";
import Profile from "./ui_components/mentor/profile/Profile";
import EditProfile from "./ui_components/mentor/profile/ProfileTabs";
import CourseSchedule from "./ui_components/mentor/scheduler/CourseSchedule";
import UploadAssignment from "./ui_components/mentee/session/UploadAssignment";
import VideoViewer from "./ui_components/ui_utilities/VideoViewer";
import CheckoutGateway from "./ui_components/mentee/CheckoutGateway";
import WishList from "./ui_components/mentee/WishList";
import StudentView from "./ui_components/mentor/StudentView";
import AssignmentView from './ui_components/mentor/session/AssignmentView'
import ResetPassword from './ui_components/auth/ResetPassword'
import AssessmentDetails from "./ui_components/mentee/AssessmentDetails";
import MentorList from "./ui_components/mentor/public/MentorList";
import MentorProfile from "./ui_components/mentor/public/MentorProfile";
import Message from "./ui_components/messages/Message"
import MenteeProfile from "./ui_components/mentee/MenteeProfile";
import SessionComponent from './ui_components/mentor/session/SessionComponent'
import ProfileComponent from "./ui_components/mentor/profile/ProfileComponent";

import TestMaster from "./ui_components/mentor/public/TestMaster";
import Notifications from "./ui_components/messages/Notifications"
import LearnSession from "./ui_components/mentor/session/LearnSession"
import MenteeSessionProgress from './ui_components/mentor/session/MenteeSessionProgress'
import CustomActionUrl from "./ui_components/auth/CustomActionURL"
import GenericSignup from "./ui_components/auth/GenericSignup";
import GenericTest from "./ui_components/mentee/public/GenericTest";




class Routes extends Component {

    render() {
        return (
            <BrowserRouter>
                <div className="App h-screen">
                    {/* <Navbar /> */}
                    <Switch>
                        <Route exact path="/" component={Home} />
                        <Route
                            path="/course/detail/:courseId"
                            component={CourseDetail}
                        />
                        <PrivateRoute path="/chats" component={Message} />
                        <PrivateRoute path="/notifications" component={Notifications} />
                        <PrivateRoute path="/mycourse" component={MyCourse} />
                        <PrivateRoute path="/content/:courseId/:enrolId" component={CourseView} />
                        <PrivateRoute path="/myprofile" component={Profile} />
                        <PrivateRoute path="/learn/:enrollId" component={LearnSession} />
                        
                        <PrivateRoute path="/testdetails/:stId" component={TestMaster}/> 
                        {/* <PrivateRoute path="/studentresponse/:stId" component={TestMaster}/>  */}

                        <PrivateRoute
                            path="/editprofile"
                            component={ProfileComponent}
                        />

                        <PrivateRoute
                            path="/courseschedule/:courseId/:enrolId"
                            component={CourseSchedule}
                        />
       

                        <PrivateRoute
                            path="/s/:enrolId/:sessionId"
                            component={SessionComponent}
                        />

                

                        <PrivateRoute
                            path="/uploadassignment/:enrolId/:sessionId"
                            component={UploadAssignment}
                        />

                        <PrivateRoute
                            path="/session/play/:videoId"
                            component={VideoViewer}
                        />
                        {/* <PrivateRoute
                            path="/student/payment/:courseId"
                            component={PaymentGateway}
                        /> */}

                        <PrivateRoute
                            path="/student/payment/:courseId"
                            component={CheckoutGateway}
                        />

                        <PrivateRoute path="/mywishlist" component={WishList} />

                        <PrivateRoute
                            path="/viewstudents/:courseId/:mentorId"
                            component={StudentView}
                        />
                        
                        <PrivateRoute path="/sessiondetails/:stId" component={MenteeSessionProgress}/>     
                        
                        <PrivateRoute
                            path="/assessment/:studentId"
                            component={AssessmentDetails}
                        />
                        <Route path="/signin" component={Login} />
                        <Route path="/signup" component={Signup} />
                        <Route path="/starttest" component={GenericSignup} />
                        <Route path="/generictest" component={GenericTest} />
                        <Route
                            path="/forgotpassword"
                            component={ResetPassword}
                        />
                        <Route path="/mentors" component={MentorList} />
                        
                        <Route path="/__/auth/action" component={CustomActionUrl} />
                        
                        <Route
                            path="/mentor/detail/:mentorFid"
                            component={MentorProfile}
                        />
                        <Route
                            path="/mentee/detail/:menteeFid"
                            component={MenteeProfile}
                        />
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
}

export default Routes;