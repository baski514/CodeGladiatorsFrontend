import React from 'react'
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "../../../styles/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { httpsGET, httpsPOST, httpsDELETE } from '../../../backend_api/mentorAPI';
import {
    API_GET_SCHEDULES,
    API_POST_CREATE_SESSION,
    API_POST_UPDATE_SESSIONS,
    API_GET_COURSE_OFFERINGS,
    API_POST_CREATE_OFFERING,
    API_DELETE_SESSION,
    API_POST_UPDATE_CENROLLMENT_TO_SENDPDF
} from "../../../backend";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { LoaderLarge,BannerLoader} from "../../ui_utilities/Loaders";
import Slider from "react-slick";
import { FiPlus } from "react-icons/fi";
import { TiTick, TiAttachment, TiCancel } from "react-icons/ti";
import { MdDeleteForever } from "react-icons/md";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import 'react-confirm-alert/src/react-confirm-alert.css';
import update from "immutability-helper";
import { connect } from "react-redux";
import Base from "../../Base";
import { toast } from 'react-toastify';
import CommonDetailModal from '../../settings/CommonDetailModal';
import DeleteAlert from '../../settings/DeleteAlert';
import {firebase} from "../../../config/fbConfig";
import { PATH_COURSE_SCHEDULE } from '../../path_constants';
import { sendBulkNotification } from '../../../store/actions/appActions';
import Tooltip from "../../ui_utilities/Tooltip"
import renderHTML from 'react-render-html';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';



// message: A Session has been scheduled session <link of the session> at this time hh:MM:dd:MM:YY
// read: false
//user_id:menteeFbId
//user_type:Mentee




const localizer = momentLocalizer(moment);
const CourseCalendar = withDragAndDrop(Calendar);

class CourseSchedule extends React.Component {
    reCacheOfferings = true;
    constructor(props) {
        super(props);
        console.log("Props",props);

        this.state = {
            courseMaster:props.location.state,
            courseMasterName:"",
            events: [],
            displayDragItemInCell: true,
            showLoader: true,
            unplannedEvents: [],
            showSessionModal: false,
            showScheduleAllSessionModal:false,
            isSessionEdit: false,
            modalEvent: {
                id: "",
                stitle: "",
                start: "",
                end: "",
                offeringId: "",
                meetingLink: "",
                agenda:"",
                selfPaced:false,
                startTime:"",
                endTime:""

            },
            errorModalEvent: {
                errorSTittle: false,
                errorStart: false,
                errorEnd: false,
                errorOfferingId: false,
                errorMeetingLink: false,
                errorAgenda: false,
            },
            errorOTittle: false,
            offerings: [],
            showModalLoader: false,
            isDirty: false,
            offeringName: "",

            offeringDescription: "",
            showEventOperationModal:false,
            selectedEvent:{},
            showConfirmAlertDelete:false,
            menteesEnrolled:[],
            unplannedMapCat : new Map(),
            selectedModule:[],
            showScheduleAllModuleSessionModal:false,
            showPdfSenderButton:false,
            courseStartDate:"",
            courseEndDate:"",
            allSessions:[],
            courseMap: new Map(),
        };
        

        this.moveEvent = this.moveEvent.bind(this);
        this.handleModalEvent = this.handleModalEvent.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleOfferingEvent = this.handleOfferingEvent.bind(this);
        this.handleCreateAllSession = this.handleCreateAllSession.bind(this);
        this.handleScheduleAllSessionOfModule = this.handleScheduleAllSessionOfModule.bind(this)
        this.updateStatus = this.updateStatus.bind(this)
    }

     

    
    SampleNextArrow(props) {
        const { className, style, onClick } = props;
        debugger;
        return (
            <button
                className={className}
                style={{
                    ...style,
                    display: "block",
                    width: "47px",
                    height: "47px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(168, 85, 247, 1)",
                    boxShadow:
                        "0 0 1px 1px rgba(20,23,28,.1), 0 3px 1px 0 rgba(20,23,28,.1)",
                    zIndex: "1",
                    // top: "calc( 50% - 25px)",
                }}
                onClick={onClick}
            />
        );
    }

    SamplePrevArrow(props) {
        const { className, style, onClick } = props;
        return (
            <button
                className={className}
                style={{
                    ...style,
                    display: "block",
                    width: "47px",
                    height: "47px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(168, 85, 247, 1)",
                    boxShadow:
                        "0 0 1px 1px rgba(20,23,28,.1), 0 3px 1px 0 rgba(20,23,28,.1)",
                    zIndex: "1",
                    // top: "calc( 50% - 25px)",
                }}
                onClick={onClick}
            />
        );
    }

    settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        initialSlide: 0,
        prevArrow: <this.SamplePrevArrow />,
        nextArrow: <this.SampleNextArrow />,
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true,
                },
            },
            {
                breakpoint: 760,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    initialSlide: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    mentorEnrolId;

    getSchedules = () => {
        console.log("Get Schedules called ", this.props.match.params.enrolId);
        const self = this;
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsGET(
                    { idToken, uid: self.props.auth.uid },
                    `${API_GET_SCHEDULES}?enrollment_id=${self.props.match.params.enrolId}&user_type=${self.props.profile.userType}&course_id=${self.props.match.params.courseId}&user_id=${self.props.profile.sfid}`
                ).then((data) => {
                    console.log("Session Resp ", data);
                    if (data.mentorEnrolId) {
                        self.mentorEnrolId = data.mentorEnrolId;
                    }
                    console.log("Response from SF ", data);

                    if (data && data.error) {
                        console.log("Error to fetch schedules", data.techMsg);
                    } else if (
                        data &&
                        data.sessions &&
                        data.sessions.length > 0
                    ) {
                        self.mentorEnrolId = data.mentorEnrolId;

                        const scheduledEvents = [],
                            nonScheduledEvents = [],
                            unplannedCat=new Map();
                          
                        
                        data.sessions.forEach((schedule) => {
                            console.log("EVENTS", schedule);
                           

                            if (
                                schedule.Status__c === "SCHEDULED" ||
                                schedule.Status__c === "COMPLETED" ||
                                schedule.Status__c === "CANCELLED"
                            ) {
                                scheduledEvents.push({
                                    id: schedule.Id,
                                    title: schedule.Session_Title__c,
                                    start: moment(
                                        schedule.Start_DateTime__c
                                    ).toDate(),
                                    end: moment(
                                        schedule.End_DateTime__c
                                    ).toDate(),
                                    status: schedule.Status__c,
                                    meetingLink: schedule.Meeting_Link__c,
                                    mentorFBId:
                                        schedule.CE_Module__r
                                            .Course_Enrollment__r.Contact__r
                                            .Firebase_Id__c,
                                    sessionAgenda: schedule.Session_Agenda__c,
                                    CE_Module__r: schedule.CE_Module__r
                                });
                            } else {
                                if(unplannedCat.has(schedule.CE_Module__r.Name)){
                                    let sessions = unplannedCat.get(schedule.CE_Module__r.Name)
                                    sessions.push(schedule)
                                    unplannedCat.set(schedule.CE_Module__r.Name,sessions)
                                }else{
                                    unplannedCat.set(schedule.CE_Module__r.Name,[schedule])
                                }
                                nonScheduledEvents.push(schedule);
                            }
                        });
                        console.log("Schedules Event " + scheduledEvents);
                        console.log("Non Schedules Event", nonScheduledEvents);
                        console.log("UnplannedMap",unplannedCat)
                        

                        self.setState({
                            ...self.state,
                            showLoader: false,
                            events: scheduledEvents,
                            unplannedEvents: nonScheduledEvents,
                            menteesEnrolled:data.menteeList,
                            courseMasterName:data.courseMasterName,
                            unplannedMapCat:unplannedCat,
                            courseStartDate:data.mentorsCE?data.mentorsCE.Schedule_Start_Date__c:"",
                            courseEndDate:data.mentorsCE?data.mentorsCE.Schedule_End_Date__c:"",
                            allSessions:data.sessions
                        });
                        debugger;
                        self.getOfferings()
                    }
                    else {
                        console.log("Else block");
                        self.setState({ ...self.state, showLoader: false });
                    }
                });
            });
        console.log("get schedules called");
    };

    getOfferings() {
        console.log("All Sessions here",this.state.allSessions)
        if (this.reCacheOfferings) {
            //fetch the data
            const self = this;
            firebase
                .auth()
                .currentUser.getIdToken(false)
                .then(function (idToken) {
                    httpsGET(
                        { idToken, uid: self.props.auth.uid },
                        `${API_GET_COURSE_OFFERINGS}${self.mentorEnrolId}`
                    ).then((offerings) => {
                        console.log(
                            "Offering response ",
                            offerings
                        );
                        if (offerings && offerings.error) {
                            console.log(offerings.techMsg);
                        } else {
                            self.reCacheOfferings = false;
                            if (offerings.length === 0) {
                                toast.error(
                                    "Module not found for this session! create New one"
                                );
                                self.setState({
                                    ...self.state,
                                    showSessionModal: false,
                                    offerings: offerings,
                                    showModalLoader: false,
                                });
                            } else {
                                console.log(
                                    "Clicked offering Id",
                                    self.state.modalEvent.offeringId
                                );

                                const tempCourseMap = new Map();

                                
                                offerings.forEach((module,i)=>{
                                    let sessions = self.state.allSessions.filter((s)=>{return s.CE_Module__c===module.Id})
                                    let obj = {moduleName:module.Name,sessions:sessions,open:i===0?true:false}
                                    tempCourseMap.set(module.Id,obj)
                                })
                               
                                self.setState({
                                    ...self.state,
                                    offerings: offerings,
                                    modalEvent: {
                                        id: self.state.modalEvent.id
                                            ? self.state.modalEvent.id
                                            : "",
                                        stitle: self.state.modalEvent.stitle
                                            ? self.state.modalEvent.stitle
                                            : "",
                                        start: "",
                                        end: "",
                                        offeringId: self.state.modalEvent
                                            .offeringId
                                            ? self.state.modalEvent.offeringId
                                            : offerings[0].Id,
                                        meetingLink: "",
                                        agenda: "",
                                        selfPaced: false
                                    },
                                    courseMap:tempCourseMap,
                                    showSessionModal: false,
                                    showModalLoader: false,
                                });

                                console.log("Get offering called",tempCourseMap);
                            }
                        }
                    });
                    
                });
        } else {
            console.log("ELSE RUNNING");
            if (this.state.offerings.length === 0) {
                toast.error(
                    "Module not found for this session! create New one"
                );
            } else {
                this.setState({
                    ...this.state,
                    modalEvent: {
                        id: "",
                        stitle: "",
                        start: "",
                        end: "",
                        offeringId: this.state.offerings[0].Id,
                        meetingLink: "",
                    },
                    showSessionModal: true,
                    showModalLoader: false,
                    showLoader: false,
                });
            }
        }
    }

    updateEvents = () => {
        if (this.eventUpdateSet !== undefined && this.eventUpdateSet.size > 0) {
            let eventsToUpdate = [];
            let event;
            this.eventUpdateSet.forEach((eventID) => {
                event = this.state.events.find((evt) => {
                    return evt.id === eventID;
                });

                eventsToUpdate.push({
                    Id: event.id,
                    Start_DateTime__c: event.start,
                    End_DateTime__c: event.end,
                });
            });
            // console.log(eventsToUpdate);
            const self = this;
            firebase
                .auth()
                .currentUser.getIdToken(false)
                .then(function (idToken) {
                    httpsPOST(
                        { idToken, uid: self.props.auth.uid },
                        `${API_POST_UPDATE_SESSIONS}${self.props.match.params.enrolId}`,
                        eventsToUpdate
                    ).then((response) => {
                        console.log(response);
                        if (response && response.error) {
                            console.log(response.techMsg);
                        } else {
                            let senderProfile={
                                uid:self.props.auth.uid,
                                profilePic:self.props.profile.picURL?self.props.profile.picURL:"",
                                Name:self.props.profile.firstName+" "+self.props.profile.lastName
                            }
                            self.props.sendNotificationtoAll({title:event.title,time:moment(event.start).calendar(),meetingLink:event.meetingLink,senderProfile:senderProfile,redirectTo:"/courseschedule/:"},self.state.menteesEnrolled,"sessionRescheduled")
                            console.log(response);
                            self.eventUpdateSet.clear();
                            self.setState({
                                ...self.state,
                                isDirty: false,
                            });
                        }
                    });
                });
        }
    };

    componentDidMount() {
        this.getSchedules();
    }

    handleDragStart = (event) => {
        console.log("Drag Event", event);
        this.setState({ draggedEvent: event });
    };

    dragFromOutsideItem = () => {
        return this.state.draggedEvent;
    };

    onDropFromOutside = ({ start, end, allDay }) => {
        const { draggedEvent } = this.state;

        const event = {
            id: draggedEvent.id,
            title: draggedEvent.title,
            start,
            end,
            allDay: allDay,
        };

        this.setState({ ...this.state, draggedEvent: null });
        this.moveEvent({ event, start, end });
    };

    eventUpdateSet = new Set();

    moveEvent = ({ event, start, end, isAllDay: droppedOnAllDaySlot }) => {
        const { events } = this.state;
        if(!this.isPastDate(start)) {
            let allDay = event.allDay;
            this.eventUpdateSet.add(event.id);
            if (!event.allDay && droppedOnAllDaySlot) {
                allDay = true;
            } else if (event.allDay && !droppedOnAllDaySlot) {
                allDay = false;
            }
    
            const nextEvents = events.map((existingEvent) => {
                return existingEvent.id == event.id
                    ? { ...existingEvent, start, end, allDay }
                    : existingEvent;
            });
            console.log(this.eventUpdateSet);
            this.setState({ ...this.state, events: nextEvents, isDirty: true });
            
        }
    };

    resizeEvent = ({ event, start, end }) => {
        const { events } = this.state;

        const nextEvents = events.map((existingEvent) => {
            return existingEvent.id === event.id
                ? { ...existingEvent, start, end }
                : existingEvent;
        });

        this.setState({ ...this.state, events: nextEvents });

        //alert(`${event.title} was resized to ${start}-${end}`)
    };

    addNewEvent() {
        this.getOfferings();
        // this.setState({...this.state,selectedUnplanned:null})
    }

    addOffering = () => {
        this.setState({
            ...this.state,
            showaddOffering: true,
        });
    };

    handleModalEvent(type) {
        console.log(type);
        if (type === "CLOSE") {
            this.setState({ ...this.state, showSessionModal: false });
        } else if (type === "SAVE") {
            //doing this only because of calendar CSS title conflict
            
            
            if (this.state.modalEvent.stitle.length < 1) {
                console.log("Title not found");
                this.setState({
                    ...this.state,
                    errorModalEvent: {
                        errorSTittle: true,
                        errorStart: false,
                        errorEnd: false,
                        errorOfferingId: false,
                        errorMeetingLink: false,
                        errorAgenda: false,
                    },
                    showLoader: false,
                });
            } else if (this.state.modalEvent.offeringId.length < 1) {
                console.log(
                    "Offering data",
                    JSON.stringify(this.state.offerings)
                );
                console.log("Offering id not found");
                this.setState({
                    ...this.state,
                    errorModalEvent: {
                        errorSTittle: false,
                        errorStart: false,
                        errorEnd: false,
                        errorOfferingId: true,
                        errorMeetingLink: false,
                        errorAgenda: false,
                    },
                    showLoader: false,
                });
            } else if (this.state.modalEvent.start.length < 1) {
                console.log("Module ", this.state.modalEvent.offeringId);
                console.log("Start not found");
                this.setState({
                    ...this.state,
                    errorModalEvent: {
                        errorSTittle: false,
                        errorStart: true,
                        errorEnd: false,
                        errorOfferingId: false,
                        errorMeetingLink: false,
                        errorAgenda: false,
                    },
                    showLoader: false,
                });
            } else if (this.state.modalEvent.end.length < 1) {
                console.log("End not found");
                this.setState({
                    ...this.state,
                    errorModalEvent: {
                        errorSTittle: false,
                        errorStart: false,
                        errorEnd: true,
                        errorOfferingId: false,
                        errorMeetingLink: false,
                        errorAgenda: false,
                    },
                    showLoader: false,
                });
            } else if (!this.state.modalEvent.agenda ||this.state.modalEvent.agenda.length < 1) {
                console.log("Agenda Not found");
                this.setState({
                    ...this.state,
                    errorModalEvent: {
                        errorSTittle: false,
                        errorStart: false,
                        errorEnd: false,
                        errorOfferingId: false,
                        errorMeetingLink: false,
                        errorAgenda: true,
                    },
                    showLoader: false,
                });
            } else {
                try {
                    var now = moment(this.state.modalEvent.start);
                    var hourToCheck = now.day() !== 0 ? 7 : 59;
                    var dateToCheck = now.hour(hourToCheck).minute(0);

                    // if(!moment(this.state.modalEvent.start).isAfter(dateToCheck)){
                    //     toast.error("Choose time after 8AM")
                    // }else

                    if (
                        moment(this.state.modalEvent.end).isSame(
                            moment(this.state.modalEvent.start)
                        )
                    ) {
                        toast.error("Start and end Time can't be same");
                        debugger;
                    } else if (
                        moment(this.state.modalEvent.start).isAfter(
                            moment(this.state.modalEvent.end)
                        ) ||
                        moment(this.state.modalEvent.start).isBefore(
                            moment(Date.now())
                        )
                    ) {
                        toast.error("Invalid time choosen");
                    } 
                    // else if (
                    //     moment(this.state.modalEvent.end).diff(
                    //         moment(this.state.modalEvent.start),
                    //         "h"
                    //     ) > 2
                    // ) {
                    //     toast.error("Session can't be more than 2 hrs");
                    // } 
                    else if(moment(this.state.modalEvent.start).isAfter(moment(this.state.modalEvent.end)) || 
                        moment(this.state.modalEvent.start).isBefore(moment(Date.now()))){
                            if(moment(this.state.modalEvent.start).isAfter(moment(this.state.modalEvent.end))){
                                toast.error("Start time can't be greater than end Time")
                            }else if(moment(this.state.modalEvent.start).isBefore(moment(Date.now()))){
                                toast.error("Start time should be greater than current Time")
                            }
                    }else if(moment(this.state.modalEvent.start).isBefore(moment(this.state.courseStartDate))){
                        toast.error(`Start time can't be less than course start time ${this.state.courseStartDate}`);
                    }else if(moment(this.state.modalEvent.start).isAfter(moment(this.state.courseEndDate))){
                        toast.error(`Start time can't be greater than course end time ${this.state.courseEndDate}`);
                    }else if(moment(this.state.modalEvent.end).isAfter(moment(this.state.courseEndDate))){
                        toast.error(`End time can't be greater than course end time ${this.state.courseEndDate}`);
                    }else if(moment(this.state.modalEvent.end).isBefore(moment(this.state.courseStartDate))){
                        toast.error(`End time can't be less than course start time ${this.state.courseStartDate}`);
                    }
                    else {
                        this.setState({ ...this.state, showModalLoader: true,showSession: false});
                        const self = this;
                        firebase
                            .auth()
                            .currentUser.getIdToken(false)
                            .then(function (idToken) {
                                httpsPOST(
                                    { idToken, uid: self.props.auth.uid },
                                    `${API_POST_CREATE_SESSION}${self.props.match.params.enrolId}/${self.state.modalEvent.offeringId}`,
                                    {
                                        Id: self.state.modalEvent.id,
                                        Session_Title__c:
                                            self.state.modalEvent.stitle,
                                        Start_DateTime__c:
                                            self.state.modalEvent.start,
                                        End_DateTime__c:
                                            self.state.modalEvent.end,
                                        Status__c: "SCHEDULED",
                                        Meeting_Link__c:
                                            self.state.modalEvent.meetingLink,
                                        Session_Agenda__c:
                                            self.state.modalEvent.agenda,
                                        Self_Paced__c:
                                            self.state.modalEvent.selfPaced,
                                    }
                                ).then((session) => {
                                    console.log("Sessions resp", session);
                                    
                                    if (session && session.error) {
                                        console.log(session.techMsg);
                                    } else if (session) {

                                        let newCourseMap = self.state.courseMap;

                                        if (self.state.modalEvent.id) {

                                            let newmap = new Map();
                                            
                                            
                                            for(let x of self.state.unplannedMapCat.entries()){
                                                if(x[1].find((s)=>s.Id===self.state.modalEvent.id)){
                                                    x[1] = x[1].filter((s,i)=>s.Id!==self.state.modalEvent.id)
                                                }
                                                if(x[1].length>0){
                                                    newmap.set(x[0],x[1]);
                                                }else{
                                                    newmap.delete(x[0])
                                                }
                                            }

                                            if(newmap.size===0){
                                                self.setState({
                                                    ...self.state,
                                                    showPdfSenderButton:true    
                                                });
                                            }

                                            self.setState({
                                                ...self.state,
                                                unplannedMapCat:newmap    
                                            });
                                        }

                                        let eventModal = {
                                        id: session.id,
                                        start: self.state.modalEvent.start,
                                        end: self.state.modalEvent.end,
                                        title: self.state.modalEvent.stitle,
                                        offeringId:
                                            self.state.modalEvent.offeringId,
                                        status: "SCHEDULED",
                                        meetingLink:
                                            self.state.modalEvent.meetingLink,
                                        agenda:self.state.modalEvent.agenda
                                      };

                                      let sessionDummy = {
                                          Id:eventModal.id,
                                          Session_Title__c:eventModal.title,
                                          Status__c:eventModal.status,
                                          Start_DateTime__c:eventModal.start,
                                          End_DateTime__c:eventModal.end,
                                          Session_Agenda__c:eventModal.agenda,
                                          CE_Module__c:eventModal.offeringId,
                                          Meeting_Link__c:eventModal.meetingLink
                                      }

                                    if(newCourseMap.get(eventModal.offeringId)){
                                        debugger;
                                        let value = newCourseMap.get(eventModal.offeringId)
                                        if(value.sessions.find((s)=>s.Id===eventModal.id)){
                                            let copySessions = value.sessions.filter((s)=>s.Id!==eventModal.id);
                                            copySessions.push(sessionDummy);
                                            newCourseMap.set(eventModal.offeringId,{moduleName:value.moduleName,sessions:copySessions,open:true});
                                        }else{
                                            value.sessions.push(sessionDummy);
                                            newCourseMap.set(eventModal.offeringId,{moduleName:value.moduleName,sessions:value.sessions,open:true});
                                        }
                                        self.setState({
                                            ...self.state,
                                            courseMap:newCourseMap
                                        })

                                        console.log("NewCourseMap",newCourseMap);
                                        
                                    }

                                      let senderProfile={
                                        uid:self.props.auth.uid,
                                        profilePic:self.props.profile.picURL?self.props.profile.picURL:"",
                                        Name:self.props.profile.firstName+" "+self.props.profile.lastName
                                    }
                                      self.props.sendNotificationtoAll({title:eventModal.title,time:moment(eventModal.start).calendar(),meetingLink:eventModal.meetingLink,senderProfile:senderProfile,redirectTo:"/courseschedule/:"},self.state.menteesEnrolled,"sessionCreated")  
                                      toast.success("New Session Created");
                                      debugger;
                                      console.log("All Events",self.state.events)
                                        //adding event to calendar events;
                                        self.setState({
                                            ...self.state,
                                            showSessionModal: false,
                                            events: [
                                                ...self.state.events,
                                                eventModal,
                                            ],
                                            modalEvent: {
                                                stitle: "",
                                                start: "",
                                                end: "",
                                                offeringId: "",
                                                meetingLink: "",
                                            },
                                            showModalLoader: false,
                                        });
                                    }
                         });
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    handleScheduleAllSessionOfModule(type){
        if (type === "CLOSE") {
            this.setState({ ...this.state, showScheduleAllModuleSessionModal: false });
        } else if (type === "SAVE") {
            //doing this only because of calendar CSS title conflict
            const self = this;
            console.log("Event choosed",self.state.modalEvent)
            if(this.state.modalEvent.start.length<1){
                console.log("Module ",this.state.modalEvent.offeringId)
                console.log("Start not found")
                this.setState({
                    ...this.state,
                    errorModalEvent:{
                        errorSTittle:false,
                        errorStart:true,
                        errorEnd:false,
                        errorOfferingId:false,
                        errorMeetingLink:false,
                        errorAgenda:false
                    },
                    showLoader: false,
                    showModalLoader:false
                });
            }else if(this.state.modalEvent.end.length<1){
                console.log("End not found")
                this.setState({
                    ...this.state,
                    errorModalEvent:{
                        errorSTittle:false,
                        errorStart:false,
                        errorEnd:true,
                        errorOfferingId:false,
                        errorMeetingLink:false,
                        errorAgenda:false
                    },
                    showLoader: false,
                    showModalLoader:false
                });
            }
            
            else if(moment(this.state.modalEvent.start).isAfter(moment(this.state.modalEvent.end)) || 
                moment(this.state.modalEvent.start).isBefore(moment(Date.now()))){
                    if(moment(this.state.modalEvent.start).isAfter(moment(this.state.modalEvent.end))){
                        toast.error("Start time can't be greater than end Time")
                    }else if(moment(this.state.modalEvent.start).isBefore(moment(Date.now()))){
                        toast.error("Start time should be greater than current Time")
                    }
            }else if(moment(this.state.modalEvent.start).isBefore(moment(this.state.courseStartDate))){
                toast.error(`Start time can't be less than course start time ${this.state.courseStartDate}`);
            }else if(moment(this.state.modalEvent.start).isAfter(moment(this.state.courseEndDate))){
                toast.error(`Start time can't be greater than course end time ${this.state.courseEndDate}`);
            }else if(moment(this.state.modalEvent.end).isAfter(moment(this.state.courseEndDate))){
                toast.error(`End time can't be greater than course end time ${this.state.courseEndDate}`);
            }else if(moment(this.state.modalEvent.end).isBefore(moment(this.state.courseStartDate))){
                toast.error(`End time can't be less than course start time ${this.state.courseStartDate}`);
            }
            else{
                try {
                    var now = moment(this.state.modalEvent.start);
                    var hourToCheck = (now.day() !== 0)?7:59;
                    var dateToCheck = now.hour(hourToCheck).minute(0);

                    // if(!moment(this.state.modalEvent.start).isAfter(dateToCheck)){
                    //     toast.error("Choose time after 8AM")
                    // }else 

                    if(moment(this.state.modalEvent.end).isSame(moment(this.state.modalEvent.start)) && this.state.modalEvent.startTime===this.state.modalEvent.endTime){
                        toast.error("Start and end Time can't be same")
                        debugger;
                    }else if(moment(this.state.modalEvent.start).isAfter(moment(this.state.modalEvent.end)) || moment(this.state.modalEvent.start).isBefore(moment(Date.now()))){
                        toast.error("Invalid time choosen")
                    }
                    else{

                        let sessions=[];
                        this.setState({ ...this.state, showLoader: true,showModalLoader:true});

                        for(let i=0;i<=moment(this.state.modalEvent.end).diff(moment(this.state.modalEvent.start),'d');i++){
                            var startTimeAndDate = moment(this.state.modalEvent.start+' '+this.state.modalEvent.startTime).toDate()
                            var endTimeAndDate = moment(this.state.modalEvent.start+' '+this.state.modalEvent.endTime).toDate()

                            var startDate = moment(startTimeAndDate, "DD-MM-YYYY").add(i, 'days').toDate();
                            var endDate = moment(endTimeAndDate, "DD-MM-YYYY").add(i, 'days').toDate();
                            
                            if(i<this.state.selectedModule.length){
                                console.log("UNPLANNEDEVENTS",this.state.selectedModule[i])
                                let body = {
                                    Id: this.state.selectedModule[i].Id,
                                    Session_Title__c:this.state.selectedModule[i].Session_Title__c,
                                    Start_DateTime__c:startDate,
                                    End_DateTime__c:endDate,
                                    Status__c: "SCHEDULED",
                                    CE_Module__c:this.state.selectedModule[i].CE_Module__c,
                                    Meeting_Link__c:
                                        this.state.modalEvent.meetingLink,
                                    Session_Agenda__c:this.state.selectedModule[i].Session_Agenda__c
                                }
                                sessions.push(body)
                                console.log("SESSIONS BODY",body)
                            }else{
                                break;
                            }
                        }
                        
                        const self = this;
                        firebase
                        .auth()
                        .currentUser.getIdToken(false)
                        .then(function (idToken) {
                            httpsPOST(
                                { idToken, uid: self.props.auth.uid },
                                `${API_POST_UPDATE_SESSIONS}${self.props.match.params.enrolId}`,
                                sessions
                            ).then((session) => {
                                self.setState({ ...self.state, showLoader: false,showModalLoader:false});

                                toast(`${session.length} session schedule`)
                                console.log("Sessions resp", session);
                                let meeting_link;

                                let moduleNameKey = self.state.selectedModule[0].CE_Module__r.Name
                                let moduleIdKey = self.state.selectedModule[0].CE_Module__c
                                if (session && session.error) {
                                    console.log(session.techMsg);
                                } else if (session) {

                                    console.log("PROCESSINGDATA",self.state.selectedModule)

                                   
                                    sessions.forEach((s,i)=>{

                                        if(session.find((scheduledSession)=>scheduledSession.id===s.Id)){
                                            
                                            const updatedUnplannedEvent = self.state.selectedModule.filter((sessionData,i)=>{return sessionData.Id!==s.Id}) 
                                            let newMap = new Map(self.state.unplannedMapCat)  

                                            if(updatedUnplannedEvent.length>0){
                                                newMap.set(moduleNameKey,updatedUnplannedEvent)
                                            }else{
                                                newMap.delete(moduleNameKey)
                                            }
    
                                            self.setState({
                                                ...self.state,
                                                selectedModule:updatedUnplannedEvent,
                                                unplannedMapCat:newMap
                                            });

                                            meeting_link = s.Meeting_Link__c

                                            let eventModal = {
                                                id: s.Id,
                                                start: s.Start_DateTime__c,
                                                end: s.End_DateTime__c,
                                                title:s.Session_Title__c,
                                                offeringId:s.CE_Module__c,
                                                status: "SCHEDULED",
                                                meetingLink:
                                                    self.state.modalEvent.meetingLink,
                                            };

                                            self.setState({
                                                ...self.state,
                                                showScheduleAllModuleSessionModal: false,
                                                events: [
                                                    ...self.state.events,
                                                    eventModal,
                                                ],
                                                modalEvent: {
                                                    stitle: "",
                                                    start: "",
                                                    end: "",
                                                    offeringId: "",
                                                    meetingLink: "",
                                                },
                                                showLoader: false,
                                                showModalLoader:false
                                            });
    
                                        }
                                    })

                                    let courseMapCopy = self.state.courseMap
                                    courseMapCopy.set(moduleIdKey,{moduleName:moduleNameKey,open:true,sessions:sessions})
                                    self.setState({
                                        ...self.state,
                                        courseMap: courseMapCopy
                                    })

                                    if(self.state.unplannedMapCat.size===0){
                                        self.setState({
                                            ...self.state,
                                           showPdfSenderButton:true
                                        });
                                    }

                                    let senderProfile={
                                        uid:self.props.auth.uid,
                                        profilePic:self.props.profile.picURL?self.props.profile.picURL:"",
                                        Name:self.props.profile.firstName+" "+self.props.profile.lastName
                                    }
                                    console.log("Last Event",self.state.events[self.state.events.length-1])
                                    self.props.sendNotificationtoAll({title:sessions.length,time:moment(self.state.events[self.state.events.length-1].start).calendar(),meetingLink:meeting_link,senderProfile:senderProfile,redirectTo:"/courseschedule/:"},self.state.menteesEnrolled,"sessionCreated")  
                                    // toast.success("Session has scheduled");
                                    //adding event to calendar events;
                                }
                            });
                        });
                    }
                } catch (error) {
                    this.setState({ ...this.state, showLoader: false,showModalLoader: false});
                    console.log(error)
                }
            }
        }
    }

    handleCreateAllSession(type) {
        if (type === "CLOSE") {
            this.setState({ ...this.state, showScheduleAllSessionModal: false });
        } else if (type === "SAVE") {
            //doing this only because of calendar CSS title conflict
            const self = this;
            console.log("Event choosed",self.state.modalEvent)
            if(this.state.modalEvent.start.length<1){
                console.log("Module ",this.state.modalEvent.offeringId)
                console.log("Start not found")
                this.setState({
                    ...this.state,
                    errorModalEvent:{
                        errorSTittle:false,
                        errorStart:true,
                        errorEnd:false,
                        errorOfferingId:false,
                        errorMeetingLink:false,
                        errorAgenda:false
                    },
                    showLoader: false,
                });
            }else if(this.state.modalEvent.end.length<1){
                console.log("End not found")
                this.setState({
                    ...this.state,
                    errorModalEvent:{
                        errorSTittle:false,
                        errorStart:false,
                        errorEnd:true,
                        errorOfferingId:false,
                        errorMeetingLink:false,
                        errorAgenda:false
                    },
                    showLoader: false,
                });
            }
            else{
                try {
                    

                    var now = moment(this.state.modalEvent.start);
                    var hourToCheck = (now.day() !== 0)?7:59;
                    var dateToCheck = now.hour(hourToCheck).minute(0);

                    // if(!moment(this.state.modalEvent.start).isAfter(dateToCheck)){
                    //     toast.error("Choose time after 8AM")
                    // }else 

                    if(moment(this.state.modalEvent.end).isSame(moment(this.state.modalEvent.start)) && this.state.modalEvent.startTime===this.state.modalEvent.endTime){
                        toast.error("Start and end Time can't be same")
                        debugger;
                    }else if(moment(this.state.modalEvent.start).isAfter(moment(this.state.modalEvent.end)) || moment(this.state.modalEvent.start).isBefore(moment(Date.now()))){
                        toast.error("Invalid time choosen")
                    }
                    else{

                        let sessions=[];
                        this.setState({ ...this.state, showLoader: false});

                        for(let i=0;i<=moment(this.state.modalEvent.end).diff(moment(this.state.modalEvent.start),'d');i++){
                            var startTimeAndDate = moment(this.state.modalEvent.start+' '+this.state.modalEvent.startTime).toDate()
                            var endTimeAndDate = moment(this.state.modalEvent.start+' '+this.state.modalEvent.endTime).toDate()

                            var startDate = moment(startTimeAndDate, "DD-MM-YYYY").add(i, 'days').toDate();
                            var endDate = moment(endTimeAndDate, "DD-MM-YYYY").add(i, 'days').toDate();
                            
                            if(i<this.state.unplannedEvents.length){
                                console.log("UNPLANNEDEVENTS",this.state.unplannedEvents[i])
                                let body = {
                                    Id: this.state.unplannedEvents[i].Id,
                                    Session_Title__c:this.state.unplannedEvents[i].Session_Title__c,
                                    Start_DateTime__c:startDate,
                                    End_DateTime__c:endDate,
                                    Status__c: "SCHEDULED",
                                    CE_Module__c:this.state.unplannedEvents[i].CE_Module__c,
                                    Meeting_Link__c:
                                        this.state.modalEvent.meetingLink,
                                    Session_Agenda__c:this.state.unplannedEvents[i].Session_Agenda__c
                                }
                                sessions.push(body)
                                console.log("SESSIONS BODY",body)
                            }else{
                                break;
                            }
                        }
                        
                        const self = this;
                        firebase
                        .auth()
                        .currentUser.getIdToken(false)
                        .then(function (idToken) {
                            httpsPOST(
                                { idToken, uid: self.props.auth.uid },
                                `${API_POST_UPDATE_SESSIONS}${self.props.match.params.enrolId}`,
                                sessions
                            ).then((session) => {
                                console.log("Sessions resp", session);
                                let meeting_link;
                                if (session && session.error) {
                                    console.log(session.techMsg);
                                } else if (session) {
                                    sessions.forEach((s,i)=>{
                                        const index =
                                            self.state.unplannedEvents.findIndex(
                                                (event) =>
                                                    event.Id ===
                                                    s.Id
                                        );
                                        const updatedUnplannedEvent = update(
                                            self.state.unplannedEvents,
                                            {
                                                $splice: [[index, 1]],
                                            }
                                        );

                                        self.setState({
                                            ...self.state,
                                            unplannedEvents:
                                                updatedUnplannedEvent,
                                        });

                                        meeting_link = s.Meeting_Link__c

                                        let eventModal = {
                                            id: s.Id,
                                            start: s.Start_DateTime__c,
                                            end: s.End_DateTime__c,
                                            title:s.Session_Title__c,
                                            offeringId:s.CE_Module__c,
                                            status: "SCHEDULED",
                                            meetingLink:
                                                self.state.modalEvent.meetingLink,
                                        };


                                        self.setState({
                                            ...self.state,
                                            showScheduleAllSessionModal: false,
                                            events: [
                                                ...self.state.events,
                                                eventModal,
                                            ],
                                            modalEvent: {
                                                stitle: "",
                                                start: "",
                                                end: "",
                                                offeringId: "",
                                                meetingLink: "",
                                            },
                                            showLoader: false,
                                        });

                                    })
                                    let senderProfile={
                                        uid:self.props.auth.uid,
                                        profilePic:self.props.profile.picURL?self.props.profile.picURL:"",
                                        Name:self.props.profile.firstName+" "+self.props.profile.lastName
                                    }
                                    console.log("Last Event",self.state.events[self.state.events.length-1])
                                    self.props.sendNotificationtoAll({title:sessions.length,time:moment(self.state.events[self.state.events.length-1].start).calendar(),meetingLink:meeting_link,senderProfile:senderProfile,redirectTo:"/courseschedule/:"},self.state.menteesEnrolled,"sessionCreated")  
                                    toast.success("Session has scheduled");
                                    //adding event to calendar events;
                                }
                            });
                        });
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }


  handleOfferingEvent(type) {
        if (type === "CLOSE") {
            this.setState({
                ...this.state,
                offeringName: "",
                showaddOffering: false,
            });
        } else if (type === "SAVE") {
            //doing this only because of calendar CSS title conflict

            if(this.state.offeringName.length===0){
                this.setState({
                    ...this.state,
                    errorOTittle:true,
                    showLoader: false,
                });
            }else{
               
                const self = this;
                self.setState({
                    ...self.state,
                    showLoader: true,
                });

                firebase
                .auth()
                .currentUser.getIdToken(false)
                .then(function (idToken) {
                    httpsPOST(
                        { idToken, uid: self.props.auth.uid },
                        `${API_POST_CREATE_OFFERING}${self.props.match.params.courseId}/${self.props.match.params.enrolId}`,
                        {
                            Name: self.state.offeringName,
                            Active__c: true,
                            Description__c: self.state.offeringDescription,
                        }
                    ).then((sfOffering) => {
                        
                        let tempCourseMap = self.state.courseMap;
                        debugger;

                        tempCourseMap.set(sfOffering.id,{moduleName:self.state.offeringName,sessions:[],open:false});

                        self.setState({
                            ...self.state,
                            showLoader: false,
                        });

                        if (sfOffering && sfOffering.error) {
                            console.log(sfOffering.techMsg);
                        } else if (sfOffering) {
                            console.log("MODULE CREATED ", tempCourseMap);
                            let offering = {
                                Name: self.state.offeringName,
                                Id: sfOffering.id,
                            };

                            self.setState({
                                ...self.state,
                                showaddOffering: false,
                                offerings: [...self.state.offerings, offering],
                                courseMap: tempCourseMap
                            });
                            toast.success(
                                self.state.offeringName + " Module created"
                            );
                        }
                    });
                });
            }
        }
    }

    updateSession = (event) => {
        console.log("Update Session Event ", event);

        this.setState({
            ...this.state,
            modalEvent: {
                stitle: event.title,
                start: moment(event.start),
                end: moment(event.end),
                offeringId: "",
                meetingLink: "",
            },
            showSessionModal: true,
            showModalLoader: false,
            showLoader: false,
        });
    };

    eventStyleGetter = (event, start, end, isSelected) => {
        let bgColor = "#" + event.hexColor;
        if (event.status === "COMPLETED") bgColor = "#0C8C06";
        else if (event.status === "CANCELLED") bgColor = "#DC2626";
        let style = {
            //all styles here.
            backgroundColor: bgColor,
        };
        return {
            style: style,
        };
    };

    isPastDate = (firstDate) => firstDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

    dayPropGetter = (date) => {
        let style;
        if(this.isPastDate(date)) {
            style = {
                backgroundColor: "#e6e6e6",
            };
        }
        return {
            style: style,
        };
    };

    addSession = (event) => {
        console.log("Event clicked ",event);

        this.getOfferings();

        let modalEvent = {
            id: event.Id,
            offeringId: event.CE_Module__c,
            stitle: event.Session_Title__c,
            start: event.Start_DateTime__c?event.Start_DateTime__c:"",
            end: event.End_DateTime__c?event.End_DateTime__c:"",
            agenda:event.Session_Agenda__c,
            meetingLink: event.Meeting_Link__c?event.Meeting_Link__c:"",
        };

        debugger;
        this.setState({
            ...this.state,
            modalEvent: modalEvent,
            showSessionModal: true,
            showModalLoader: false,
        });
    };

    scheduleCompleted = () => {
        //TODO: API call to complete schedule
    };

    eventOperationModal = () => {
        return (
            <div
                className="min-w-screen h-screen animated fadeIn faster  fixed  left-0 top-0 flex justify-center items-center inset-0 z-50 outline-none focus:outline-none bg-no-repeat bg-center bg-cover"
                id="modal-id"
            >
                <div className="absolute bg-black opacity-90 inset-0 z-0"></div>
                <div className="w-full  max-w-lg p-5 relative mx-auto my-auto rounded-xl shadow-lg  bg-white ">
                    <div class="grid  gap-8 grid-cols-1">
                        <div class="flex flex-col ">
                            <div class="flex flex-col sm:flex-row items-center">
                                <h2 class="font-semibold text-lg mr-auto">
                                    Update Session
                                </h2>
                                <button
                                    className="bg-transparent border-0 text-black opacity-6 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                    onClick={() =>
                                        this.setState({
                                            ...this.state,
                                            showEventOperationModal: false,
                                        })
                                    }
                                >
                                    <span className="bg-transparent opacity-1 text-black h-6 w-6 text-2xl block outline-none focus:outline-none">
                                        ×
                                    </span>
                                </button>
                            </div>
                            <div class="mt-8">
                                <div class="form">
                                    <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                        <div class="mb-3 space-y-2 w-full text-xs">
                                            <button
                                                class="mb-2  text-white bg-gray-700 md:mb-0 px-5 py-2 w-full text-sm shadow-sm font-medium tracking-wider border hover:shadow-lg hover:bg-black"
                                                onClick={() =>
                                                    this.sessionComplete()
                                                }
                                            >
                                                <TiTick size={23} className="inline text-white" />
                                                <span>Mark As Completed</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                        <div class="mb-3 space-y-2 w-full text-xs">
                                            {console.log(
                                                "selectedEvent",
                                                this.state.selectedEvent
                                            )}
                                            <button
                                                class="mb-2  text-white bg-gray-700 md:mb-0 px-5 py-2 w-full text-sm shadow-sm font-medium tracking-wider border hover:shadow-lg hover:bg-black"
                                                onClick={() => {
                                                    console.log("sessiondetails",this.state.selectedEvent)
                                                    this.props.history.push(`/learn/${this.props.match.params.enrolId}`)
                                                    // this.props.history.push({
                                                    //     pathname: `/s/${this.props.match.params.enrolId}/${this.state.selectedEvent.id}`,
                                                    //     state: {
                                                    //         sessionDetail:
                                                    //             this.state
                                                    //                 .selectedEvent,
                                                    //         mentorFBId:
                                                    //             this.props.auth
                                                    //                 .uid,
                                                    //         courseMaster:this.props.location.state        
                                                    //     },
                                                    // });
                                                }}
                                            >
                                                <TiAttachment size={23} className="inline text-white" />
                                                <span>Notes & attachments</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="md:flex md:flex-row md:space-x-4 w-full text-xs">
                                        <div class="w-full flex flex-col mb-3">
                                            <button
                                                class="mb-2 md:mb-0 bg-white px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-gray-600 hover:shadow-lg hover:bg-gray-100"
                                                onClick={() =>
                                                    this.cancelSession()
                                                }
                                            >
                                                <TiCancel size={23} className="inline text-gray-600" />
                                                <span>Cancel Session</span>
                                            </button>
                                        </div>
                                        <div class="w-full flex flex-col mb-3">
                                            <button
                                                class="mb-2 md:mb-0 bg-red-500 px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-white hover:shadow-lg hover:bg-red-800"
                                                onClick={() =>
                                                    this.deleteSession()
                                                }
                                            >
                                                <MdDeleteForever size={23} className="inline text-white" />
                                                <span>Delete Session</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

   sessionComplete =()=>{
        this.setState({ ...this.state, showLoader: true });
        let eventToUpdate = [
            { Id: this.state.selectedEvent.id, Status__c: "COMPLETED" },
        ];
        const self = this;
        const uid = self.props.auth.uid
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsPOST(
                    { idToken, uid},
                    `${API_POST_UPDATE_SESSIONS}${self.props.match.params.enrolId}`,
                    eventToUpdate
                ).then((response) => {
                    console.log(response);
                    if (response && response.error) {
                        console.log(response.techMsg);
                        self.setState({
                            ...self.state,
                            showLoader: false,
                        });
                    } else {
                        console.log(response);
                        let event = self.state.selectedEvent
                        event.status = "COMPLETED";

                        const index = self.state.events.findIndex(
                            (evt) => evt.id === event.id
                        );
                        const updatedEvents = update(
                            self.state.events,
                            {
                                $splice: [[index, 1, event]],
                            }
                        );

                        console.log("UpdatedEvents",event)
                        let senderProfile={
                            uid:self.props.auth.uid,
                            profilePic:self.props.profile.picURL?self.props.profile.picURL:"",
                            Name:self.props.profile.firstName+" "+self.props.profile.lastName
                        }
                        self.props.sendNotificationtoAll({title:event.title,senderProfile:senderProfile,redirectTo:"/courseschedule/:"},self.state.menteesEnrolled,"sessionCompleted")  

                        self.setState({
                            ...self.state,
                            events: updatedEvents,
                            showLoader: false,
                            showEventOperationModal:false
                        });
                    }
                });
            });
    }

 cancelSession =()=>{
        this.setState({ ...this.state, showLoader: true });
        console.log("SelectedEvent",this.state.selectedEvent)
        let event = this.state.selectedEvent
    
        const self = this;
        const uid = self.props.auth.uid
        let eventToUpdate = [
            { Id: this.state.selectedEvent.id, Status__c: "CANCELLED" },
        ];
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsPOST(
                    { idToken, uid},
                    `${API_POST_UPDATE_SESSIONS}${self.props.match.params.enrolId}`,
                    eventToUpdate
                ).then((response) => {
                    console.log(response);
                    if (response && response.error) {
                        console.log(response.techMsg);
                        self.setState({
                            ...self.state,
                            showLoader: false,
                        });
                        toast.error(response.error)
                    } else {
                        console.log(response);
                        event.status = "CANCELLED";

                        const index = self.state.events.findIndex(
                            (evt) => evt.id === event.id
                        );
                        const updatedEvents = update(
                            self.state.events,
                            {
                                $splice: [[index, 1, event]],
                            }
                        );
                        let senderProfile={
                            uid:self.props.auth.uid,
                            profilePic:self.props.profile.picURL?self.props.profile.picURL:"",
                            Name:self.props.profile.firstName+" "+self.props.profile.lastName
                        }

                        self.props.sendNotificationtoAll({title:event.title,senderProfile:senderProfile,redirectTo:"/courseschedule/:"},self.state.menteesEnrolled,"sessionCancelled")  

                        self.setState({
                            ...self.state,
                            events: updatedEvents,
                            showLoader: false,
                        });
                        self.setState({...self.state,showEventOperationModal:false})
                        toast.error("Session cancelled")
                    }
                  
                });
        })
    }

    deleteSession = () => {
        this.setState({ ...this.state, showConfirmAlertDelete: true });
    };

    courseActions = () => {
        return (
            <div className="grid grid-cols-2 divide-x divide-white mb-4 bg-blueGray-600 p-4 border-t border-t-1 border-white">
                <div className="flex justify-center">
                    <button
                        className="bg-purple-500 hover:bg-purple-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => this.addNewEvent()}
                    >
                        <FiPlus size={23} className="inline text-white" />
                        <span>Add Session</span>
                    </button>
                </div>
                <div className="flex justify-center">
                    <button
                        className="bg-purple-500 hover:bg-purple-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => this.addOffering()}
                    >
                        <FiPlus size={23} className="inline text-white " />
                        <span>Add Module</span>
                    </button>
                </div>
            </div>
        );
    };

    courseSchedule = () => {
        return (
            <div className="md:mt-10 mt-3 c-card block bg-white shadow-md hover:shadow-xl rounded-lg overflow-hidden p-4">
                {this.state.showLoader ? (
                    <div className="flex items-center justify-center h-3/6">
                        <LoaderLarge type="ThreeDots" />
                    </div>
                ) : (
                    <CourseCalendar
                        selectable
                        localizer={localizer}
                        events={this.state.events}
                        onEventDrop={this.moveEvent}
                        resizable={false}
                        onEventResize={this.resizeEvent}
                        defaultView={Views.MONTH}
                        defaultDate={new Date()}
                        popup={true}
                        dayPropGetter={this.dayPropGetter}
                        dragFromOutsideItem={
                            this.state.displayDragItemInCell
                                ? this.dragFromOutsideItem
                                : null
                        }
                        onDropFromOutside={this.onDropFromOutside}
                        handleDragStart={this.handleDragStart}
                        style={{ height: "85vh" }}
                        draggableAccessor={(event) => {
                            if (
                                this.props.profile.userType !== "student" &&
                                event.status === "SCHEDULED"
                            ) {
                                return true;
                            } else return false;
                        }}
                        eventPropGetter={this.eventStyleGetter}
                        onSelectEvent={(event) => {
                            if (
                                event.status === "COMPLETED" ||
                                (event.status === "SCHEDULED" &&
                                    this.props.profile.userType === "student")
                            ) {
                                if (this.props.profile.userType === "student") {
                                    console.log("sessiondetails",event)
                                    this.props.history.push(`/learn/${this.props.match.params.enrolId}`)
                                    // this.props.history.push({
                                    //     pathname: `/s/${this.props.match.params.enrolId}/${event.id}`,
                                    //     state: {
                                    //         mentorCourseId: this.mentorEnrolId,
                                    //         mentorFBId: event.mentorFBId,
                                    //         sessionDetail: event,
                                    //         courseMaster:this.props.location.state   
                                    //     },
                                    // });
                                } else {
                                    console.log("sessiondetails",event)
                                    this.props.history.push(`/learn/${this.props.match.params.enrolId}`)
                                    // this.props.history.push({
                                    //     pathname: `/s/${this.props.match.params.enrolId}/${event.id}`,
                                    //     state: {
                                    //         mentorCourseId: this.mentorEnrolId,
                                    //         mentorFBId: event.mentorFBId,
                                    //         sessionDetail: event,
                                    //         courseMaster:this.props.location.state  
                                    //     },
                                    // });
                                }
                            } else if (
                                event.status === "SCHEDULED" &&
                                this.props.profile.userType === "instructor"
                            ) {
                                this.setState({
                                    ...this.state,
                                    showEventOperationModal: true,
                                    selectedEvent: event,
                                });
                                // this.closeEvent(event);
                            }
                        }}
                    />
                )}
            </div>
        );
    };
    toolTipContent = (unscheduledSessionOfModule)=>{
        console.log("TOOLTIPCONTENT",unscheduledSessionOfModule);
        return(
            <>
                {unscheduledSessionOfModule && unscheduledSessionOfModule.length>0?
                    <div className="flex flex-col justify-center mt-2">
                        <h1 className="text-base text-gray-600 text-start">{unscheduledSessionOfModule[0].CE_Module__r.Name}</h1>
                    <button
                        className="bg-gray-700 hover:bg-black text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={() =>{

                            this.setState({
                                ...this.state,
                                showScheduleAllModuleSessionModal: true,
                                selectedModule:unscheduledSessionOfModule
                            });
                        }}
                    >
                        <span>Schedule All</span>
                    </button>
                </div>:<></>
                }
            </>
        )
    }

    
    tooltipTrigger=(key,value)=>{
        return (
            <div className="bg-blueGray-600 p-4 border border-blueGray-800">
                <div classname="flex flex-col group">
                    <h1 className="text-white text-left text-xl mb-2">{key}</h1>
                    <Slider {...this.settings}>
                        {value.map((event, index) => {
                            console.log("EVENTTHEYSAY",event)
                            return (
                                <div
                                    className="w-full p-1"
                                    key={index}
                                    onClick={() => {
                                        this.addSession(event);
                                    }}
                                >
                                    <div
                                        className="card flex flex-col justify-center p-4 bg-white rounded-lg shadow md:max-w-xs cursor-pointer"
                                        title="Click to add it to calendar"
                                    >
                                        <div>
                                            <p className="text-md uppercase text-gray-900 font-semibold text-center truncate md:overflow-clip">
                                                {event.Session_Title__c}
                                            </p>
                                            <hr />

                                            {/* <div className="truncate md:overflow-clip">
                                                <p className="text-sm mt-4 text-center">
                                                    {event.Name}
                                                </p>
                                            </div> */}

                                            <div className="flex flex-col md:flex-row justify-center items-center mt-2">
                                                <div className="py-1 px-2 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs truncate md:overflow-clip">
                                                    <p className="truncate">
                                                        {event.Name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </Slider>

                    <div className="flex flex-row justify-end">
                        <button class="text-white hidden group-hover:block bg-purple-500 px-5 py-2 text-xl rounded-sm mt-3">
                            schedule All
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    unscheduledSessionsByCategory = ()=>{
        const tooltips = [];

        this.state.unplannedMapCat.forEach((key,value)=>{
            debugger;
                console.log("MAP KEYS",key);
               tooltips.push(
                    <Tooltip
                    children={this.tooltipTrigger(value,key)}
                    placement="right"
                    trigger="hover"
                    delayShow={300}
                    tooltip={this.toolTipContent(key)}
                >
                
                </Tooltip>
               )
           })

           return tooltips;
        // return(
        //    <>
        //    {this.state.unplannedMapCat.forEach((key,value)=>{
        //        tooltips.push(
        //             <Tooltip
        //             children={this.tooltipTrigger(key,value)}
        //             placement="right"
        //             trigger="hover"
        //             delayShow={300}
        //             tooltip={this.toolTipContent(value)}
        //         >
                
        //         </Tooltip>
        //        )
        //    })}

        //   return 
           
        //     {/* {[...this.state.unplannedMapCat].map(([key,value])=>{
        //         return(
                    
        //         )
        //     })} */}
        //     </>
        // )
    }
    unscheduledSessions = () => {
        return (
            <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-4">
                <div className="flex flex-col items-center mb-2">
                    <p className="text-white">
                        Pre configured sessions, please click on the tiles to
                        add session to the calender.
                    </p>
                </div>
                <Slider {...this.settings}>
                    {this.state.unplannedEvents.map((event, index) => {
                        return (
                            <div
                                className="w-full p-1"
                                key={index}
                                onClick={() => {
                                    this.addSession(event);
                                }}
                            >
                                <div
                                    className="card flex flex-col justify-center p-4 bg-white rounded-lg shadow md:max-w-xs cursor-pointer"
                                    title="Click to add it to calendar"
                                >
                                    <div className="">
                                        <p className="text-lg uppercase text-gray-900 font-bold text-center truncate md:overflow-clip">
                                            {event.Session_Title__c}
                                        </p>
                                        <hr />

                                        <div className="truncate md:overflow-clip">
                                            <p className="text-sm mt-4 text-center">
                                                {event.Name}
                                            </p>
                                        </div>

                                        <div className="flex flex-col md:flex-row justify-center items-center mt-2">
                                            <div className="py-1 px-2 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs truncate md:overflow-clip">
                                                <p className="truncate">
                                                    {event.CE_Module__r
                                                        ? event.CE_Module__r
                                                              .Name
                                                        : ""}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </Slider>
                {this.state.unplannedEvents.length > 0 && 
                <div className="flex justify-center mt-2">
                <button
                    className="bg-purple-500 hover:bg-purple-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() =>{
                        this.setState({
                            ...this.state,
                            showScheduleAllSessionModal: true,
                        });
                    }}
                >
                    <span>Schedule All</span>
                </button>
            </div>}
            </div>
        );
    };

    handleDateChange = (moment, name) => {
        try {
            let modalEvent = { ...this.state.modalEvent };
            modalEvent[name] = moment.toDate();
            this.setState({ ...this.state, modalEvent: modalEvent });
        } catch (error) {
            console.log(error);
        }
    };

    handleInput = (e) => {
        let modalEvent = { ...this.state.modalEvent };
        if (e.target.id === "selfPaced") {
            modalEvent[e.target.id] = !modalEvent.selfPaced;
        } else {
            modalEvent[e.target.id] = e.target.value;
        }
        this.setState({ ...this.state, modalEvent: modalEvent });
    };

    handleOfferingInput = (e) => {
        this.setState({ ...this.state, [e.target.id]: e.target.value });
    };

    yesterday = moment().subtract(1, "day");
    valid(current) {
        return current.isAfter(this.yesterday);
    }

addOfferingUi=()=>{
        return(
            <div class="grid gap-8 grid-cols-1">
                <div class="flex flex-col ">
                        <div class="flex flex-col sm:flex-row items-center">
                            <h2 class="font-semibold text-lg mr-auto">Create Module</h2>
                        </div>
                        <div class="mt-2">
                            <div class="form">
                                <div class="md:space-y-2 mb-3">
                                    <div class="mb-3 space-y-2 w-full text-xs">
                                        <label class=" font-semibold text-gray-600 py-2">Module title</label>
                                        <div class="flex flex-wrap items-stretch w-full mb-4 relative">
                                            <input className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"  type="text" id="offeringName" onChange={this.handleOfferingInput}/>
                                            {this.state.errorOTittle?<p className="text-red-500">Enter Module name</p>:null}
                                        </div>
                                    </div>

                                    <div class="mb-3 space-y-2 w-full text-xs">
                                        <label class=" font-semibold text-gray-600 py-2">Short Description</label>
                                        <div class="flex flex-wrap items-stretch w-full mb-4 relative">
                                            <input className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4" 
                                              type="text"
                                              id="offeringDescription" onChange={this.handleOfferingInput} />
                                            {this.state.errorModalEvent.errorSTittle?<p className="text-red-500">Enter Description</p>:null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>
            </div> 
        )
    }
   
    createMeetingLinkForAllSession=()=>{
        if(this.state.modalEvent.start && this.state.modalEvent.end){

            const gapi = window.gapi
            const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
            const API_KEY = process.env.GOOGLE_API_KEY;
            var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
            var SCOPES = "https://www.googleapis.com/auth/calendar"
            

            let title = "";
            for(let i=0;i<=moment(this.state.modalEvent.end).diff(moment(this.state.modalEvent.start),'d');i++){
                if(i<this.state.unplannedEvents.length){
                    title+=this.state.unplannedEvents[i].Name+", "
                }else{
                    break;
                }
            }

            let startTime = moment(this.state.modalEvent.start+' '+this.state.modalEvent.startTime).toDate()
            let endTime = moment(this.state.modalEvent.end+' '+this.state.modalEvent.endTime).toDate()

            let menteeEnrolled =[] 
            this.state.menteesEnrolled.forEach((mentee)=>{menteeEnrolled.push({email:mentee.Contact__r.Email})})
     
             gapi.load('client:auth2', ()=>{
                 gapi.client.init({
                     apiKey: API_KEY,
                     clientId: CLIENT_ID,
                     discoveryDocs: DISCOVERY_DOCS,
                     scope: SCOPES,
                   })
     
                   gapi.client.load('calendar', 'v3', () => console.log('bam!'))
     
                   gapi.auth2.getAuthInstance().signIn().then(()=>{
                       console.log("Signed in")
     
                       var event = {
                         'summary': title+" Modules",
                         'location': '800 Howard St., San Francisco, CA 94103',
                         'description': 'Really great refreshments',
                         'start': {
                           'dateTime': startTime,
                           'timeZone': 'America/Los_Angeles'
                         },
                         'end': {
                           'dateTime': endTime,
                           'timeZone': 'America/Los_Angeles'
                         },
                         "conferenceData": {
                             "createRequest": {
                               "conferenceSolutionKey": {
                                 "type": "hangoutsMeet"
                               },
                               "requestId": "test"
                             }
                           },
                       
                         'attendees':menteeEnrolled
                       }
                       
                       var request = gapi.client.calendar.events.insert({
                         'calendarId': 'primary',
                         'resource': event,
                         conferenceDataVersion:1
                       })
                       
               
                       request.execute(event => {
                         console.log(event)
                         let modalEvent = { ...this.state.modalEvent };
                         modalEvent.meetingLink = event.hangoutLink;
                         this.setState({ ...this.state, modalEvent: modalEvent });
                         // window.open(event.htmlLink)
                       })
                   }).catch((error)=>{
                       console.log(error)
                   })
             })
         }else{
             toast.warn("Choose session name, and timings first")
         }
    }
   
    googleCalendarSignin=()=>{
        if(this.state.modalEvent.start && this.state.modalEvent.end){

       const gapi = window.gapi
       const CLIENT_ID = "231242274993-gr6p79cj0cn8gdshu3tv6p4m1v7fum4e.apps.googleusercontent.com"
       const API_KEY = "AIzaSyDmumjpza4_gB2fGL2SPGbqjV_aT88zmJI"
       var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
       var SCOPES = "https://www.googleapis.com/auth/calendar"
       
       let title = this.state.modalEvent.stitle 
       let startTime = this.state.modalEvent.start
       let endTime = this.state.modalEvent.end

      

        gapi.load('client:auth2', ()=>{
            gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES,
              })

              gapi.client.load('calendar', 'v3', () => console.log('bam!'))
              let menteeEnrolled =[] 
              this.state.menteesEnrolled.forEach((mentee)=>{menteeEnrolled.push({'email':mentee.Contact__r.Email})})
       
              console.log("MenteeParticipated in Meeting",menteeEnrolled)

              gapi.auth2.getAuthInstance().signIn().then(()=>{
                  console.log("Signed in")

                  let menteeEnrolled =[] 
                  this.state.menteesEnrolled.forEach((mentee)=>{menteeEnrolled.push({'email':mentee.Contact__r.Email})})
           
                  console.log("MenteeParticipated in Meeting",menteeEnrolled)
                  var event = {
                    'summary': title,
                    'location': '800 Howard St., San Francisco, CA 94103',
                    'description': 'Really great refreshments',
                    'start': {
                      'dateTime': startTime,
                      'timeZone': 'America/Los_Angeles'
                    },
                    'end': {
                      'dateTime': endTime,
                      'timeZone': 'America/Los_Angeles'
                    },
                    "conferenceData": {
                        "createRequest": {
                          "conferenceSolutionKey": {
                            "type": "hangoutsMeet"
                          },
                          "requestId": "test"
                        }
                      },
                  
                    'attendees': menteeEnrolled
                  }
                  
                  var request = gapi.client.calendar.events.insert({
                    'calendarId': 'primary',
                    'resource': event,
                    conferenceDataVersion:1
                  })
                  
          
                  request.execute(event => {
                    console.log(event)
                    let modalEvent = { ...this.state.modalEvent };
                    modalEvent.meetingLink = event.hangoutLink;
                    this.setState({ ...this.state, modalEvent: modalEvent });
                    // window.open(event.htmlLink)
                  })
              }).catch((error)=>{
                  console.log(error)
              })
        })
    }else{
        toast.warn("Choose session name, and timings first")
    }
    }

    sessionModalUi = () => {
        return this.state.showModalLoader ? (
            <div className="flex items-center justify-center h-3/6">
                 <BannerLoader type="BallTriangle"/>
            </div>
        ) : (
            <div class="grid md:gap-8 grid-cols-1">
                <div class="flex flex-col ">
                    <div class="flex flex-col sm:flex-row items-center">
                        <h2 class="font-semibold md:text-lg mr-auto text-base">
                            Create Session
                        </h2>
                    </div>
                    <div class="md:mt-2">
                        <div class="form">
                            <div class="md:space-y-2 md:mb-3">
                                <div class="md:mb-3 md:space-y-2 w-full text-xs">
                                    <label class=" font-semibold text-gray-600 md:py-2">
                                        Session title
                                    </label>
                                    
                                    <div class="flex flex-wrap items-stretch w-full md:mb-4 relative">
                                        <input
                                            className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter md:h-10 h-8 px-4"
                                            type="text"
                                            id="stitle"
                                            onChange={this.handleInput}
                                            value={this.state.modalEvent.stitle}
                                        />
                                        {this.state.errorModalEvent
                                            .errorSTittle ? (
                                            <p className="text-red-500">
                                                Enter title
                                            </p>
                                        ) : null}
                                        
                                    </div>
                                </div>
                            </div>

                            <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                <div class="w-full flex flex-col md:mb-3 mb-3">
                                    <label class="font-semibold text-gray-600 md:py-2 pt-2">
                                        Session From
                                    </label>
                                    <Datetime
                                        id="start"
                                        onChange={(moment) =>
                                            this.handleDateChange(
                                                moment,
                                                "start"
                                            )
                                        }
                                        isValidDate={this.valid}
                                        value={this.state.modalEvent.start?moment(this.state.modalEvent.start):""}
                                    />
                                    {this.state.errorModalEvent.errorStart ? (
                                        <p className="text-red-500">
                                            Choose Start Date
                                        </p>
                                    ) : null}
                                </div>
                                <div class="w-full flex flex-col mb-3">
                                    <label class="font-semibold text-gray-600 md:py-2">
                                        Session to
                                    </label>
                                    <Datetime
                                        id="end"
                                        isValidDate={this.valid}
                                        onChange={(moment) =>
                                            this.handleDateChange(moment, "end")
                                        }
                                        value={this.state.modalEvent.end?moment(this.state.modalEvent.end):""}
                                    />
                                    {this.state.errorModalEvent.errorEnd ? (
                                        <p className="text-red-500">
                                            Choose End Date
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                <div class="w-full flex flex-col mb-3">
                                    <label class="font-semibold text-gray-600 md:pb-2">
                                        Module
                                    </label>
                                    <select
                                        id="offeringId"
                                        onChange={this.handleInput}
                                        className="cursor-pointer shadow appearance-none border w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="Cretate Module"
                                        defaultValue={
                                            this.state.modalEvent.offeringId
                                        }
                                        value={this.state.modalEvent.offeringId}
                                    >
                                        {this.state.offerings.map(
                                            (module, index) => (
                                                <option
                                                    key={index}
                                                    value={module.Id}
                                                >
                                                    {module.Name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                                <div class="mb-3 md:space-y-2 w-full text-xs">
                                    <label class="font-semibold text-gray-600 md:py-2">
                                        Meeting Link
                                    </label>
                                    <input
                                        type="text"
                                        id="meetingLink"
                                        onChange={this.handleInput}
                                        value={
                                            this.state.modalEvent.meetingLink
                                        }
                                        class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter md:h-10 h-8 px-4 "
                                        required="required"
                                    />
                                </div>
                            </div>

                            <div class="flex-auto w-full md:mb-3 mb-2 text-xs md:space-y-2">
                                <label class="font-semibold text-gray-600 py-2">
                                    Session Agenda
                                </label>
                                <CKEditor
                                    id="agenda"
                                    className="md:min-h-[100px] md:max-h-[300px] md:h-28 appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg  md:py-4 px-4"
                                    editor={ClassicEditor}
                                    data={this.state.modalEvent.agenda}
                                    onChange={(event,editor) =>{
                                        let modalEvent = { ...this.state.modalEvent };
                                        modalEvent.agenda = editor.getData();
                                        this.setState({ ...this.state, modalEvent: modalEvent });
                                    }}
                                >

                                </CKEditor>
                                {/* <textarea
                                    className="md:min-h-[100px] md:max-h-[300px] md:h-28 appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg  md:py-4 px-4"
                                    placeholder="Agenda of this session"
                                    id="agenda"
                                    type="text"
                                    onChange={this.handleInput}
                                    contentEditable={true}
                                    value={this.state.modalEvent.agenda}
                                ></textarea> */}
                               
                                {this.state.errorModalEvent.errorAgenda ? (
                                    <p className="text-red-500">
                                        Write session agenda
                                    </p>
                                ) : null}
                            </div>

                            <div className="flex-auto w-full mb-1 text-xs md:space-y-2 flex flex-row">
                                <label
                                    className="block text-gray-700 md:text-sm text-xs font-bold md:py-2 mr-2"
                                    htmlFor="Self Paced"
                                >
                                    Self Paced
                                </label>
                                <input
                                    className="ml-1"
                                    id="selfPaced"
                                    type="checkbox"
                                    onChange={this.handleInput}
                                    checked={this.state.modalEvent.selfPaced}
                                />
                            </div>
                            <div class="md:mt-5 text-right md:space-x-3 md:block flex flex-col-reverse">
                                <button
                                    class={
                                        this.state.modalEvent.stitle &&
                                        this.state.modalEvent.start &&
                                        this.state.modalEvent.end
                                            ? "md:mb-2 bg-blue-600 px-5 md:py-2 py-1  text-sm shadow-sm font-medium tracking-wider border text-white rounded-full hover:shadow-lg hover:bg-blue-700"
                                            : "md:mb-2 bg-white px-5 md:py-2 py-1 text-sm shadow-sm font-medium tracking-wider border text-gray-600 rounded-full"
                                    }
                                    disabled={
                                        this.state.modalEvent.stitle &&
                                        this.state.modalEvent.start &&
                                        this.state.modalEvent.end
                                            ? false
                                            : true
                                    }
                                    onClick={this.googleCalendarSignin}
                                >
                                    {" "}
                                    Create Meeting Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    googleCalendarSignin = () => {
        if (
            this.state.modalEvent.stitle &&
            this.state.modalEvent.start &&
            this.state.modalEvent.end
        ) {
            const gapi = window.gapi;
            const CLIENT_ID =
                "231242274993-gr6p79cj0cn8gdshu3tv6p4m1v7fum4e.apps.googleusercontent.com";
            const API_KEY = "AIzaSyDmumjpza4_gB2fGL2SPGbqjV_aT88zmJI";
            var DISCOVERY_DOCS = [
                "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            ];
            var SCOPES = "https://www.googleapis.com/auth/calendar";

            let title = this.state.modalEvent.stitle;
            let startTime = this.state.modalEvent.start;
            let endTime = this.state.modalEvent.end;

            gapi.load("client:auth2", () => {
                gapi.client.init({
                    apiKey: API_KEY,
                    clientId: CLIENT_ID,
                    discoveryDocs: DISCOVERY_DOCS,
                    scope: SCOPES,
                });

                gapi.client.load("calendar", "v3", () => console.log("bam!"));

                gapi.auth2
                    .getAuthInstance()
                    .signIn()
                    .then(() => {
                        console.log("Signed in");

                        var event = {
                            summary: title,
                            location: "800 Howard St., San Francisco, CA 94103",
                            description: "Really great refreshments",
                            start: {
                                dateTime: startTime,
                                timeZone: "America/Los_Angeles",
                            },
                            end: {
                                dateTime: endTime,
                                timeZone: "America/Los_Angeles",
                            },
                            conferenceData: {
                                createRequest: {
                                    conferenceSolutionKey: {
                                        type: "hangoutsMeet",
                                    },
                                    requestId: "test",
                                },
                            },

                            attendees: [
                                { email: "lpage@example.com" },
                                { email: "sbrin@example.com" },
                            ],
                        };

                        var request = gapi.client.calendar.events.insert({
                            calendarId: "primary",
                            resource: event,
                            conferenceDataVersion: 1,
                        });

                        request.execute((event) => {
                            console.log(event);
                            let modalEvent = { ...this.state.modalEvent };
                            modalEvent.meetingLink = event.hangoutLink;
                            this.setState({
                                ...this.state,
                                modalEvent: modalEvent,
                            });
                            // window.open(event.htmlLink)
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            });
        } else {
            toast.warn("Choose session name, and timings first");
        }
    };
    
      
      

    scheduleAllSessionModuleWiseUi =()=>{
        return this.state.showModalLoader ? (
            <div className="flex items-center justify-center h-3/6">
                <BannerLoader type="BallTriangle"/>
            </div>
        ):(
            <div class="grid gap-8 grid-cols-1">
                <div class="flex flex-col ">
                    <div class="flex flex-col sm:flex-row items-center">
                        <h2 class="font-semibold text-lg mr-auto">Schedule All</h2>
                    </div>
                    <div class="md:mt-2">
                        <div class="form">
                            <div class="md:space-y-2 mb-3">
                                <div class="mb-3 w-full text-xs flex flex-row">
                                    <label class=" font-semibold text-gray-600 md:py-2">Total no of sessions</label>
                                    <h1 className="text-xs text-gray-800 ml-3 md:py-2">{this.state.selectedModule.length}</h1>
                                </div>
                            </div>

                            <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 md:py-2">Session From</label>
                                        <input id="start"
                                            type="date"
                                            onChange={this.handleInput}
                                            value={this.state.modalEvent.start}
                                            />
                                        
                                        {this.state.errorModalEvent.errorStart?<p className="text-red-500">Choose Start Date</p>:null}
                                </div>
                                <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 md:py-2">Session to</label>
                                        <input
                                            id="end"
                                            type="date"
                                            onChange={this.handleInput}
                                            value={this.state.modalEvent.end}
                                            
                                        />
                                        {this.state.errorModalEvent.errorEnd?<p className="text-red-500">Choose End Date</p>:null}
                                </div>
                            </div>

                            <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 md:py-2">Start Time</label>
                                        <input id="startTime"
                                            type="time"
                                            onChange={this.handleInput}
                                            value={this.state.modalEvent.startTime}
                                            />
                                        {this.state.errorModalEvent.errorStart?<p className="text-red-500">Choose Start Date</p>:null}
                                </div>
                                <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 md:py-2">End Time</label>
                                        <input
                                            id="endTime"
                                            type="time"
                                            onChange={this.handleInput}
                                            value={this.state.modalEvent.endTime}
                                        />
                                        {this.state.errorModalEvent.errorEnd?<p className="text-red-500">Choose End Date</p>:null}
                                </div>
                            </div>

                            <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                <div class="mb-3 space-y-2 w-full text-xs">
                                    <label class="font-semibold text-gray-600 md:py-2">Meeting Link</label>
                                    <input type="text"
                                        id="meetingLink"
                                        onChange={this.handleInput}
                                        value={this.state.modalEvent.meetingLink} 
                                        class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter md:h-10 h-8 px-4 " required="required" 
                                    />
                                </div>
                            </div>

                            <div class="mt-5 text-right md:space-x-3 md:block flex flex-col-reverse">            
                                <button class={this.state.modalEvent.start && this.state.modalEvent.end && this.state.modalEvent.startTime && this.state.modalEvent.endTime ?"mb-2 md:mb-0 bg-blue-600 px-5 md:py-2 py-1 text-sm shadow-sm font-medium tracking-wider border text-white rounded-full hover:shadow-lg hover:bg-blue-700":"mb-2 md:mb-0 bg-white px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-gray-600 rounded-full"} disabled={this.state.modalEvent.start && this.state.modalEvent.end && this.state.modalEvent.startTime && this.state.modalEvent.endTime?false:true} onClick={this.createMeetingLinkForAllSession}> Create Meeting Link</button>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
            )
    }


    scheduleAllModalUi=()=>{
        return this.state.showModalLoader ? (
            <div className="flex items-center justify-center h-3/6">
                <BannerLoader type="BallTriangle"/>
            </div>
        ):(
            <div class="grid gap-8 grid-cols-1">
                <div class="flex flex-col ">
                    <div class="flex flex-col sm:flex-row items-center">
                        <h2 class="font-semibold text-lg mr-auto">Schedule All</h2>
                    </div>
                    <div class="md:mt-2">
                        <div class="form">
                            <div class="md:space-y-2 mb-3">
                                <div class="mb-3 w-full text-xs flex flex-row">
                                    <label class=" font-semibold text-gray-600 md:py-2">Total no of sessions</label>
                                    <h1 className="text-xs text-gray-800 ml-3 md:py-2">{this.state.unplannedEvents.length}</h1>
                                </div>
                            </div>

                            <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 md:py-2">Session From</label>
                                        <input id="start"
                                            type="date"
                                            onChange={this.handleInput}
                                            value={this.state.modalEvent.start}
                                            />
                                        
                                        {this.state.errorModalEvent.errorStart?<p className="text-red-500">Choose Start Date</p>:null}
                                </div>
                                <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 md:py-2">Session to</label>
                                        <input
                                            id="end"
                                            type="date"
                                            onChange={this.handleInput}
                                            value={this.state.modalEvent.end}
                                            
                                        />
                                        {this.state.errorModalEvent.errorEnd?<p className="text-red-500">Choose End Date</p>:null}
                                </div>
                            </div>

                            <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 md:py-2">Start Time</label>
                                        <input id="startTime"
                                            type="time"
                                            onChange={this.handleInput}
                                            value={this.state.modalEvent.startTime}
                                            />
                                        {this.state.errorModalEvent.errorStart?<p className="text-red-500">Choose Start Date</p>:null}
                                </div>
                                <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 md:py-2">End Time</label>
                                        <input
                                            id="endTime"
                                            type="time"
                                            onChange={this.handleInput}
                                            value={this.state.modalEvent.endTime}
                                        />
                                        {this.state.errorModalEvent.errorEnd?<p className="text-red-500">Choose End Date</p>:null}
                                </div>
                            </div>

                            <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                <div class="mb-3 space-y-2 w-full text-xs">
                                    <label class="font-semibold text-gray-600 md:py-2">Meeting Link</label>
                                    <input type="text"
                                        id="meetingLink"
                                        onChange={this.handleInput}
                                        value={this.state.modalEvent.meetingLink} 
                                        class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter md:h-10 h-8 px-4 " required="required" 
                                    />
                                </div>
                            </div>

                            <div class="mt-5 text-right md:space-x-3 md:block flex flex-col-reverse">            
                                <button class={this.state.modalEvent.start && this.state.modalEvent.end && this.state.modalEvent.startTime && this.state.modalEvent.endTime ?"mb-2 md:mb-0 bg-blue-600 px-5 md:py-2 py-1 text-sm shadow-sm font-medium tracking-wider border text-white rounded-full hover:shadow-lg hover:bg-blue-700":"mb-2 md:mb-0 bg-white px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-gray-600 rounded-full"} disabled={this.state.modalEvent.start && this.state.modalEvent.end && this.state.modalEvent.startTime && this.state.modalEvent.endTime?false:true} onClick={this.createMeetingLinkForAllSession}> Create Meeting Link</button>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
            )
    }

    deleteHandler=(type,action)=>{
        let event = this.state.selectedEvent
        console.log("Current Session",this.state.events)
        console.log("Event to delete",event)
        if(type==="CLOSE"){
            this.setState({...this.state,showConfirmAlertDelete:false})
        }else if(type==="DELETE"){
            const self = this;
            firebase
                .auth()
                .currentUser.getIdToken(false)
                .then(function (idToken) {
                    httpsDELETE(
                        { idToken, uid: self.props.auth.uid },
                        API_DELETE_SESSION + event.id
                    ).then((data) => {
                        if (data && data.error) {
                            console.log("ERROR from SERVER");
                            toast.error("Session can't delete");
                            self.setState({
                                ...self.state,
                                showConfirmAlertDelete: false,
                            });
                        } else if (data && data.success) {
                            let senderProfile={
                                uid:self.props.auth.uid,
                                profilePic:self.props.profile.picURL?self.props.profile.picURL:"",
                                Name:self.props.profile.firstName+" "+self.props.profile.lastName
                            }
                            self.props.sendNotificationtoAll({title:event.title,senderProfile:senderProfile,redirectTo:"/courseschedule/:"},self.state.menteesEnrolled,"sessionDeleted")  
                            self.setState({
                                ...self.state,
                                events: self.state.events.filter(
                                    (item) => item.id !== event.id
                                ),
                                showEventOperationModal: false,
                                showConfirmAlertDelete: false,
                            });
                            toast.success("Session deleted");
                        }
                    });
                });
        }
    }

    statusUi(){
        if(/* localStorage.getItem("isFirstTimeLogined")!=='true' */true){
            localStorage.setItem("isFirstTimeLogined",true)
            return(
                <div className="w-full bg-gray-200 flex flex-row justify-between py-3 px-12">
                    <div className="flex flex-row items-center">
                        <div className="h-4 w-4 bg-purple-500 rounded-full mr-3"></div>
                        <h1 className="text-xl">Scheduled</h1>
                    </div>
                    <div className="flex flex-row items-center">
                        <div className="h-4 w-4 bg-green-600 rounded-full mr-3"></div>
                        <h1 className="text-xl">Completed</h1>
                    </div>
                    <div className="flex flex-row items-center">
                        <div className="h-4 w-4 bg-red-500 rounded-full mr-3"></div>
                        <h1 className="text-xl">Cancelled</h1>
                    </div>
                </div>
            )
        }else{
            return null;
        }
        
    }

    updateStatus(){

        const self = this;
        
        let CEnrollment = {
            Id:self.props.match.params.enrolId,
            Status__c:"Sessions Scheduled"
        }

        firebase
        .auth()
        .currentUser.getIdToken(false)
        .then(function (idToken) {
            httpsPOST(
                { idToken, uid: self.props.auth.uid},
                `${API_POST_UPDATE_CENROLLMENT_TO_SENDPDF}`,
                CEnrollment
            ).then((response) => {
                console.log(response);
                if (response && response.error) {
                    console.log(response.techMsg);
                } else {
                    console.log(response);
                    
                    self.setState({
                        ...self.state,
                        showPdfSenderButton:false
                    });
                }
            });
        });
    }

    handleExpand(key){
        let copyOfCourseMap = this.state.courseMap;
        let value = copyOfCourseMap.get(key);

        
        value.open = !value.open;
        copyOfCourseMap.set(key,value)

        this.setState({
            ...this.state,
            courseMap:copyOfCourseMap
        })
    }
    setStatusColor(session){
        
        let color;
        if(session.Status__c==="SCHEDULED"){
            color = "bg-purple-600"
        }else if(session.Status__c==="CREATED"){
            color = "bg-yellow-400"
        }else if(session.Status__c==="COMPLETED"){
            color = "bg-green-500"
        }else if(session.Status__c==="CANCELLED"){
            color = "bg-red-500"
        }

        return <div className={`flex-nowrap w-3 ml-1 h-3 rounded-full ${color}`}></div>
        
    }

    moduleUi(key,module,index){
        return(
            <div className="bg-blue-500 flex flex-col rounded-lg mb-3 mx-3">
            <div className="flex flex-col">
                <div className="cursor-pointer w-full flex flex-row justify-between bg-blue-500 p-5 rounded-lg" onClick={() => this.handleExpand(key)}>
                    <div className="flex flex-row">
                        <div className="bg-white px-2 rounded-full items-center mr-3 h-7">
                            <h1 className=" text-gray-600 text-base font-bold mt-1">{index}</h1>
                        </div>
                        <p className="text-white text-start font-bold">{module.moduleName}</p>
                    </div>
                   
                    
                    {module.open?<IoIosArrowUp className="text-white" size={18} />:<IoIosArrowDown className="text-white" size={18} />}
                    
                </div>
                    {module.open && module.sessions && module.sessions.map((session,sessionIndex) =>{
                        console.log("SessionsData",session)
                        return(
                            <div className="bg-white text-gray-500 flex flex-col  py-2 hover:border-l-4 hover:border-orange-500 border-l-4 border-orange-500 flex-nowrap"
                                onClick={()=>{
                                    
                                }}
                            >
                               <div className={"cursor-pointer flex flex-row items-center hover:bg-gray-200 px-5 py-1 justify-between"} onClick={()=>{
                                        this.addSession(session);
                                    }}
                                >
                                    <div className="flex flex-nowrap ml-2">
                                        <h1 className="text-base ml-2 truncate">{sessionIndex+1} {session.Session_Title__c} </h1>
                                    </div>
                                    {this.setStatusColor(session)}
                            </div>
                            </div>
                        )
                    })}
            </div>                    
        </div>
        )
    }

    scheduleAllSessionTrigger(moduleName,unscheduledSessionOfModule){
        if(this.state.unplannedMapCat.get(moduleName)){
            unscheduledSessionOfModule = this.state.unplannedMapCat.get(moduleName)
        }
        return(
            <div className="flex flex-col justify-center mt-2">
                <h1 className="text-base text-gray-600 text-center">{moduleName}</h1>
                {!this.state.unplannedMapCat.get(moduleName)?
                <h1 className="text-sm text-gray-500 text-center">All Session has scheduled</h1>:
                <button
                className="bg-gray-700 hover:bg-black text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() =>{
    
                    this.setState({
                        ...this.state,
                        showScheduleAllModuleSessionModal: true,
                        selectedModule:unscheduledSessionOfModule
                    });
                }}
            >
                <span>Schedule All</span>
                </button>
                }
            </div>
        ) 
    }
    sideLeftUi(){
        const modules = [];
        let index = 0;
        this.state.courseMap.forEach((value,key)=>{
            index+=1;
            console.log("Key",key);
            console.log("Value",value);
            modules.push(
                
                <Tooltip
                    children={this.moduleUi(key,value,index)}
                    placement="right"
                    trigger="hover"
                    delayShow={300}
                    tooltip={this.scheduleAllSessionTrigger(value.moduleName,value.sessions)}
                />
                
            )
        })
        return modules
    }
    newUi(){
        return(
            <div className="w-full bg-gray-200 flex md:flex-row flex-col md:p-5  py-3">
                    {this.props.profile.userType==="instructor" &&
                        <div className="max-w-xl md:mr-5 text-white md:py-12">
                            {this.sideLeftUi()}
                        </div>
                    }
                    <div className="w-full">
                    <div className="">
                    
                    <center className="md:mb-4 mb-2">
                        <h1>{this.state.courseMasterName} Schedule</h1>
                    </center>

                    {/* {this.props.profile.userType === "instructor" &&
                        this.state.unplannedMapCat.size>0 && this.unscheduledSessionsByCategory()} */}

                    {this.props.profile.userType === "instructor"
                        ? this.courseActions()
                        : null}

                    {this.statusUi()}

                    {this.courseSchedule()}

                    {this.props.profile.userType === "instructor" &&
                    this.state.showSessionModal ? (
                        <CommonDetailModal
                            handleEvent={this.handleModalEvent}
                            showModal={this.state.showSessionModal}
                        >
                            {this.sessionModalUi()}
                        </CommonDetailModal>
                    ) : (
                        <div
                            className="fixed z-50"
                            style={{
                                bottom: "60px",
                                right: "100px",
                            }}
                        >
                            {this.props.profile.userType === "instructor" &&
                                this.state.isDirty && (
                                    <div className="rounded-full bg-green-500 border-white shadow-lg cursor-pointer block border-4 hover:bg-green-800  animate-bounce">
                                        <div className="flex items-center justify-center w-10 h-10">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-white"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                onClick={() =>
                                                    this.updateEvents()
                                                }
                                            >
                                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}

     
                 {this.state.showaddOffering && (
                    <CommonDetailModal
                     handleEvent={this.handleOfferingEvent}
                     showModal = {this.state.showaddOffering}>
                         {this.addOfferingUi()}
                     </CommonDetailModal>
                )}
                {this.state.showEventOperationModal && 
                    this.eventOperationModal()
                }
                {this.state.showScheduleAllSessionModal &&
                    <CommonDetailModal
                    handleEvent={this.handleCreateAllSession}
                    showModal = {this.state.showScheduleAllSessionModal}>
                        {this.scheduleAllModalUi()}
                    </CommonDetailModal>
                }            

                {this.state.showScheduleAllModuleSessionModal && 
                     <CommonDetailModal
                     handleEvent={this.handleScheduleAllSessionOfModule}
                     showModal = {this.state.showScheduleAllModuleSessionModal}>
                         {this.scheduleAllSessionModuleWiseUi()}
                     </CommonDetailModal>
                }

                {this.state.showPdfSenderButton && 
                     <div
                     className="fixed z-50"
                     style={{
                         bottom: "60px",
                         right: "100px",
                     }}
                 >
                    <div className="rounded-full bg-green-500 border-white shadow-lg cursor-pointer block border-4 hover:bg-green-800  animate-bounce">
                                <div className="flex items-center justify-center w-14 h-14">
                                    <svg
                                         xmlns="http://www.w3.org/2000/svg"
                                         className="h-7 w-7 text-white"
                                         viewBox="0 0 20 20"
                                         fill="currentColor"
                                         onClick={() =>{
                                            this.updateStatus();
                                         }
                                            //  this.updateEvents()
                                         }
                                    >
                                         <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                     </svg>
                                 </div>
                             </div>
                 </div>
                }
                {this.state.showConfirmAlertDelete && <DeleteAlert showModal={this.state.showConfirmAlertDelete} handleEvent={this.deleteHandler} action={"SESSION"} />}

                </div>
            </div>
            </div>
        )
    }


    render() {
        return (
            <Base
                history={this.props.history}
                pathList={[
                    ...PATH_COURSE_SCHEDULE,
                    { to: "#", name: this.props.location.state && this.props.location.state.name?this.props.location.state.name:this.state.courseMasterName}
                ]}
            >
                {this.state.showModalLoader?
                     <div className="flex items-center justify-center h-screen bg-gray-200">
                     <div className="text-3xl">
                         {/* <h5>loading...</h5> */}
                         <BannerLoader type="BallTriangle"/>
                     </div>
                 </div>:
                
                <>
                    {this.state.courseMap && this.newUi()}
                </>
                }
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


const mapDispatchToProps = (dispatch) => {
    return {
        sendNotificationtoAll: (data,menteeList,type) => dispatch(sendBulkNotification(data,menteeList,type)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseSchedule);
