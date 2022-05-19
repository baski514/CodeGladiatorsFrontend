import React from 'react'
import "../../../styles/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { httpsGET } from '../../../backend_api/mentorAPI';
import { httpsGET as menteeGet } from '../../../backend_api/menteeAPI';
import {
    API_GET_SCHEDULES,
    API_GET_MY_ASSIGNMENTS
} from "../../../backend";
import "react-datetime/css/react-datetime.css";
import 'react-confirm-alert/src/react-confirm-alert.css';
import { connect } from "react-redux";
import Base from "../../Base";
import {HiCloudDownload} from "react-icons/hi";
import { saveAs } from "file-saver";
import moment from 'moment';
import { firebase } from "../../../config/fbConfig";

//Duncan Laurence - Arcade (Lyric Video) ft. FLETCHER

class AssignmentView extends React.Component {
    reCacheOfferings = true;
    constructor(props) {
        super(props);
        console.log(props);
        
        console.log(props.location.state.courseData)
        this.state = {
            events: [],
            displayDragItemInCell: true,
            showLoader: true,
            unplannedEvents: [],
            showSessionModal: false,
            isSessionEdit: false,
            modalEvent: {
                stitle: "",
                start: "",
                end: "",
                offeringId: "",
                meetingLink: "",
            },
            errorModalEvent:{
                errorSTittle:false,
                errorStart:false,
                errorEnd:false,
                errorOfferingId:false,
                errorMeetingLink:false
            },
            errorOTittle:false,
            offerings: [],
            showModalLoader: false,
            isDirty: false,
            offeringName: "",
            assignments:[],
            selected:{}
        };

        this.getCourseDetails = this.getCourseDetails.bind(this)
        
    }

    getAssignments(sessionId){
        console.log("Session id",sessionId)
        firebase
        .auth()
        .currentUser.getIdToken(false)
        .then(function (idToken) {
            menteeGet({idToken , uid: this.props.auth.uid}, `${API_GET_MY_ASSIGNMENTS}${sessionId}`).then(
                (data) => {
                    
                    if (data && data.length > 0) {
                        
                        if (
                            data[0].Session_Attachments__r &&
                            data[0].Session_Attachments__r.records
                        ) {
                            this.setState({...this.state,assignments:data[0].Session_Attachments__r.records})
                            console.log("Assignments details ",this.state.assignments)
                            // setAttachments(data[0].Session_Attachments__r.records);
                        }else{
                            this.setState({...this.state,assignments:[]})      
                        }
                    }else{
                        this.setState({...this.state,assignments:[]})
                    }
                }
            );
        });
    }

    getCourseDetails = () => {
        console.log("Props Data ",this.props.history.location)
        return(
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden border-r-8 border-white hover:border-orange-500 md:max-w-2xl mt-10">
                <div className="md:flex">
                
                           <div className="md:flex-shrink-0">
                                <img
                                    className="h-48 w-full object-cover md:h-full md:w-48"
                                    src={
                                            this.props.history.location.state.courseData
                                                  .Thumbnail_URL__c?this.props.history.location.state.courseData.Thumbnail_URL__c
                                            : "https://via.placeholder.com/200"
                                    }
                                    alt={
                                        this.props.location.state.courseData.Name
                                    }
                                />
                            </div>
                            <div className="p-6 w-full">
                                <div>
                                    <div className="uppercase tracking-wide text-sm text-gray-600 font-semibold">
                                        {
                                            this.props.history.location.state.courseData.Name
                                        }
                                    </div>
                                    
                                    <div
                                        className="inline-block px-2 py-1 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs mt-4 cursor-pointer"
                                        // onClick={() =>
                                        //   goToSchedule(
                                        //               enrollment
                                        //                   .course_enrollment
                                        //                   .Course_Master__c,
                                        //               enrollment
                                        //                   .course_enrollment.Id
                                        //           )
                                        // }
                                    >
                                        {"5 sessions"}
                                    </div>

                                    <div
                                        className="inline-block px-2 py-1 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs mt-4 cursor-pointer"
                                    >
                                        {this.props.history.location.state.courseData.Total_Student_Enrolments__c} students enrolled
                                    </div>
                                       
                                </div>
                            </div>
                </div>
            </div>
        )
    }

  

    mentorEnrolId;

