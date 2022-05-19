import { React, useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import Base from '../../Base'
import {firebase, storage} from '../../../config/fbConfig'
import {BiSend, BiTrash, BsCloudUpload,ImFileEmpty} from 'react-icons/all'
import moment from "moment";
import { toast } from "react-toastify";
import update from "immutability-helper";
import { randomColor } from "randomcolor";
import DeleteAlert from '../../settings/DeleteAlert'
import { saveAs } from "file-saver";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import renderHTML from "react-render-html";
import { sendBulkNotification,sendReplyNotification } from '../../../store/actions/appActions';
import { compose } from "redux";
import { firestoreConnect } from "react-redux-firebase";

import {
    httpsPOST,
    httpsDELETE,
} from "../../../backend_api/mentorAPI";
import { httpsPOST as menteePost, httpsGET as menteeGet } from "../../../backend_api/menteeAPI";
import {
    API_POST_CREATE_SESSION_ATTACHMENT,
    API_DELETE_SESSION_ATTACHMENT,
    API_POST_UPDATE_SESSIONS,
    API_GET_SESSION_DETAILS_MAIN
} from "../../../backend";
import { FaYoutube, FaTrash} from "react-icons/fa";
import {HiCloudDownload} from "react-icons/hi";
import CommonDetailModal from "../../settings/CommonDetailModal";
import { LoaderLarge } from "../../ui_utilities/Loaders";


const SessionComponent = ({ profile, match, history, location, auth, sendNotificationtoAll,sendReplyNotification,sessionscomment}) => {
    //sorting the arr
    sessionscomment = sessionscomment && sessionscomment.slice().sort((a,b)=>{return a.createdDate.seconds - b.createdDate.seconds})

    const [commentData,setCommentData] = useState("")
    const [data,setData] = useState([])
    const userData = useRef(new Map())
    const [replyData,setReplyData] = useState([])
    const [showDeleteAlert,setShowDeleteAlert] = useState(false)
    const [selectedEvent,setSelectedEvent] = useState({})
    const [selectedTab,setSelectedtab] = useState(1)
    const [uploadAssignmentModal, setUploadAssignmentModal] = useState(false)
    const [file, setFile] = useState(null);
    const [assignments,setAssignments] = useState([])
    const [action, setAction] = useState("")
    const [showLoader,setShowLoader] = useState(true)
    
    const [userList,setUserList] = useState([])
    const [studentsEnrolled,setStudentEnrolled] = useState([]);

    const [showUserList,setShowUserList] = useState({})
    const [childCommentData,setChildCommentData] = useState([])

    const [scheduledSession,setScheduleSession] = useState({
        id:location.state?location.state.sessionDetail.id:"",
        title:location.state?location.state.sessionDetail.title:"",
        start:location.state?location.state.sessionDetail.start:"",
        end:location.state?location.state.sessionDetail.end:"",
        meetingLink:location.state?location.state.sessionDetail.meetingLink:"",
        status:location.state?location.state.sessionDetail.status:"",
        sessionAgenda:location.state?location.state.sessionDetail.sessionAgenda:"",
        courseMaster:location.state?location.state.courseMaster:"",
        CE_Module__r: location.state?location.state.sessionDetail.CE_Module__r:"",
        mentorFBId:location.state && location.state.mentorFBId?location.state.mentorFBId:""
    })

    const [rescheduleError,setRescheduleError] = useState({
        titleError:false,
        startDateError:false,
        endDateError:false,
        meetingLinkError:false
    })
    
    const [showReschedule,setShowReschedule] = useState(false)
    const [notes, setNotes] = useState({
        name:"",
        fileType:"FILE",
        youtubeId: "",
        typeValues: ["VIDEO", "FILE"]
    });

    const [notesError,setNotesError] = useState({
        titleError:false,
        attachmentsError:false
    })
    const [attachments, setAttachments] = useState([]);
    const [progress, setProgress] = useState(0);
    const [showUploadProgress, setShowUploadProgress] = useState(false);

    const handleInput = (e) => {
        setScheduleSession({...scheduledSession,[e.target.id]:e.target.value})
    };
    

    const handleDateChange = (moment, name) => {
        try {
            let modalEvent = { ...scheduledSession};
            modalEvent[name] = moment.toDate();
            setScheduleSession(modalEvent)
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData=()=>{
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                menteeGet({idToken, uid: auth.uid}, `${API_GET_SESSION_DETAILS_MAIN}${match.params.sessionId}`).then(
                    (data) => {
                        if (data && data.length > 0) {
                            console.log("DataFetched",data)
                            let notes = []
                            let assignemt = []
                            let mentees = []
                            if(data[0].menteesUnderMentor && data[0].menteesUnderMentor.length > 0) {
                                setStudentEnrolled(data[0].menteesUnderMentor)
                                data[0].menteesUnderMentor.forEach((mentee,i)=> mentee.Contact__c!==profile.sfid && mentees.push(mentee))
                            }
                            
                            if(data[0].sessionsAttachmentList && data[0].sessionsAttachmentList[0]){
                                setScheduleSession({
                                    id:data[0].sessionsAttachmentList[0].Id,
                                    title:data[0].sessionsAttachmentList[0].Session_Title__c,
                                    start:data[0].sessionsAttachmentList[0].Start_DateTime__c,
                                    end:data[0].sessionsAttachmentList[0].End_DateTime__c,
                                    meetingLink:data[0].sessionsAttachmentList[0].Meeting_Link__c,
                                    status:data[0].sessionsAttachmentList[0].Status__c,
                                    sessionAgenda:data[0].sessionsAttachmentList[0].Session_Agenda__c,
                                    courseMaster:data[0].sessionsAttachmentList[0].CE_Module__r.Course_Master__r,
                                    CE_Module__r: data[0].sessionsAttachmentList[0].CE_Module__r,
                                    mentorFBId:data[0].sessionsAttachmentList[0].CE_Module__r.Course_Enrollment__r.Contact__r.Firebase_Id__c
                                })
                            }

                            if(data[0].sessionsAttachmentList && data[0].sessionsAttachmentList.length>0 && data[0].sessionsAttachmentList[0].Session_Attachments__r && data[0].sessionsAttachmentList[0].Session_Attachments__r.records){
                                data[0].sessionsAttachmentList[0].Session_Attachments__r.records.forEach((content,i)=>{

                                    if(content.Attachment_Type__c==="Note"){
                                        console.log("CONTENTIF",content)
                                        notes.push(content)
                                    }else{
                                        console.log("CONTENTELSE",content)
                                        if(profile.userType==="instructor"){
                                            assignemt.push(content)
                                        }else if(profile.userType==="student" && content.Uploaded_By__c===profile.sfid){
                                            assignemt.push(content)
                                        }
                                    }
                                })
                            }
                            if(mentees.length>0 && profile.userType==="student"){
                                mentees.push({Contact__r:mentees[0].Mentor__r,Id:mentees[0].Mentor_Course_Enrollment__c})
                            }
                            console.log("actors: ",mentees)
                            setAssignments(assignemt)
                            setAttachments(notes)
                            setUserList(mentees)
                        }
                        setShowLoader(false);
                    }
                );
            });
    }

    const userListUi = (pIndex)=>{
        return(
            <div className="max-w-xs bg-gray-200 rounded-lg mt-2">
                {userList && userList.filter((u)=>
                    { 
                        let positionOf = childCommentData.find((val)=>val.index===pIndex).value.lastIndexOf("@")
                        let searchingword = childCommentData.find((val)=>val.index===pIndex).value.substring(positionOf+1, childCommentData.find((val)=>val.index===pIndex).value.length)
                        return u.Contact__r.Name.toLowerCase().search(searchingword.toLowerCase())!==-1

                    }).map((user,i)=>{
                    return(
                        <div className="cursor-pointer flex flex-row px-3 py-2 justify-start text-gray-500 hover:bg-blue-700 hover:text-white rounded-lg" onClick={()=>{
                            let msg = childCommentData.find((val)=>val.index===pIndex).value.substring(0,childCommentData.find((val)=>val.index===pIndex).value.lastIndexOf("@"))
                            let copy = childCommentData
                            copy = copy.filter((comment)=>{return comment.index!==pIndex})

                            let newVal = childCommentData.find((c)=>c.index===pIndex)
                            newVal.value = msg+" @"+user.Contact__r.Name+" "
                            copy.push(newVal)
                            
                            setChildCommentData(copy)
                            setShowUserList(false)
                        }}>
                            <img className="rounded-full h-12 w-12 flex items-center justify-center" src={user.Contact__r.Profile_Picture__c?user.Contact__r.Profile_Picture__c:"https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"} alt={user.Contact__r.Name}/>
                            <h1 className="ml-3 text-base align-center">{user.Contact__r.Name}</h1>
                            <hr/>
                        </div>
                    )
                })}
            </div>
        )
    }

    const assignmentUi=()=> {
        return(
            <div className="mt-5">
                {assignments.length>0?
                    assignments.map((attachment, index) => {
                        console.log("Assignments ",attachment);
                        return (
                            <div
                                className="no-underline border-b hover:border-white rounded-xl shadow-md overflow-hidden  mt-2 p-5 text-white bg-blue-300"
                                key={index}
                                // style={{
                                //     backgroundColor: randomColor({
                                //         luminosity: "light",
                                //         hue: "random",
                                //     }),
                                // }}
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
                                        {attachment.Attachment_Type__c ===
                                            "VIDEO" && (
                                            <FaYoutube
                                                className="inline cursor-pointer ml-2 hover:text-black text-fill text-white"
                                                size={20}
                                                onClick={() =>
                                                    gotoPlayer(
                                                        attachment.Video_Id__c
                                                    )
                                                }
                                            />
                                        )}
                                        {attachment.Attachment_Type__c !==
                                            "VIDEO" && (
                                            <HiCloudDownload
                                                className="inline cursor-pointer ml-2  hover:text-black text-fill text-white"
                                                size={20}
                                                onClick={() =>
                                                    downloadAttachment(
                                                        attachment
                                                    )
                                                }
                                            />
                                        )}
                                        {profile.userType==="student" &&   
                                            <FaTrash
                                                className="inline cursor-pointer ml-2 hover:text-black text-fill text-white"
                                                size={20}
                                                onClick={() =>{
                                                    setSelectedEvent(attachment.Id)
                                                    setAction("ASSIGNMENTDELETE")
                                                    setShowDeleteAlert(true)
                                                    console.log("Going to delete ",attachment.Id)
                                                }}
                                            />
                                        }
                                        
                                    </div>
                                </div>
                            </div>
                        );
                    }):null    
            }
            </div>
        )
    }

    const notesUi=()=> {
        return(
            <div className="mt-5 mx-2 md:mx-0">
                {attachments.length>0?
                    attachments.map((attachment, index) => {
                        console.log("Notes ",attachment);
                        return (
                            <div
                                className="no-underline border-b hover:border-white rounded-xl shadow-md overflow-hidden  mt-2 p-5 bg-blue-300 text-white"
                                key={index}
                                // style={{
                                //     backgroundColor: randomColor({
                                //         luminosity: "light",
                                //         hue: "random",
                                //     }),
                                // }}
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
                                        {console.log("AttachmentType___C",attachment.File_Type__c)}
                                        {attachment.File_Type__c ===
                                            "VIDEO" && (
                                            <FaYoutube
                                                className="inline cursor-pointer ml-2  hover:text-black text-fill text-white"
                                                size={20}
                                                onClick={() =>
                                                    gotoPlayer(
                                                        attachment.Video_Id__c
                                                    )
                                                }
                                            />
                                        )}
                                        {attachment.File_Type__c !==
                                            "VIDEO" && (
                                            <HiCloudDownload
                                                className="inline cursor-pointer ml-2 text-fill text-white hover:text-black"
                                                size={20}
                                                onClick={() =>
                                                    downloadAttachment(
                                                        attachment
                                                    )
                                                }
                                            />
                                        )}
                                        {profile.userType==="instructor" &&
                                            <FaTrash
                                            className="inline cursor-pointer ml-2 text-fill text-white hover:text-black"
                                            size={20}
                                            onClick={() =>{
                                                setSelectedEvent(attachment.Id)
                                                setAction("NOTEDELETE")
                                                setShowDeleteAlert(true)
                                                console.log("Going to delete ",attachment.Id)
                                            }}
                                        />
                                        }
                                    </div>
                                </div>
                            </div>
                        );
                    }):null    
            }
            </div>
        )
    }

    const gotoPlayer = (videoId) => {
        history.push({pathname: `/session/play/${videoId}`,state:{sessionDetails:scheduledSession,courseMaster:scheduledSession.courseMaster}})
    }
    const downloadAttachment = (attachment) => {
        saveAs(attachment.FILE_URL__c);
    };
    
    const newChatCard = (pComment,pIndex) => {
        console.log("PCOMMENT",pComment)
        return(
            <>
            <div className="flex flex-col rounded-lg py-3 md:my-8 my-2 border bg-white">                
        <div className="flex px-5">
            <div className="flex-shrink-0 h-12 w-12">
                <img
                    className="h-12 w-12 rounded-full"
                    src= "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"
                    alt="profile"
                />
            </div>

            <div className="mt-1 ml-4 w-full">
                <h1 className="text-sm text-start">{userList.find((user) => user.Contact__r.Firebase_Id__c===pComment.from)?userList.find((user) => user.Contact__r.Firebase_Id__c===pComment.from).Contact__r.Name:profile.firstName+" "+profile.lastName}</h1>
                {setTimer(pComment.createdDate)}
            </div>
            {pComment.from===firebase.auth().currentUser.uid && 
                 <BiTrash className="cursor-pointer hover:bg-gray-200 rounded-full" onClick={()=>{
                    setSelectedEvent(pComment)
                    setAction("DISCUSSIONDELETE")
                    setShowDeleteAlert(true)
                }} size={22}/>
            }
        </div>
        <h2 className="text-base mt-2 mb-4 px-5">{pComment.message}</h2>
        
        <hr/>
        {sessionscomment.length>0 && sessionscomment.filter(c=> c.pId===pComment.id).map((d)=>{return replyCard(d)})}

        {
            profile.userType==="instructor" || firebase.auth().currentUser.uid === pComment.from||pComment.from===pComment.mentorFbId?
            <>
             <hr/>
            <div id="footer-reply-box" className="flex flex-row px-5 py-5">
            <div className="flex-shrink-0 h-10 w-10">
                    <img
                        className="h-10 w-10 rounded-full"
                        src= "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"
                        alt=""
                    />
            </div>
            <div className="w-full mx-3 border-0 hover:border-red-500">
                     <div class="w-full flex flex-row  rounded-xl border ">
                         
                         <textarea type="text" id="rating"  
                             placeholder="comment"
                             onKeyUp={(event)=>{
                                if(event.keyCode===13){
                                   createComment(pComment.id,pComment,pIndex)
                                }
                            }}
                            value={childCommentData.find((data)=>data.index===pIndex)?childCommentData.find((data)=>data.index===pIndex).value:""}
                             rows="1" className="overflow-hidden w-full p-3 text-gray-500 rounded-xl resize-none border-0 bg-gray-100"
                             onChange={e => {
                                if(childCommentData.find((comment)=>comment.index===pIndex)){
                                    let copy = childCommentData
                                    copy = copy.filter((comment)=>{return comment.index!==pIndex})
                                    let newVal = childCommentData.find((c)=>c.index===pIndex)
                                    newVal.value = e.target.value
                                    copy.push(newVal)
                                    setChildCommentData(copy)
                               }else{
                                debugger;
                                    let body = {value:e.target.value,index:pIndex}
                                    setChildCommentData([...childCommentData,body])
                               }

                                   if(e.target.value.slice(-1)==="@"){
                                       setShowUserList({status:true,index:pIndex})
                                   }else{
                                    setShowUserList({status:false,index:pIndex})
                                   }
                                }}>
                         </textarea>
                         <BiSend size={32} className="mt-2 cursor-pointer text-gray-700" 
                            onClick={()=>createComment(pComment.id,pComment,pIndex)}
                         />
                     </div>
                     {showUserList.status && showUserList.index===pIndex &&  userListUi(pIndex)}
                 </div>
        </div></>:null
        }
    </div>
    
    </>

    )
    }

    const replyCard = (cComment)=>{
        return(
            <div id="middle-commented-chats" className="flex flex-row items-stretch py-3 px-5">
                    <div className="flex-shrink-0 h-10 w-10">
                            <img
                                className="h-10 w-10 rounded-full"
                                src= "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"
                                alt=""
                            />
                    </div>
                    <div className="flex flex-col ml-4 w-full">
                        <div className="flex flex-row mt-1 w-full">
                            <h1 className="text-sm text-start mr-2">{userList.find((user) => user.Contact__r.Firebase_Id__c===cComment.from)?userList.find((user) => user.Contact__r.Firebase_Id__c===cComment.from).Contact__r.Name:profile.firstName+" "+profile.lastName}</h1>
                            {setTimer(cComment.createdDate)}
                        </div>
                        <h2 className=" flex flex-row text-sm mt-1">{ renderHTML(cComment.message)}</h2>
                    </div>
                    {cComment.from===firebase.auth().currentUser.uid &&
                        <BiTrash className="cursor-pointe hover:bg-gray-200 rounded-full" onClick={()=>{setShowDeleteAlert(true)
                            setAction("DISCUSSIONDELETE")
                            setSelectedEvent(cComment)
                        }}  size={20}/>
                    }
            </div>

        )
    }

    const setTimer = (dateTime)=> {
        try {
            return <h1 className="text-sm text-gray-600 text-start">{moment(dateTime.toDate()).calendar()}</h1>
        } catch (error) {   
            return <h1 className="text-sm text-gray-600 text-start">{moment(dateTime).calendar()}</h1>
        }
    }


    const createComment =(parentId,parenDetail,pIndex)=>{

        let userIdList = []
        let listOfParticipants = [];
        let uniqueParticipantsId = []

        let parentBody = {
            mentorFbId:scheduledSession.mentorFBId,
            createdDate:new Date(),
            from:firebase.auth().currentUser.uid,
            sessionId:match.params.sessionId
        }

        
        if(parentId!==null){   
            let finalMsg = childCommentData.find((comment)=>comment.index===pIndex).value;
            parentBody.pId = parentId
            userList.forEach((user)=>{
                if(childCommentData.includes(user.Contact__r.Name) && !userIdList.includes(user.Contact__r.Name)){
                    finalMsg=finalMsg.replaceAll('@'+user.Contact__r.Name,`<a href="/mentee/detail/${user.Contact__r.Firebase_Id__c}" className="flex flex-row cursor-pointer mr-1 p-0 text-sm text-blue-700 ml-1 bg-gray-200 px-1 rounded-lg"> ${user.Contact__r.Name}</a>`)
                    userIdList.push(user.Contact__r.Firebase_Id__c)
                }
            })
            parentBody.message=finalMsg
            if(userIdList.length > 0){
                parentBody.tagTo = userIdList
            }
        }else{
            parentBody.message=commentData
        }

        if(parentBody.message.length>1){
            firebase.firestore().collection("sessionscomment").add(parentBody)
            .then((doc) => {
                const parentData = {
                    id:doc.id,
                    comment:parentBody
                }
                if(parentId===null){
                    let senderProfile={
                        uid:auth.uid,
                        profilePic:profile.picURL?profile.picURL:"",
                        Name:profile.firstName+" "+profile.lastName
                    }
                    if(profile.userType==="instructor"){
                        sendNotificationtoAll({sessionId:match.params.sessionId,mentorName:profile.firstName+" "+profile.lastName,sessionTitle:scheduledSession.title,senderProfile:senderProfile},studentsEnrolled,"commentCreatedByMentor")
                    }else{
                        let detailOfMentor = [{Contact__r:{Firebase_Id__c:userList[0].Mentor__r.Firebase_Id__c, Mentor_Course_Enrollment__c:studentsEnrolled[0].Mentor_Course_Enrollment__c}}]
                        sendNotificationtoAll({sessionId:match.params.sessionId,mentorName:profile.firstName+" "+profile.lastName,sessionTitle:scheduledSession.title,senderProfile:senderProfile},detailOfMentor,"commentCreatedByMentee")
                    } 
                    setData([...data,parentData])
                }else{

                    parentData.tagToProfile = userList.filter((user)=>{
                        return userIdList.includes(user.Contact__r.Firebase_Id__c) && user.Contact__r
                    })

                    console.log("Tagger to ",parentData.tagToProfile)

                    debugger;
                    sessionscomment.filter(c=> c.pId===parentId).forEach((c)=>{
                        if(c.tagTo){
                            c.tagTo.forEach((id,i)=>{
                                if(!uniqueParticipantsId.includes(id) && c.from!==auth.id){
                                    uniqueParticipantsId.push(id)
                                    if(userList.find(user => user.Contact__r.Firebase_Id__c===id)!==undefined){
                                        listOfParticipants.push(userList.find(user => user.Contact__r.Firebase_Id__c===id))
                                    }
                                }
                            })
                        }
                        console.log("Participants :",listOfParticipants)
                        if(!uniqueParticipantsId.includes(c.from) && c.from!==auth.uid){
                            uniqueParticipantsId.push(c.from)
                            if(userList.find(user=>user.Contact__r.Firebase_Id__c===c.from)!==undefined){
                                listOfParticipants.push(userList.find(user=>user.Contact__r.Firebase_Id__c===c.from))
                            }
                        }
                        console.log("Participants2 :",listOfParticipants)
                    })
                    debugger
                    let ownerDetails;
                    if(parenDetail.from===auth.uid){
                        ownerDetails = null
                    }else{
                        if(profile.userType==="instructor" && userList.length>0){
                            ownerDetails = userList.find((user) => user.Contact__r.Firebase_Id__c===parenDetail.from)
                        }else{
                            ownerDetails = userList.find((user) => user.Contact__r.Firebase_Id__c===parenDetail.from)
                        }
                    }
                   
                    debugger;

                    let dataToSend = {
                        sessionId:match.params.sessionId,
                        ownerDetails: ownerDetails,
                        tagToList:parentData.tagToProfile,
                        senderName:profile.firstName+" "+profile.lastName,
                        participants:listOfParticipants,
                        senderProfile:{
                            uid:auth.uid,
                            profilePic:profile.picURL?profile.picURL:"",
                            Name:profile.firstName+" "+profile.lastName
                        }
                    }
                    console.log("DataToSendNotificationTo",dataToSend)
                    sendReplyNotification(dataToSend)
                }
                toast.success("Successfully posted the comment")
                let copy = childCommentData
                copy = copy.filter((comment)=>{return comment.index!==pIndex})

                setChildCommentData(copy)
                setCommentData("")
            })
            .catch((error) => {
                toast("Comment Posted")
                console.error("Error writing document: ", error);
            });
        }
        
    }

    const rescheduleEventHandle=(type)=>{
        if(type==="CLOSE"){
            setShowReschedule(false)
        }else{
            let body = {
                Id: scheduledSession.id,
                Start_DateTime__c: scheduledSession.start,
                End_DateTime__c: scheduledSession.end,
                Meeting_Link__c: scheduledSession.meetingLink
            }
            firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsPOST(
                    { idToken, uid: auth.uid},
                    `${API_POST_UPDATE_SESSIONS}${match.params.enrolId}`,
                    [body]
                ).then((response) => {
                    console.log(response);
                    let senderProfile={
                        uid:auth.uid,
                        profilePic:profile.picURL?profile.picURL:"",
                        Name:profile.firstName+" "+profile.lastName
                    }
                    sendNotificationtoAll({sessionId:match.params.sessionId,title:scheduledSession.title,time:moment(scheduledSession.start).calendar(),meetingLink:body.Meeting_Link__c,senderProfile:senderProfile},userList,"sessionRescheduledForSessionComponent")
                    if (response && response.error) {
                        console.log(response.techMsg);
                        toast.error(response.error)
                    } else {
                        console.log(response);
                        setShowReschedule(false)
                        toast.success("Session updated.")
                    }
                });
            });
        }
    }
    const handleModalEvent = (type,action)=> {
        console.log("Type ",type, "Action ",action)
        if(type==="CLOSE"){
            setShowDeleteAlert(false)
        }else if(type==="DELETE" && action==="DISCUSSIONDELETE"){
            if(selectedEvent.pId){
                firebase.firestore().collection("sessionscomment").doc(selectedEvent.id).delete().then((res)=>{
                    toast.success("Comment deleted")
                }).catch((err)=>{
                    toast.error(err)
                }).finally(()=>{
                    setShowDeleteAlert(false)
                })
            }else{
                firebase.firestore().collection("sessionscomment").where("pId","==",selectedEvent.id).get().then((querySnapshot)=>{
                    if(querySnapshot.size>0){
                        querySnapshot.forEach((doc)=>{
                            doc.ref.delete()
                        })
                    }  
                }).catch((error)=>{
                    toast.error("Comment can't be deleted")
                    console.log(error)
                })
                firebase.firestore().collection("sessionscomment").doc(selectedEvent.id).delete().then((res)=>{
                    toast.success("Comment deleted")
                }).catch((err)=>{
                    toast.error(err)
                }).finally(()=>{
                    setShowDeleteAlert(false)
                })
            }
        }else if(type==="DELETE" && (action==="ASSIGNMENTDELETE" || action==="NOTEDELETE")) {
            firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsDELETE(
                    { idToken, uid: auth.uid},
                    API_DELETE_SESSION_ATTACHMENT + selectedEvent
                ).then((data) => {
                    if (data && data.error) {
                        toast.error(data.error)
                        console.log("ERROR from SERVER");
                    } else if (data && data.success) {
                        if(action==="ASSIGNMENTDELETE"){
                            const index = assignments.findIndex(
                                (attachment) => attachment.Id === selectedEvent
                            );
                            const updatedAttachments = update(assignments, {
                                $splice: [[index, 1]],
                            });
                            setAssignments(updatedAttachments);
                        }else{
                            const index = attachments.findIndex(
                                (attachment) => attachment.Id === selectedEvent
                            );
                            const updatedAttachments = update(attachments, {
                                $splice: [[index, 1]],
                            });
                            setAttachments(updatedAttachments);
                        }
                        toast.success("Successfully deleted")
                    }
                }).finally(()=>{
                    setShowDeleteAlert(false)
                }); 
            });
        }
    }

    const setScreen = () => {
        if(selectedTab===2){
            return(
                <div className="md:col-span-2 md:px-8 mt-5">
                    {profile.userType==="instructor" || (profile.userType==="student" && attachments.length===0) ?
                        <div className="flex rounded-lg shadow-lg">
                        <div className="w-full border-0 bg-white p-3" onClick={()=>{ profile.userType==="instructor"?setUploadAssignmentModal(true):setUploadAssignmentModal(false)}}>
                        {profile.userType==="instructor"?
                                <>
                                    <div className="cursor-pointer border-dotted border-4  rounded-xl py-8 max-w-sm mx-auto justy-items-center my-8" >
                                        <BsCloudUpload size={72} className="mx-auto fill-current text-black"/>
                                        <h2 className="text-base text-center mt-2"> Upload Notes </h2>
                                    </div>
                                    <div className="cursor-pointer rounded-xl py-2 max-w-sm mx-auto justy-items-center my-8 text-lg bg-purple-500 text-white" onClick={()=>setUploadAssignmentModal(true)}>
                                        <h2 className="text-base text-center mt-2"> Submit </h2>
                                    </div>
                                </>:
                                <>
                                    <div className="cursor-pointer border-dotted border-4  rounded-xl py-8 max-w-sm mx-auto justy-items-center my-8" >
                                    <ImFileEmpty size={72} className="mx-auto fill-current text-black"/>
                                    <h2 className="text-base text-center mt-2"> Notes not found </h2>
                                    </div>
                                </>
                            }                     
                        </div>
                    </div>:null
                    }
                    {notesUi()}
                </div>
            )
        }else if(selectedTab===3){
            return(
                <div className="col-span-2 md:px-8 mt-2">
                    {console.log("Assignments",assignments)}
                  {(profile.userType==="instructor" && assignments.length===0) || profile.userType==="student"?
                    <div className="flex rounded-lg shadow-lg">
                    
                    <div className="w-full border-0 bg-white p-3" onClick={()=>{profile.userType==="student"? setUploadAssignmentModal(true):setUploadAssignmentModal(false)}}>

                    {profile.userType==="student"?
                                <>
                                    <div className="cursor-pointer border-dotted border-4  rounded-xl py-8 max-w-sm mx-auto justy-items-center my-8" >
                                        <BsCloudUpload size={72} className="mx-auto fill-current text-black"/>
                                        <h2 className="text-base text-center mt-2"> Upload Assignment </h2>
                                    </div>
                                    <div className="cursor-pointer rounded-xl py-2 max-w-sm mx-auto justy-items-center my-8 text-lg bg-purple-500 text-white" onClick={()=>setUploadAssignmentModal(true)}>
                                        <h2 className="text-base text-center mt-2"> Submit </h2>
                                    </div>                 

                                </>:
                                <>  
                                     <div className="cursor-pointer border-dotted border-4  rounded-xl py-8 max-w-sm mx-auto justy-items-center my-8" >
                                        <ImFileEmpty size={72} className="mx-auto fill-current text-black"/>
                                        <h2 className="text-base text-center mt-2"> Assignment not found </h2>
                                    </div>
                                </>
                            }    
                    </div>
                </div>:null 
                }
                {assignmentUi()}
                </div>
            )
        }
        else if(selectedTab===1){
            return(
                <div className="md:col-span-2 py-2 md:px-8">
                       
                <div className="md:flex rounded-lg shadow-lg md:px-5 py-3 bg-white px-5">
                    <div className="md:flex-shrink-0 h-12 md:w-12 flex justify-center">
                        <img
                            className="h-12 w-12 rounded-full"
                            src= "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"
                            alt=""
                        />
                    </div>
                    <div className="w-full md:mx-8 border-0 mt-5">
                    <div class="flex flex-col">
                        <textarea type="text" id="rating"  
                            placeholder="Leave a message, if you want"
                            rows="3" className="p-4 text-gray-500 rounded-xl resize-none overflow-hidden"
                            value={commentData}
                            onChange={e => setCommentData(e.target.value)}></textarea>
                        <button className={commentData.length>0?"w-full py-3 my-8 text-lg bg-purple-500 rounded-xl text-white":"w-full py-3 my-8 text-lg bg-purple-200 rounded-xl text-white"} onClick={()=>createComment(null)}>Comment</button>
                    </div>
                    </div>
                </div>
                {sessionscomment && sessionscomment.length>0 && sessionscomment.filter(comment => !comment.pId).map((pComment,index) => {
                    return(
                        <div key={index}>
                            {newChatCard(pComment,index)}
                        </div>
                    )
                })}
            </div>
            )
        }
    }

    const handleFileMetaChange = (e) => {
        setNotes({ ...notes, [e.target.id]: e.target.value });
        console.log(notes);
    }

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const resetState = () => {
        setShowDeleteAlert(false);
        setUploadAssignmentModal(false);
        setNotes({ ...notes, name: "", fileType: "FILE", youtubeId: "" });
    };

    const createAttachment = (attachment) => {
        
        firebase
        .auth()
        .currentUser.getIdToken(false)
        .then(function (idToken) {
            httpsPOST(
                { idToken, uid: auth.uid},
                `${API_POST_CREATE_SESSION_ATTACHMENT}${match.params.sessionId}`,
                attachment
            ).then((data) => {
                if (data && data.error) {
                    console.log(data);
                } else {
                    console.log("New Attachment server ",data)
                    attachment.Id = data.id;
                    
                    console.log("New Attachment Create ",attachment)
                    let senderProfile={
                        uid:auth.uid,
                        profilePic:profile.picURL?profile.picURL:"",
                        Name:profile.firstName+" "+profile.lastName
                    }
    
                    if(attachment.Attachment_Type__c==="ASSESSMENT"){
                        setAssignments([...assignments,attachment])
                        console.log("MentorList",studentsEnrolled)
                      

                        if(studentsEnrolled.length>0){
                            let mentorData = [{
                                Contact__r:{
                                    Firebase_Id__c:studentsEnrolled[0].Mentor__r.Firebase_Id__c,
                                    Mentor_Course_Enrollment__c:studentsEnrolled[0].Mentor_Course_Enrollment__c
                                }
                            }]
                            sendNotificationtoAll({sessionId:match.params.sessionId,menteeName:profile.firstName+" "+profile.lastName,notesTitle:attachment.Name,sessionTitle:scheduledSession.title,senderProfile:senderProfile},mentorData,"assignmentUploaded")
                        }
                    }else{
                        sendNotificationtoAll({sessionId:match.params.sessionId,mentorName:profile.firstName+" "+profile.lastName,notesTitle:attachment.Name,sessionTitle:scheduledSession.title,senderProfile:senderProfile},studentsEnrolled,"notesUploaded")
                        setAttachments([...attachments, attachment]);
                    }
                    setProgress(0);
                    setShowUploadProgress(false);
                    resetState();
                    toast.success("Attachments uploaded")
                }
            });
        });
    }

    const randomString = () => {
        return "asdasdasd";
    }

    const uploadAttachment = (type) => {
        if(notes.name.length<1){
            setNotesError({
                titleError:true,
                attachmentsError:false
            })
        }else if(notes.fileType.length<1){
            toast("Choose file")
            setNotesError({
                titleError:false,
                attachmentsError:true
            })
        }else{
            
        if (notes.fileType==="FILE" && file) {
            
            let fileExtension = file.name.split(".").pop();
            if (fileExtension) {
                setShowUploadProgress(true);
                const uploadTask = storage
                    .ref(
                        `images/${randomString()}_notes_.${fileExtension}`
                    )
                    .put(file);
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) *
                                100
                        );
                        setProgress(progress);
                    },
                    (error) => {
                        console.log(error);
                    },
                    () => {
                        storage
                            .ref("images")
                            .child(
                                `${randomString()}_notes_.${fileExtension}` 
                            )
                            .getDownloadURL()
                            .then((url) => {
                                console.log(`File URL ${url}`);
                                let body = {
                                    FILE_URL__c: url,
                                    Name: notes.name,
                                    Uploaded_By__c:profile.sfid
                                }
                                if(type==="ASSESSMENT"){
                                    body.Attachment_Type__c = "ASSESSMENT"
                                    body.File_Type__c = "FILE"
                                }else if(type==="NOTE"){
                                    body.Attachment_Type__c = "NOTE"
                                    body.File_Type__c = notes.fileType
                                }
                                createAttachment(body);
                            })
                            .catch((err) => {
                                console.log("ERROR" + err);
                            });
                    }
                );
            } else {
                console.lo("Invalid file: please select a valid file.");
            }
        }else if(notes.fileType==="VIDEO"){
            
            createAttachment({
                File_Type__c: notes.fileType,
                Name: notes.name,
                Video_Id__c: notes.youtubeId,
                Attachment_Type__c:"NOTE",
                Uploaded_By__c:profile.sfid
            });
        }
        else {
            toast.error("Invalid file: please select a valid file.")
            console.log("Invalid file: please select a valid file.");
        }
    }
    }



    const createAssignmentContent =()=>{
        return(

            <div className="md:min-w-screen md:h-screen animated fadeIn faster  fixed  left-0 top-0 flex justify-center items-center inset-0 z-50 outline-none focus:outline-none bg-no-repeat bg-center bg-cover p-12"  id="modal-id">
                <div className="absolute bg-black opacity-90 inset-0 z-0"></div>
                <div className="md:w-full  md:max-w-lg py-5 md:px-10 relative mx-auto my-auto rounded-xl shadow-lg  bg-white p-5">
                <div class="text-center ">
                            <h2 class="mt-5 md:text-3xl text-base font-bold text-gray-900">
                                Upload {profile.userType==="instructor"?"Notes":"Assignment"}
                            </h2>
                            <p class="mt-2 text-sm text-gray-400">Lorem ipsum is placeholder text.</p>
                        </div>
                        <div class="md:mt-8 mt-3 space-y-3">
                                    <div class="grid grid-cols-1 space-y-2">
                                        <label class="text-sm font-bold text-gray-500 tracking-wide">Title</label>
                                            <input id = "name" class="text-base p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500" type="" placeholder="Title" onChange={handleFileMetaChange} value={notes.name}/>
                                            {notesError.titleError && <h1 className="text-xs text-red-500">Enter name of the file</h1>}
                                    </div>
                                    {profile.userType==="instructor" &&
                                          <div className="grid grid-cols-1 space-y-2">
                                         <label class="text-sm font-bold text-gray-500 tracking-wide">Attachment Type</label>
                                          <select
                                              id="fileType"
                                              onChange={handleFileMetaChange}
                                              className="text-base p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                                              placeholder="Category"
                                              value={notes.fileType}
                                          >
                                              {notes.typeValues &&
                                                  notes.typeValues.map(
                                                      (type, index) => (
                                                          <option
                                                              key={index}
                                                              value={type}
                                                          >
                                                              {type}
                                                          </option>
                                                      )
                                                  )}
                                          </select>
                                      </div>
                                    }
                                    {notes.fileType === "VIDEO" && (
                                            <div className="grid grid-cols-1 space-y-2">
                                             <label class="text-sm font-bold text-gray-500 tracking-wide">Youtube video Id</label>
                                                <input
                                                    className="text-base p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                                                    id="youtubeId"
                                                    type="text"
                                                    placeholder="Youtube video Id"
                                                    onChange={handleFileMetaChange}
                                                    value={notes.youtubeId}
                                                />
                                            </div>
                                    )}
                                    {notes.fileType !=="VIDEO" ?
                                        <>
                                            <div class="grid grid-cols-1 space-y-2">
                                                    <label class="text-sm font-bold text-gray-500 tracking-wide">Attach Document</label>
                                        <div class="flex items-center justify-center w-full">
                                            <label class="flex flex-col rounded-lg border-4 border-dashed w-full md:h-60 h-24 p-10 group text-center">
                                                <div class="md:h-full w-full text-center flex flex-col items-center justify-center">
                                                    
                                                    <div class="flex flex-auto max-h-48 w-2/5 mx-auto md:-mt-10 hidden">
                                                        <img class="has-mask h-36 object-center" src="https://img.freepik.com/free-vector/image-upload-concept-landing-page_52683-27130.jpg?size=338&ext=jpg" alt="freepik image"/>
                                                    </div>
                                                    <p class="md:hidden pointer-none text-gray-500 "><span class="text-sm">Choose file</span><br /> </p>
                                                    <p class="md:pointer-none md:text-gray-500 hidden"><span class="text-sm">Drag and drop</span> files here <br /> or select a file from your computer</p>
                                                </div>
                                                <input type="file" className="hidden" onChange={handleChange}/>
                                            </label>
                                        </div>
                                        
                                    </div>
                                    <p class="text-sm text-gray-300">
                                        <span>File type: doc,pdf,types of images</span>
                                    </p>
                                        </>  :null  
                                }
                                    
                                    <div>
                                    {showUploadProgress && (
                                        <div className="mt-5">
                                            <h5>Uploading please wait..</h5>
                                            <div
                                                className="bg-gray-300 rounded md:h-6 h-3"
                                                role="progressbar"
                                                aria-valuenow="1"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            >
                                                <div
                                                    className="bg-blue-800 rounded h-6 text-center text-white text-sm transition"
                                                    style={{
                                                        width: `${progress}%`,
                                                        transition: "width 2s",
                                                    }}
                                                >
                                                    {progress}%
                                                </div>
                                            </div>
                                        </div>
                                    )}

                        <button type="submit" class="mt-5 w-full flex justify-center bg-purple-500 text-gray-100 md:p-4 p-2  rounded-full tracking-wide
                                    font-semibold  focus:outline-none focus:shadow-outline hover:bg-purple-600 shadow-lg cursor-pointer transition ease-in duration-300" onClick={()=>{profile.userType==="instructor"?  uploadAttachment("NOTE"):uploadAttachment("ASSESSMENT")}}>
                        Upload
                    </button>
                    <button type="submit" class="mb-5 mt-3 w-full flex justify-center bg-gray-100 text-gray-500  md:p-4 p-2 rounded-full tracking-wide
                                    font-semibold  focus:outline-none focus:shadow-outline hover:bg-gray-200 shadow-lg cursor-pointer transition ease-in duration-300"
                                    onClick={()=>setUploadAssignmentModal(false)}>
                        Cancel
                    </button>
                    </div>
                        </div>
                </div>
            </div>
        )
    }

    const yesterday = moment().subtract(1, "day");
    const valid=(current)=>{
        return current.isAfter(yesterday);
    }

    const sessionComplete =()=>{
        
        if(scheduledSession.status==="COMPLETED"){
            toast("Session has already completed")
        }else{
            let eventToUpdate = [
                { Id:scheduledSession.id, Status__c: "COMPLETED" },
            ];
            firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsPOST(
                    { idToken, uid: auth.uid},
                    `${API_POST_UPDATE_SESSIONS}${match.params.enrolId}`,
                    eventToUpdate
                ).then((response) => {
                    let senderProfile={
                        uid:auth.uid,
                        profilePic:profile.picURL?profile.picURL:"",
                        Name:profile.firstName+" "+profile.lastName
                    }
                    console.log(response);
                    if (response && response.error) {
                        console.log(response.techMsg);
                        toast.error(response.error)
                    } else {
                        console.log(response);
                        sendNotificationtoAll({sessionId:match.params.sessionId,title:scheduledSession.title,senderProfile:senderProfile},userList,"sessionCompleted")
                        toast.success("Congrats! session completed.")
                        setScheduleSession({...scheduledSession,status:"COMPLETED"})
                    }
                });
            })
        }
    }


    const sessionModalUi=()=>{
        return (
            showReschedule && (
                <div class="grid gap-8 grid-cols-1">
                    <div class="flex flex-col ">
                        <div class="flex flex-col sm:flex-row items-center">
                            <h2 class="font-semibold text-lg mr-auto">
                                Create Session
                            </h2>
                        </div>
                        <div class="mt-2">
                            <div class="form">
                                <div>
                                    <label
                                        className="block text-gray-700 text-sm font-bold mb-2"
                                        htmlFor="session_title"
                                    >
                                        Session title
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        type="text"
                                        id="session_title"
                                        onChange={handleInput}
                                        value={scheduledSession.title}
                                    />
                                </div>
                                <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                    <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 py-2">
                                            Session From
                                        </label>
                                        <Datetime
                                            id="start"
                                            onChange={(moment) =>
                                                handleDateChange(
                                                    moment,
                                                    "start"
                                                )
                                            }
                                            isValidDate={valid}
                                            value={scheduledSession.start}
                                        />
                                        {/* {this.state.errorModalEvent.errorStart?<p className="text-red-500">Choose Start Date</p>:null} */}
                                    </div>
                                    <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 py-2">
                                            Session to
                                        </label>
                                        <Datetime
                                            id="end"
                                            isValidDate={valid}
                                            onChange={(moment) =>
                                                handleDateChange(moment, "end")
                                            }
                                            value={scheduledSession.end}
                                        />
                                        {/* {this.state.errorModalEvent.errorEnd?<p className="text-red-500">Choose End Date</p>:null} */}
                                    </div>
                                </div>

                                <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                    <div class="mb-3 space-y-2 w-full text-xs">
                                        <label class="font-semibold text-gray-600 py-2">
                                            Meeting Link
                                        </label>
                                        <input
                                            type="text"
                                            id="meetingLink"
                                            onChange={handleInput}
                                            value={scheduledSession.meetingLink}
                                            class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4 "
                                            required="required"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        );
    }

    return (
        <Base history={history} pathList={[{to:"/",name:"Home"},{to:"/mycourse",name:"My enrollments"},{to:'#',name:"Session Details"}]}>
            {showLoader?
                 <div className="flex items-center justify-center h-3/6">
                 <LoaderLarge type="ThreeDots" />
             </div>
                :
            <div className="container mx-auto md:py-6 md:px-4">
                <div className="md:grid md:grid-cols-3 flex flex-col">
                    <div
                        className="md:col-span-1 md:rounded-lg border py-5 px-5 md:mr-5 bg-white"
                        style={{ height: "fit-content" }}
                    >
                        <div className="w-full flex flex-row mb-5">
                            <img src={scheduledSession.courseMaster.Thumbnail_URL__c?scheduledSession.courseMaster.Thumbnail_URL__c:"https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/trails/force_com_dev_beginner/39ed2e90cae0e0428a8ea1a110425370_icon.png"}className="h-20 w-20 bg-red-600 rounded-lg" alt="thumbnail"/>
                            <div className="flex flex-col ml-3 mt-3">
                                <h1 className="text-gray-700 text-xl">{scheduledSession.courseMaster.Name}</h1>
                                <div className="flex flex-row mt-1">
                                    <h1 className="text-gray-700 text-base mr-2">Session:-</h1>
                                    <h1 className="text-gray-500 text-base">{scheduledSession.title}</h1>
                                </div>
                            </div>
                        </div>
                        {scheduledSession.sessionAgenda &&
                            <div className="flex flex-col mt-3">    
                                <h1 className="text-gray-700 text-xl">Agenda:-</h1>
                                <h1 className="text-gray-500 text-base">{renderHTML(scheduledSession.sessionAgenda)}</h1>
                            </div>
                        }
                       
                        {profile.userType==="instructor" &&
                             <div className="w-full flex flex-row justify-between mb-3 mt-3">
                                <div
                                    className=
                                            {scheduledSession.status==="COMPLETED"?"w-full cursor-pointer bg-green-500 py-2 px-3 rounded-lg text-white text-center"
                                            :"cursor-pointer bg-yellow-500 py-2 px-3 rounded-lg text-white text-center mr-1"}
                                    
                                    onClick={() => sessionComplete()}
                                >
                                    {scheduledSession.status==="COMPLETED"?"Session completed":"Mark as complete"}
                                </div>
                                {scheduledSession.status!=="COMPLETED" &&
                                    <div
                                    className=
                                            "cursor-pointer bg-blue-700 py-2 px-3 rounded-lg text-white text-center ml-1"
                                    onClick={() => setShowReschedule(true)}
                                >
                                    Reschedule session
                                </div>}
                                
                             </div>
                        }

                        <div className="md:flex md:flex-col md:justify-center flex flex-row justify-between">
                       <div
                            className={
                                selectedTab === 1
                                    ? "bg-gray-700 py-2 px-3 rounded-lg mt-3 text-white text-center"
                                    : "text-center cursor-pointer bg-gray-300 py-2 px-3 mt-3 rounded-lg text-black"
                            }
                            onClick={() => setSelectedtab(1)}
                        >
                            Discussions
                        </div>

                        <div
                            className={
                                selectedTab === 2
                                    ? "bg-gray-700 py-2 px-3 rounded-lg mt-3 text-white text-center"
                                    : "text-center cursor-pointer bg-gray-300 py-2 px-3 mt-3 rounded-lg text-black"
                            }
                            onClick={() => setSelectedtab(2)}
                        >
                            Notes
                        </div>
                        <div
                            className={
                                selectedTab === 3
                                    ? "bg-gray-700 py-2 px-3 rounded-lg mt-3 text-white text-center"
                                    : "text-center cursor-pointer bg-gray-300 py-2 px-3 mt-3 rounded-lg text-black"
                            }
                            onClick={() => setSelectedtab(3)}
                        >
                            Assignments
                        </div>
                        </div>
                       
                        {/* {scheduledSession.status==="COMPLETED"?
                         <div className="w-full h-2 bg-green-400 mt-3"/>:
                         <div className="w-full h-2 bg-yellow-400 mt-3"/>   
                        } */}
                    </div>

                    {setScreen()}
                    {uploadAssignmentModal && createAssignmentContent()}
                    {showReschedule && 
                          <CommonDetailModal
                          handleEvent={rescheduleEventHandle}
                          showModal={showReschedule}>
                              {sessionModalUi()}    
                          </CommonDetailModal>
                    }
                    {showDeleteAlert && (
                        <DeleteAlert
                            showModal={showDeleteAlert}
                            handleEvent={handleModalEvent}
                            action={action}
                        />
                    )}
                </div>
            </div>
            }
        </Base>
    );
}

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile,
        sessionscomment: state.firestore.ordered.sessionscomment,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        sendNotificationtoAll: (data,menteeList,type) => dispatch(sendBulkNotification(data,menteeList,type)),
        sendReplyNotification: (data) => dispatch(sendReplyNotification(data))
    };
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    firestoreConnect((props)=> {
        console.log("Props",props)
        return [
        {
            collection: "sessionscomment",
            where: [["sessionId", "==", props.match.params.sessionId]]
        },
    ]})
)(SessionComponent);