    getSchedules = () => {
        console.log("Get Schedules called ",this.props.match.params.enrolId)
        firebase
        .auth()
        .currentUser.getIdToken(false)
        .then(function (idToken) {
            httpsGET(
                { idToken, uid: this.props.auth.uid},
                `${API_GET_SCHEDULES}?enrollment_id=${this.props.match.params.enrolId}&user_type=${this.props.profile.userType}&course_id=${this.props.match.params.courseId}&user_id=${this.props.profile.sfid}`
            ).then((data) => {
                console.log("Session Resp ",data)
                if(data.mentorEnrolId){
                    this.mentorEnrolId = data.mentorEnrolId;
                }
                console.log("Response from SF ",data)
    
                if (data && data.error) {
                    console.log("Error to fetch schedules",data.techMsg);
                } else if (data && data.sessions && data.sessions.length > 0) {
                    this.mentorEnrolId = data.mentorEnrolId;
    
                    const scheduledEvents = []
    
                    data.sessions.forEach((schedule) => {
                        if (schedule.Status__c === "COMPLETED") {
                            scheduledEvents.push({
                                id: schedule.Id,
                                title: schedule.Session_Title__c,
                                start: moment(schedule.Start_DateTime__c).toDate(),
                                end: moment(schedule.End_DateTime__c).toDate(),
                                status: schedule.Status__c,
                            });
                        } 
                    });
                    console.log("Schedules Event ",scheduledEvents);
    
    
                    this.setState({
                        ...this.state,
                        showLoader: false,
                        events: scheduledEvents,
                        selected:scheduledEvents[0]
                    });
    
                    this.getAssignments(scheduledEvents[0].id)
                } else {
                    console.log("Else block")
                    this.setState({ ...this.state, showLoader: false });
                }
            });
        });
    };

    componentDidMount() {
        this.getSchedules();
    }
    
    
    unscheduledSessions = () => {
        return (
            <>
                {this.state.events.map((event, index) => {
                    return (
                        <div
                        className="w-full p-1 "
                        key={index}
                        onClick={()=>{this.getAssignments(event.id)}}
                    >
                        <div
                            className="card flex flex-col justify-center p-3 bg-white rounded-lg shadow md:max-w-xs cursor-pointer"
                            // onClick={()=>{
                            //     this.props.history.push(
                            //         `/assignmentdetail/${this.props.match.params.enrolId}/${event.id}`
                            //     );
                            // }}
                        >
                            <div className="">
                                <p className="text-lg uppercase text-gray-900 font-bold text-center truncate md:overflow-clip">
                                    {event.title}
                                    {console.log("Event Bhaskar",event)}
                                </p>
                                <div className="flex flex-col md:flex-row justify-center items-center mt-2">
                                    <div className="py-1 px-2 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs truncate md:overflow-clip">
                                            Assignments
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    );
                })}
                </>
        );
    };

     downloadAttachment = (attachment) => {
        saveAs(attachment.FILE_URL__c);
    };

    

    handleOfferingInput = (e) => {
        this.setState({ ...this.state, [e.target.id]: e.target.value });
    };

   
    render() {
        return (
            <Base history={this.props.history}>
                <div className="container mx-auto py-4 px-12">
                    <center className="mb-4">
                        <h1>Assignments</h1>
                    </center>

                    {this.getCourseDetails()}
                    <div className="flex mt-5">
                        <div className="w-1/4 mr-4">
                            {this.props.profile.userType === "instructor" ? this.unscheduledSessions():null}
                        </div>
                        <div className="w-3/4 bg-gray-100 m-3 rounded-lg">
                            {this.state.assignments.length===0?
                                <div className="justify-center">
                                     <h1 className="text-center justify-self-center">Assignment not found</h1>    
                                    </div>:
                                 <div className="mt-5">
                                 {this.state.assignments &&
                                     this.state.assignments.map((attachment, index) => {
                                         console.log(attachment);
                                         return (
                                             <div
                                                 className="no-underline border-b hover:border-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-2 p-5 text-gray-900"
                                                 key={index}
                                             >
                                                 <div className="md:flex md:justify-between">
                                                     <div>
                                                         <b>Name: </b>
                                                         <span>{attachment.Name}</span>
                                                         <p className="text-sm">
                                                             <b>Type: </b>
                                                             <span>
                                                                 {attachment.Attachment_Type__c}
                                                             </span>
                                                         </p>
                                                         <p className="text-sm">
                                                             <b>Date Added: </b>
                                                             <span>
                                                                 {moment(
                                                                     attachment.CreatedDate
                                                                 ).calendar()}
                                                             </span>
                                                         </p>
                                                     </div>
                                                     <div className="flex items-center">
                                                     
                                                         {attachment.Attachment_Type__c !==
                                                             "VIDEO" && (
                                                             <HiCloudDownload
                                                                 className="inline cursor-pointer ml-2 text-gray-600 hover:text-black"
                                                                 size={20}
                                                                 onClick={() =>
                                                                     this.downloadAttachment(
                                                                         attachment
                                                                     )
                                                                 }
                                                             />
                                                         )} 
                                                     </div>
                                                 </div>
                                             </div>
                                         );
                                     })}
                             </div>
                        }
                        </div>
                    </div>
                </div>
            </Base>
        );
    }
}

const mapStateToProps = (state) => {
    // console.log(state);
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile
    };
};

export default connect(mapStateToProps)(AssignmentView);