import React, { useEffect, useState } from "react";
import { LoaderLarge } from "../../ui_utilities/Loaders";
import YouTubeHelper from "../../player/YoutubePlayer";
import Base from "../../Base";
import { connect } from "react-redux";
import {AiFillFile, IoIosArrowDown, RiVideoLine,IoIosArrowUp, RiFileForbidLine, BiSend, BiTrash, BsCloudUpload, ImFileEmpty, FaYoutube, HiCloudDownload, FaTrash, FaCheck, BiCircle, FaTrophy} from 'react-icons/all'
import renderHTML from "react-render-html";
import {API_GET_LEARN, API_POST_CREATE_SESSION_ATTACHMENT, API_POST_UPDATE_SESSIONS,
    API_DELETE_SESSION_ATTACHMENT,API_POST_MARK_SESSION_STATUS} from "../../../backend"
import {httpsGET,httpsPOST as menteePOST} from "../../../backend_api/menteeAPI"
import {
    httpsPOST,
    httpsDELETE,
} from "../../../backend_api/mentorAPI";
import {firebase,storage} from "../../../config/fbConfig"
import { toast } from "react-toastify";
import moment from "moment";
import {sendBulkNotification,sendReplyNotification} from "../../../store/actions/appActions"
import DeleteAlert from '../../settings/DeleteAlert'
import { saveAs } from "file-saver";
import {BsChevronRight,BsChevronLeft} from 'react-icons/all'
import Datetime from "react-datetime";
import renderHtml from "react-render-html"
import { CircularProgress } from "../../ui_utilities/CircularProgress";
import CommonDetailModal from "../../settings/CommonDetailModal";


const LearnSession = ({auth,profile,history,match,sendNotificationtoAll,sendReplyNotification,location}) => {
    
    
    // if(location.state && location.state!==undefined){
        
    //     window.location.reload() 
    // }
    console.log("Locations",location)
    const [selectedEvent,setSelectedEvent] = useState({})
    const [selectedNotes,setSelectedNotes] = useState({})
    const [modules,setModules] = useState([])
    const [showLoader,setShowLoader] = useState(true)
    const [selectedOptions,setSelectedOptions] = useState(1)
    const [selectedSessions,setSelectedSessions] = useState({})
    const [commentData,setCommentData] = useState("")
    const [showDeleteAlert,setShowDeleteAlert] = useState(false)
    const [showUserList,setShowUserList] = useState({})
    const [userList,setUserList] = useState([])
    const [studentsEnrolled,setStudentEnrolled] = useState([]);
    const [childCommentData,setChildCommentData] = useState([])
    const minChatNumber = 5
    const [minChat,setMinChat] = useState([])
    const [action, setAction] = useState("")
    const [index,setIndex] = useState({
        moduleIndex:0,
        sessionIndex:0,
    })

    const [handlerCount,setHandlerCount] = useState(1)
    const [uploadAssignmentModal, setUploadAssignmentModal] = useState(false)
    const [notesError,setNotesError] = useState({
        titleError:false,
        attachmentsError:false
    })
    const [notes, setNotes] = useState({
        name:"",
        fileType:"FILE",
        youtubeId: "",
        typeValues: ["VIDEO", "FILE"]
    });
    const [file, setFile] = useState(null);
    const [fileName,setFileName] = useState("");
    const [progress, setProgress] = useState(0);
    const [showUploadProgress, setShowUploadProgress] = useState(false);
    const [assignmentsCommentData,setAssignmentsCommentData] = useState([])
    const [completedSession,setCompletedSession] = useState(0);
    const [totalSession,setTotalSession] = useState(0);
    const [focusableItem,setFocusableItem] = useState()
    const [showReschedule,setShowReschedule] = useState(false)
    const [scheduleSessions,setScheduleSessions] = useState({
        Id: "",
        Start_DateTime__c: "",
        End_DateTime__c: "",
        Meeting_Link__c: "",
        Session_Title__c:""
    })
    const [showProgress,setShowProgress] = useState(false);


    useEffect(() => {
        
        loadData();
    },[])

    const loadData = ()=>{
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsGET(
                    { idToken, uid: auth.uid },
                    `${API_GET_LEARN}?enrollId=${match.params.enrollId}&user_type=${profile.userType}`
                ).then((data)=>{
                    let modulesTemp = []
                    let comments = []
                    let feedback = []
                    let mentees = []
                    let items=0;
                    let contactList=[];
                    let cmpSession;
                    let numberOfSession=0;

                    let selectedEventTemp;
                    let selectedSession;
                    let selectedModuleIndex,selectedSessionIndex;

                    console.log("SF Response1:- ",data)
                    if(data && data.Result && data.Result.length>0){

                        console.log("SF Response:- ",data)
                        
                        //setting mentees
                        if(data.Result[0].mentee && data.Result[0].mentee.length>0) {
                            contactList = data.Result[0].mentee
                            mentees = data.Result[0].mentee.filter((user)=>user.Contact__c!==profile.sfid)
                        }

                        let modulesTemp = data.Result[0].modules;

                        if(profile.userType==="student"){
                            cmpSession = data.Result[0].courseupdatelist.filter((sessionStatus)=>sessionStatus.Status__c==="Completed").length
                        }
                        
                        modulesTemp.forEach((module,mIndex)=>{
                            module.sessions.forEach((mSession,sIndex)=>{
                                numberOfSession+=1;
                                if(data.Result[0].courseupdatelist){
                                    let courseUpdate = data.Result[0].courseupdatelist.find((cUpdate,cIndex)=>{
                                        return(cUpdate.CE_Session__c===mSession.session.Id)
                                    })
                                    mSession.status = courseUpdate
                                }

                                if(mSession.attachmentsByMentor && mSession.attachmentsByMentor.length > 0){
                                    mSession.session.handlerIndex = items + mSession.attachmentsByMentor.length;
                                    items = mSession.session.handlerIndex 
                                    console.log(`SessionSIF ${mSession.attachmentsByMentor.length}`,mSession)
                                }else{
                                    mSession.session.handlerIndex = items+1;
                                    items = mSession.session.handlerIndex = items+1;
                                    console.log("SessionSElse",mSession)
                                }

                                if(location.state && location.state!==undefined){
                                    console.log("State",location.state)
                                    debugger;
                                    console.log("Location State",location.state)
                                    if(location.state.sessionId && location.state.sessionId === mSession.session.Id){
                                        console.log("HittingThis",mSession.session.Id);
                                        debugger;
                                        modulesTemp[mIndex].open = true;
                                        selectedModuleIndex = mIndex;
                                        selectedSessionIndex = sIndex;
                                        selectedSession = mSession
                                        setFocusableItem(mSession)
                                        setSelectedOptions(1);
                                        setHandlerCount(mSession.session.handlerIndex)
                                    }
                                    if(location.state.NotificationType==="sessionRescheduledForSessionComponent"){
                                        if(location.state.sessionId===mSession.session.Id && location.state.moduleId===module.moduleRec.Id 
                                            ){
                                                debugger;
                                                modulesTemp[mIndex].open = true;
                                                selectedModuleIndex = mIndex;
                                                selectedSessionIndex = sIndex;
                                                selectedSession = mSession
                                                
                                                setSelectedOptions(1);
                                                setHandlerCount(mSession.session.handlerIndex)
                                            }
                                    }
                                    if(location.state.NotificationType==="notesUploaded"){
                                        debugger;
                                        if(location.state.sessionId===mSession.session.Id && location.state.moduleId===module.moduleRec.Id 
                                            && mSession.attachmentsByMentor!==null && mSession.attachmentsByMentor.length>0 && mSession.attachmentsByMentor.find((attachment)=> attachment.Id===location.state.attachmentId)!==undefined){
                                                debugger;
                                                modulesTemp[mIndex].open = true;
                                                selectedModuleIndex = mIndex;
                                                selectedSessionIndex = sIndex;
                                                selectedSession = mSession
                                                selectedEventTemp = mSession.attachmentsByMentor.find((attachment)=> attachment.Id===location.state.attachmentId)
                                                
                                                setFocusableItem(location.state.attachmentId)
                                                setSelectedOptions(3);
                                                setHandlerCount(mSession.session.handlerIndex)
                                            }
                                    }

                                    if(location.state.NotificationType==="assignmentFeedbackUploaded" || location.state.NotificationType==="assignmentUploaded"){
                                        debugger;
                                        if(location.state.sessionId===mSession.session.Id && location.state.moduleId===module.moduleRec.Id 
                                            && mSession.attachmentsByMentee!==null && mSession.attachmentsByMentee.length>0 && mSession.attachmentsByMentee.find((attachment)=> attachment.Id===location.state.attachmentId)!==undefined){
                                                modulesTemp[mIndex].open = true;
                                                selectedModuleIndex = mIndex;
                                                selectedSessionIndex = sIndex;
                                                selectedSession = mSession
                                                selectedEventTemp = mSession.attachmentsByMentee.find((attachment)=> attachment.Id===location.state.attachmentId)

                                                if(location.state.NotificationType==="assignmentFeedbackUploaded"){
                                                    setFocusableItem(location.state.commentId)
                                                }else{
                                                    setFocusableItem(location.state.attachmentId)
                                                }

                                                setSelectedOptions(4);
                                                setHandlerCount(mSession.session.handlerIndex)
                                            }
                                    }

                                    if(location.state.NotificationType==="commentCreatedByMentor" || location.state.NotificationType==="commentCreatedByMentee"|| location.state.NotificationType==="replyAlert"){
                                        debugger;
                                        if(location.state.sessionId===mSession.session.Id && location.state.moduleId===module.moduleRec.Id){

                                                modulesTemp[mIndex].open = true;
                                                selectedModuleIndex = mIndex;
                                                selectedSessionIndex = sIndex;
                                                selectedSession = mSession
                                                    if(mSession.attachmentsByMentor && mSession.attachmentsByMentor.length>0){
                                                        selectedEventTemp = mSession.attachmentsByMentor[0]
                                                    }else{
                                                        selectedEventTemp = null
                                                    }

                                                setFocusableItem(location.state.commentId)
                                                setSelectedOptions(location.state.activeTab);
                                                setHandlerCount(mSession.session.handlerIndex)
                                            }
                                    }
                                }



                                if(!selectedSession && !selectedEventTemp){
                                    modulesTemp[0].open = true;
                                    selectedModuleIndex = mIndex;
                                    selectedSessionIndex = sIndex;
                                    selectedSession = mSession
                                    debugger;

                                    if(mSession.attachmentsByMentor && mSession.attachmentsByMentor.length>0){
                                        selectedEventTemp = mSession.attachmentsByMentor[0]
                                    }else{
                                        selectedEventTemp = null
                                    }
                                }
                               
                            })
                        })

                        if(selectedSession){
                            
                            firebase.firestore().collection("sessionscomment").where("sessionId","==",modulesTemp[selectedModuleIndex].sessions[selectedSessionIndex].session.Id).get().then((snapshot)=>{
                                if(!snapshot.empty){
                                    snapshot.forEach((doc)=>{
                                        let body = doc.data()
                                        body.id = doc.id
                                        comments.push(body)
                                    })
                                    comments = comments && comments.slice().sort((a,b)=>{return a.createdDate.seconds - b.createdDate.seconds})
                                }

                                firebase.firestore().collection("AttachmentFeedback").where("sessionId","==",modulesTemp[selectedModuleIndex].sessions[selectedSessionIndex].session.Id).get().then((snapshot)=>{
                                    if(!snapshot.empty){
                                        snapshot.forEach((doc)=>{
                                            let body = doc.data()
                                            body.id = doc.id
                                            feedback.push(body)
                                        })
                                        feedback = feedback && feedback.slice().sort((a,b)=>{return a.createdDate.seconds - b.createdDate.seconds})
                                    }
                                    modulesTemp[selectedModuleIndex].sessions[selectedSessionIndex].comments = comments
                                    modulesTemp[selectedModuleIndex].sessions[selectedSessionIndex].feedback = feedback
                                    setIndex({moduleIndex:selectedModuleIndex,sessionIndex:selectedSessionIndex})
                                    setSelectedSessions(selectedSession)
                                    setSelectedNotes(selectedEventTemp)
                                    setModules(modulesTemp)
                                    setShowLoader(false)
                                })
                            })
                        }else{
                            setIndex({moduleIndex:selectedModuleIndex,sessionIndex:selectedSessionIndex})
                            setSelectedSessions(selectedSession)
                            setSelectedNotes(selectedEventTemp)
                            setModules(modulesTemp)
                            setShowLoader(false)
                        }

                        console.log("Modules",modulesTemp)
                        console.log("SelectedSession",selectedSession)
                        console.log("Menteed",mentees)
                        console.log("ContactList",contactList)
                        console.log("Notes",selectedEventTemp)
                        

                        setUserList(mentees)
                        setStudentEnrolled(contactList)
                        setTotalSession(numberOfSession)
                        setCompletedSession(cmpSession)
                        debugger;

                        if(numberOfSession===0){
                            toast.error("Ohhoo, Session not created yet!")
                        }
                    }
                    
                })
            })
    }


    const userListUi = (pIndex)=>{
        console.log("pIndex",pIndex)
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
                            // setChildCommentData(msg+" @"+user.Contact__r.Name+" ")
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

    const replyCard = (cComment)=>{
        return(
            <div id="middle-commented-chats" className={cComment.id===focusableItem?"flex flex-row items-stretch py-3 px-5 border-l-2 border-orange-500":"flex flex-row items-stretch py-3 px-5"}>
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

    const feedbackReplyCard = (feedback)=>{
        console.log("FeedbackDataaa",feedback)
        return(
            <div id="middle-commented-chats" className={feedback.id===focusableItem?"flex flex-row items-stretch py-3 border-l-2 border-orange-500":"flex flex-row items-stretch py-3"}>
                <div className="flex-shrink-0 h-10 w-10">
                    <img
                        className="h-10 w-10 rounded-full"
                        src= "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"
                        alt=""
                    />
                </div>
                <div className="flex flex-col ml-4 w-full">
                    <div className="flex flex-row mt-1 w-full">
                        <h1 className="text-sm text-start mr-2">{studentsEnrolled.find((user) => user.Contact__r.Id===feedback.from).Contact__r.Name}</h1>
                            {setTimer(feedback.createdDate)}
                    </div>
                    <h2 className=" flex flex-row text-sm mt-1">{ renderHTML(feedback.msg)}</h2>
                </div>
                {feedback.from===profile.sfid &&
                    <BiTrash className="cursor-pointe hover:bg-gray-200 rounded-full mr-3" onClick={()=>{setShowDeleteAlert(true)
                        setAction("FEEDBACKDELETE")
                        setSelectedEvent(feedback)
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

    const overviewUi=()=>{
        return(
            selectedSessions?
            <div className="bg-white flex flex-col mt-5 ">
                <div className="border-b border-gray-300">
                    <div id="session-agenda" className="text-gray-900 max-w-xl p-7 ">
                        <h1 className="text-2xl font-bold">{selectedSessions.session.Session_Title__c}</h1>
                        <p className="text-base mt-2">{selectedSessions.session.Session_Agenda__c && renderHtml(selectedSessions.session.Session_Agenda__c)}</p>
                    </div>
                </div>
                {selectedSessions.session.Start_DateTime__c && selectedSessions.session.Start_DateTime__c.length>6 &&
                            <div className="border-b border-gray-300">
                                <div id="session-agenda" className="text-gray-900 max-w-xl p-7 ">
                                    <h1 className="text-base mt-2">Start Date:- {moment(selectedSessions.session.Start_DateTime__c).calendar()}</h1>
                                    <p className="text-base mt-2">End Date:- {moment(selectedSessions.session.End_DateTime__c).calendar()}</p> 
                                </div>
                            </div>
                        }
               
                {selectedSessions.session.Meeting_Link__c &&
                    <div className="border-b border-gray-300">
                        <div id="session-agenda" className="text-gray-900 max-w-xl p-7 ">
                            <h1 className="text-base mt-2">Meeting Link:- <a href={`${selectedSessions.session.Meeting_Link__c}`} target="_blank" className="text-blue-500">{selectedSessions.session.Meeting_Link__c}</a></h1>
                        </div>
                    </div>
                }
                
            </div>:null
        )
    }


    const handleExpand = (i)=>{
        let copyModules = [...modules]; 

        for (let j = 0; j < copyModules.length; j++) {
            if(i ===j ){
                copyModules[i].open = true;
            } else{
                copyModules[j].open = false;
            }
        }
        setModules(copyModules);
    }

    const handleFileMetaChange = (e) => {
        setNotes({ ...notes, [e.target.id]: e.target.value });
        console.log(notes);
    }

    const handleChange = (e) => {
        debugger;
        if (e.target.files[0]) {
            setFileName(e.target.files[0].name)
            setFile(e.target.files[0]);
        }
    };

    const newChatCard = (pComment,pIndex) => {
        return(
            <div className={pComment.id===focusableItem?"flex flex-col  py-3 md:my-8 my-2 bg-white border-l-2 border-orange-500":"flex flex-col  py-3 md:my-8 my-2 border bg-white"}>                
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
                {
                    ((profile.userType==="instructor") || (firebase.auth().currentUser.uid === pComment.from)||(pComment.from===pComment.mentorFbId))?
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
                                    }}
                                >
                                </textarea>
                                <BiSend size={32} className="mt-2 cursor-pointer text-gray-700" 
                                    onClick={()=>createComment(pComment.id,pComment,pIndex)}
                                />
                            </div>
                            {showUserList.status && showUserList.index===pIndex &&  userListUi(pIndex)}
                            </div>
                        </div>
                    </>:
                    null
                }
                {selectedSessions.comments && selectedSessions.comments.length>0  && selectedSessions.comments.filter(c=> c.pId===pComment.id).slice(0,minChat.find((data)=>data.index===pIndex)?minChat.find((data)=>data.index===pIndex).count-1:minChatNumber)
                    .map((d)=>{return replyCard(d,pIndex)})}
                {showMoreOrNot(pIndex,pComment)}
                </div>
        )
    }

    const showMoreOrNot =(index,pComment)=>{
        let upto;
        if(selectedSessions.comments && selectedSessions.comments.length>0){
            if(minChat.length && minChat.find(data=>data.index===index)){
                upto = minChat.find(data=>data.index===index).count
            }else{
                upto = minChatNumber
            }
            return(
                <>
                    {selectedSessions.comments.filter(c=> c.pId===pComment.id).length>upto &&
                        <div className="w-full justify-end">
                            <h1 className="cursor-pointer text-blue-600 text-sm text-center mr-3" 
                                onClick={()=>{
                                    let minChatCopy = minChat;
                                    if(!minChatCopy.find((data)=>data.index===index)){
                                        let body = {index:index, count:selectedSessions.comments.filter((c=>c.pId===pComment.id)).length}
                                        console.log("MinchatCopy",minChatCopy)
                                        minChatCopy.push(body)
                                        setMinChat([...minChat,body])
                                    }else{
                                        minChatCopy.filter((data)=>data.index!==index)
                                        let body = {index:index, count:minChatNumber}
                                        minChatCopy.push(body)
                                        setMinChat(minChatCopy)
                                    }
                                }}
                            >{selectedSessions.comments.filter(c => c.pId===pComment.id).length>upto?"Show More":"Show Less"}</h1>
                        </div>
                    }
                </>
            )
        }else{
            return <h1>Joke</h1>;
        }
    }

    const showMoreOrNotFeedback =(aIndex,attachment)=>{
        let upto;
        if(selectedSessions.feedback && selectedSessions.feedback.length>0){
            if(minChat.length && minChat.find(data=>data.index===aIndex)){
                upto = minChat.find(data=>data.index===aIndex).count
            }else{
                upto = minChatNumber
            }
            return(
                <>
                    {selectedSessions.feedback.filter(c=> c.attachmentId===attachment.Id).length>upto &&
                        <div className="w-full justify-end">
                            <h1 className="cursor-pointer text-blue-600 text-sm text-center mr-3" 
                                onClick={()=>{
                                    let minChatCopy = minChat;
                                    if(!minChatCopy.find((data)=>data.index===aIndex)){
                                        let body = {index:aIndex, count:selectedSessions.feedback.filter((c=>c.attachmentId===attachment.Id)).length}
                                        console.log("MinchatCopy",minChatCopy)
                                        minChatCopy.push(body)
                                        setMinChat([...minChat,body])
                                    }else{
                                        minChatCopy.filter((data)=>data.index!==aIndex)
                                        let body = {index:aIndex, count:minChatNumber}
                                        minChatCopy.push(body)
                                        setMinChat(minChatCopy)
                                    }
                                }}
                            >{selectedSessions.feedback.filter(c => c.attachmentId===attachment.Id).length>upto?"Show More":"Show Less"}</h1>
                        </div>
                    }
                </>
            )
        }else{
            return <h1>Joke</h1>;
        }
    }

    const gotoPlayer = (videoId) => {
        history.push({pathname: `/session/play/${videoId}`,state:{sessionDetails:selectedSessions,courseMaster:modules[index.moduleIndex].module.Course_Enrollment__r}})
    }

    const downloadAttachment = (attachment) => {
        debugger;
        // saveAs(attachment.FILE_URL__c);
    };


    const notesUi=()=> {
        return(
            <div className="w-full rounded-lg mt-5 mx-2 md:mx-0">
                {selectedSessions && selectedSessions.attachmentsByMentor && selectedSessions.attachmentsByMentor.length>0?
                    selectedSessions.attachmentsByMentor.map((attachment, index) => {
                        console.log("Notes ",attachment);
                        return (
                            <div
                                className={attachment.Id===focusableItem?"no-underline border-2 border-orange-500 rounded-xl shadow-md overflow-hidden  mt-2 p-5 text-gray-700 bg-white":"no-underline border-b bg-white border-l-8 border-blue-500 rounded-lg shadow-sm overflow-hidden  mt-2 p-5 text-gray-700"}
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
                                        {console.log("AttachmentType___C",attachment.File_Type__c)}
                                        {attachment.File_Type__c ===
                                            "VIDEO" && (
                                            <FaYoutube
                                                className="inline cursor-pointer ml-2 text-gray-800 text-fill"
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
                                                className="inline cursor-pointer ml-2 text-fill text-gray-800"
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
                                            className="inline cursor-pointer ml-2 text-fill text-gray-800 hover:text-black"
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


    const setScreen=()=>{
        if(selectedOptions===1){
            return overviewUi()
        }else if(selectedOptions===2){
            return(
                
                <div className="md:col-span-2 py-2 md:px-8 ">
                       
                <div className="md:flex md:px-5 py-3  px-5 bg-white mt-12">
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
                {selectedSessions && selectedSessions.comments && selectedSessions.comments.length>0 && selectedSessions.comments.filter(comment => !comment.pId).map((pComment,index) => {
                    return(
                        <div key={index}>
                            {newChatCard(pComment,index)}
                        </div>
                    )
                })}
                  
            </div>
            )
        }else if(selectedOptions===3){
            selectedSessions && selectedSessions.attachmentsByMentor && console.log("SELECTEDSESSION",selectedSessions.attachmentsByMentor)
            debugger;
            return(
                
                <div className="md:col-span-2 md:px-8 mt-5">
                   
                    {profile.userType==="instructor" || (profile.userType==="student" && (!selectedSessions.attachmentsByMentor || selectedSessions.attachmentsByMentor.length===0)) ?
                        
                    <div className="flex">
                        <div className="w-full border-0  p-3 bg-white" onClick={()=>{ profile.userType==="instructor"?setUploadAssignmentModal(true):setUploadAssignmentModal(false)}}>
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
                                    <div className="cursor-pointer border-dotted border-4 py-8 max-w-sm mx-auto justy-items-center my-8" >
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
        }else if(selectedOptions===4){
            return(
                <div className="col-span-2 md:px-8 mt-2">
                {(profile.userType==="instructor" && selectedSessions && selectedSessions.attachmentsByMentee===null) || profile.userType==="student"?
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
                    // <div className="cursor-pointer border-dotted border-4  rounded-xl py-8 max-w-sm mx-auto justy-items-center my-8" >
                    //     <ImFileEmpty size={72} className="mx-auto fill-current text-black"/>
                    //     <h2 className="text-base text-center mt-2"> Assignment not found </h2>
                    // </div>
                }
            {assignmentUi2()}
            </div>
            )
        }
    }

    const assignmentUi2 =()=>{
        return(
            <div className="flex w-full flex-col mt-5">
                {selectedSessions && selectedSessions.attachmentsByMentee && selectedSessions.attachmentsByMentee.length>0 &&
                    <>
                        {profile.userType==="instructor"?
                            <>
                                {selectedSessions.attachmentsByMentee.map((attachment,aIndex)=>{
                                    return(
                                        <div className="w-full mb-5">
                                        <div className="w-full justify-center">                
                                            <div className="w-full flex flex-row">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    <img
                                                        className="h-12 w-12 rounded-full"
                                                        src= "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"
                                                        alt="profile"
                                                    />
                                                </div>
                                                <div className="mt-1 ml-4 w-full">
                                                    <h1 className="text-sm font-semibold text-start">{studentsEnrolled.find((user) => user.Contact__r.Id===attachment.Uploaded_By__c).Contact__r.Name}</h1>
                                                    {setTimer(attachment.CreatedDate)}
                                                    <div className="flex flex-col justify-start  w-full">
                                                        {commonAssignmentUi(attachment)}
                                                        <>
                                                            <div id="footer-reply-box" className="flex flex-row py-5">
                                                                <div className="flex-shrink-0 h-10 w-10">
                                                                    <img
                                                                        className="h-10 w-10 rounded-full"
                                                                        src= "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"
                                                                        alt=""
                                                                    />
                                                                </div>
                                                                <div className="w-full mx-3">
                                                                    <div className="w-full flex flex-row  rounded-xl border focus:ring-4">
                                                                        <textarea type="text" id="rating"  
                                                                            placeholder="comment"
                                                                            onKeyUp={(event)=>{
                                                                                if(event.keyCode===13){
                                                                                    createAssignmentFeedback(attachment,aIndex)
                                                                                }
                                                                            }}
                                                                            value={assignmentsCommentData.find((data)=>data.index===aIndex)?assignmentsCommentData.find((data)=>data.index===aIndex).value:""}
                                                                            rows="1" className="overflow-hidden w-full p-3 text-gray-600 rounded-xl resize-none border-0 bg-gray-100 focus:ring-0"
                                                                            onChange={e => {
                                                                                if(assignmentsCommentData.find((comment)=>comment.index===aIndex)){
                                                                                        let copy = assignmentsCommentData
                                                                                        copy = copy.filter((comment)=>{return comment.index!==aIndex})
                                                                                        let newVal = assignmentsCommentData.find((c)=>c.index===aIndex)
                                                                                        newVal.value = e.target.value
                                                                                        copy.push(newVal)

                                                                                        console.log("NEWVAL",copy)
                                                                                        setAssignmentsCommentData(copy)
                                                                                    }else{
                                                                                    
                                                                                        let body = {value:e.target.value,index:aIndex}
                                                                                        setAssignmentsCommentData([...assignmentsCommentData,body])
                                                                                }
                                                                            }}
                                                                        >
                                                                        </textarea>
                                                                        <BiSend size={32} className="mt-2 mr-2 cursor-pointer text-gray-700" 
                                                                            onClick={()=>
                                                                                createAssignmentFeedback(attachment,aIndex)
                                                                            }
                                                                        />
                                                                    </div>    
                                                                </div>  
                                                            </div>
                                                        </>
                                                    </div>
                                                    {selectedSessions.feedback && selectedSessions.feedback.length>0 && selectedSessions.feedback.filter(c=> c.attachmentId===attachment.Id).map((d)=>{return feedbackReplyCard(d,aIndex)})}
                                                </div>
                                            </div>
                                            {/* {selectedSessions.feedback && selectedSessions.feedback.length>0  && selectedSessions.feedback.filter(c=> c.attachmentId===attachment.Id).slice(0,minChat.find((data)=>data.index===aIndex)?minChat.find((data)=>data.index===aIndex).count-1:minChatNumber)
                                                .map((d)=>{return feedbackReplyCard(d,aIndex)})}
                                            {showMoreOrNotFeedback(aIndex,attachment)} */}
                                        </div> 
                                        </div>       
                                    )
                                })}
                            </>:
                            <>
                                {selectedSessions.attachmentsByMentee.filter((attachment) =>attachment.Uploaded_By__c===profile.sfid).map((attachment,aIndex)=>{
                                    return(
                                        <div className="w-full mb-5">
                                            <div className="w-full justify-center">                
                                                <div className="w-full flex flex-row">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        <img
                                                            className="h-12 w-12 rounded-full"
                                                            src= "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"
                                                            alt="profile"
                                                        />
                                                    </div>
                                                    <div className="mt-1 ml-4 w-full">
                                                        <h1 className="text-sm text-start">{studentsEnrolled.find((user) => user.Contact__r.Id===attachment.Uploaded_By__c).Contact__r.Name}</h1>
                                                        {setTimer(attachment.CreatedDate)}
                                                        <div className="flex flex-col justify-start  w-full">
                                                            {commonAssignmentUi(attachment)}
                                                        <>
                                                            <div id="footer-reply-box" className="flex flex-row py-5">
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
                                                                                            createAssignmentFeedback(attachment,aIndex)
                                                                                        }
                                                                                    }}
                                                                                    value={assignmentsCommentData.find((data)=>data.index===aIndex)?assignmentsCommentData.find((data)=>data.index===aIndex).value:""}
                                                                                    rows="1" className="overflow-hidden w-full p-3 text-gray-600 rounded-xl resize-none border-0 bg-gray-100 focus:ring-0"
                                                                                    onChange={e => {
                                                                                        if(assignmentsCommentData.find((comment)=>comment.index===aIndex)){
                                                                                            let copy = assignmentsCommentData
                                                                                            copy = copy.filter((comment)=>{return comment.index!==aIndex})
                                                                                            let newVal = assignmentsCommentData.find((c)=>c.index===aIndex)
                                                                                            newVal.value = e.target.value
                                                                                            copy.push(newVal)
                                                                                            setAssignmentsCommentData(copy)
                                                                                        }else{
                                                                                            let body = {value:e.target.value,index:aIndex}
                                                                                            setAssignmentsCommentData([...assignmentsCommentData,body])
                                                                                        }
                                                                                    }}
                                                                        />
                                                                        <BiSend size={32} className="mt-2 mr-2 cursor-pointer text-gray-700" 
                                                                            onClick={()=>
                                                                                createAssignmentFeedback(attachment,aIndex)
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    </div>
                                                    {selectedSessions.feedback && selectedSessions.feedback.length>0 && selectedSessions.feedback.filter(c=> c.attachmentId===attachment.Id).map((d)=>{return feedbackReplyCard(d,aIndex)})}
                                                </div>
                                            </div>
                                                {/* {selectedSessions.feedback && selectedSessions.feedback.length>0  && selectedSessions.feedback.filter(c=> c.attachmentId===attachment.Id).slice(0,minChat.find((data)=>data.index===index)?minChat.find((data)=>data.index===index).count-1:minChatNumber)
                                                    .map((d)=>{return feedbackReplyCard(d,index)})} */}
                                                
                                                {/* {showMoreOrNot(pIndex,pComment)}  */}
                                            </div> 
                                        </div>        
                                    )
                                })}
                            </>
                        }
                    </>
                }
            </div>
        )
    }


    const commonAssignmentUi=(attachment)=>{
        return(
            <div
            className={attachment.Id===focusableItem?"max-w-sm no-underline border-2 border-orange-500 rounded-xl shadow-md overflow-hidden  mt-2 mb-2 p-5 text-gray-700":"max-w-sm no-underline border-l-8 border-blue-500 rounded-xl shadow-md overflow-hidden  mt-2 mb-2 p-5 text-gray-700"}
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
                {attachment.Attachment_Type__c ===
                    "VIDEO" && (
                    <FaYoutube
                        className="inline cursor-pointer ml-2  text-fill text-gray-700"
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
                        className="inline cursor-pointer ml-2  text-fill text-gray-700"
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
                        className="inline cursor-pointer ml-2 text-fill text-gray-700"
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
        )
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
                console.log("Invalid file: please select a valid file.");
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

    const createAttachment = (attachment) => {
        firebase
        .auth()
        .currentUser.getIdToken(false)
        .then(function (idToken) {
            httpsPOST(
                { idToken, uid: auth.uid},
                `${API_POST_CREATE_SESSION_ATTACHMENT}${selectedSessions.session.Id}`,
                attachment
            ).then((data) => {
                if (data && data.error) {
                    if(data.techMsg.name==="STRING_TOO_LONG"){
                        toast.error("Max 80 characters are allowed in Title")
                    }
                    
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

                    let stateDetails={
                        NotificationType:"notesUploaded",
                        attachmentId:attachment.Id,
                        sessionId:selectedSessions.session.Id,
                        moduleId:selectedSessions.session.CE_Module__c,
                        activeTab:3
                    }
    
                    if(attachment.Attachment_Type__c==="ASSESSMENT"){
                        let moduleCopy = modules
                        stateDetails.NotificationType="assignmentUploaded"

                        if(moduleCopy[index.moduleIndex].sessions[index.sessionIndex].attachmentsByMentee===null){
                            moduleCopy[index.moduleIndex].sessions[index.sessionIndex].attachmentsByMentee = [attachment];
                        }else{
                            moduleCopy[index.moduleIndex].sessions[index.sessionIndex].attachmentsByMentee.push(attachment)
                        }

                        setModules(moduleCopy)
                        if(studentsEnrolled.length>0){
                            let mentorData = [studentsEnrolled.find((user)=>user.Contact__r.Registered_By__c==="Mentor")]
                            sendNotificationtoAll({sessionId:selectedSessions.session.Id,menteeName:profile.firstName+" "+profile.lastName,notesTitle:attachment.Name,sessionTitle:selectedSessions.session.Session_Title__c,senderProfile:senderProfile,stateDetails:stateDetails},mentorData,"assignmentUploaded")
                        }
                    }else{
                        stateDetails.NotificationType="notesUploaded"
                        sendNotificationtoAll({sessionId:selectedSessions.session.Id,mentorName:profile.firstName+" "+profile.lastName,notesTitle:attachment.Name,sessionTitle:selectedSessions.session.Session_Title__c,senderProfile:senderProfile,stateDetails:stateDetails},userList,"notesUploaded")
                        let moduleCopy = modules
                        if(moduleCopy[index.moduleIndex].sessions[index.sessionIndex].attachmentsByMentor===null){
                            moduleCopy[index.moduleIndex].sessions[index.sessionIndex].attachmentsByMentor = [attachment];
                        }else{
                            moduleCopy[index.moduleIndex].sessions[index.sessionIndex].attachmentsByMentor.push(attachment)
                        }
                        setModules(moduleCopy)      
                    }
                    setProgress(0);
                    setShowUploadProgress(false);
                    resetState();
                    toast.success("Attachments uploaded")
                }
            });
        });
    }


    const resetState = () => {
        setShowDeleteAlert(false);
        setUploadAssignmentModal(false);
        setNotes({ ...notes, name: "", fileType: "FILE", youtubeId: "" });
    };



    const createAssignmentContent =()=>{
        return(

            <div className="md:min-w-screen md:h-screen animated fadeIn faster  fixed  left-0 top-0 flex justify-center items-center inset-0 z-50 outline-none focus:outline-none bg-no-repeat bg-center bg-cover p-12"  id="modal-id">
                <div className="absolute bg-black opacity-90 inset-0 z-0"></div>
                <div className="md:w-full  md:max-w-lg py-5 md:px-10 relative mx-auto my-auto rounded-xl shadow-lg p-5 bg-white">
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
                                                    
                                                    <div class="md:flex flex-auto max-h-48 w-2/5 mx-auto md:-mt-10 hidden">
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
                                        {fileName && fileName.length>0?
                                         <span className="text-gray-700">{fileName}</span>:
                                         <span>File type: doc,pdf,types of images</span>
                                    }
                                       
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

    const fetchDiscussions =(session,i,j)=>{
        console.log("Fetchdiscussions",session)
        let comments = []
        if(!session.comments){
            firebase.firestore().collection("sessionscomment").where("sessionId","==",session.session.Id).get().then((snapshot)=>{
                if(!snapshot.empty){
                    snapshot.forEach((doc)=>{
                        let body = doc.data()
                        body.id = doc.id
                        comments.push(body)
                    })
                    comments = comments && comments.slice().sort((a,b)=>{return a.createdDate.seconds - b.createdDate.seconds})
                }
                let moduleCopy = modules
                moduleCopy[i].sessions[j].comments = comments
                setModules(moduleCopy)
                setIndex({moduleIndex:i,sessionIndex:j})
                session.comments = comments
                setSelectedSessions(session)
                console.log("commentsFetched",comments)
                setShowLoader(false)
            })
        }else{
            setIndex({moduleIndex:i,sessionIndex:j})
            setSelectedSessions(session)
        }
    }

    const fetchAssignmentFeedback =(session,i,j)=>{
        console.log("FeedbackfetchedRequest",session)
        let feedback = []
        if(!session.feedback){
            firebase.firestore().collection("AttachmentFeedback").where("sessionId","==",session.session.Id).get().then((snapshot)=>{
                if(!snapshot.empty){
                    snapshot.forEach((doc)=>{
                        let body = doc.data()
                        body.id = doc.id
                        feedback.push(body)
                    })
                    feedback = feedback && feedback.slice().sort((a,b)=>{return a.createdDate.seconds - b.createdDate.seconds})
                }
                let moduleCopy = modules
                moduleCopy[i].sessions[j].feedback = feedback
                setModules(moduleCopy)
                setIndex({moduleIndex:i,sessionIndex:j})
                session.feedback = feedback
                setSelectedSessions(session)
                console.log("Feedbackfetched",feedback)
                setShowLoader(false)
            })
        }else{
            setIndex({moduleIndex:i,sessionIndex:j})
            setSelectedSessions(session)
        }
    }

    const createComment =(parentId,parenDetail,pIndex)=>{

        let userIdList = []
        let listOfParticipants = [];
        let uniqueParticipantsId = [];
        let stateDetails;  

        let parentBody = {
            mentorFbId:profile.userType==="instructor"?auth.uid:userList.find((user)=>user.Contact__r.Registered_By__c==="Mentor").Contact__r.Firebase_Id__c,
            createdDate:new Date(),
            from:firebase.auth().currentUser.uid,
            sessionId:selectedSessions.session.Id
        }

        stateDetails={
            sessionId:selectedSessions.session.Id,
            moduleId:selectedSessions.session.CE_Module__c,
            activeTab:2
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

                let moduleCopy = modules;
                parentBody.id = doc.id
                stateDetails.commentId = doc.id
                console.log("New Parent Body",parentBody)
                moduleCopy[index.moduleIndex].sessions[index.sessionIndex].comments.push(parentBody)
                setModules(moduleCopy)

                if(parentId===null){
                    let senderProfile={
                        uid:auth.uid,
                        profilePic:profile.picURL?profile.picURL:"",
                        Name:profile.firstName+" "+profile.lastName
                    }
                   
                    if(profile.userType==="instructor"){
                        stateDetails.NotificationType = "commentCreatedByMentor"
                        sendNotificationtoAll({sessionId:selectedSessions.session.Id,mentorName:profile.firstName+" "+profile.lastName,sessionTitle:selectedSessions.session.Session_Title__c,senderProfile:senderProfile,stateDetails:stateDetails},userList,"commentCreatedByMentor")
                    }else{
                        stateDetails.NotificationType = "commentCreatedByMentee"
                        let detailOfMentor = [userList.find((user)=>user.Contact__r.Registered_By__c==="Mentor")]
                        sendNotificationtoAll({sessionId:selectedSessions.session.Id,mentorName:profile.firstName+" "+profile.lastName,sessionTitle:selectedSessions.session.Session_Title__c,senderProfile:senderProfile,stateDetails:stateDetails},detailOfMentor,"commentCreatedByMentee")
                    } 
                    
                }else{

                    parentData.tagToProfile = userList.filter((user)=>{
                        return userIdList.includes(user.Contact__r.Firebase_Id__c) && user.Contact__r
                    })

                    console.log("Tagger to ",parentData.tagToProfile)

                    debugger;
                    selectedSessions && selectedSessions.comments.filter(c=> c.pId===parentId).forEach((c)=>{
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
                    stateDetails.NotificationType="replyAlert"

                    let dataToSend = {
                        sessionId:selectedSessions.session.Id,
                        ownerDetails: ownerDetails,
                        tagToList:parentData.tagToProfile,
                        senderName:profile.firstName+" "+profile.lastName,
                        participants:listOfParticipants,
                        senderProfile:{
                            uid:auth.uid,
                            profilePic:profile.picURL?profile.picURL:"",
                            Name:profile.firstName+" "+profile.lastName
                        },
                        stateDetails:stateDetails
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

    const createAssignmentFeedback=(attachments,aIndex) => {

        
        let body = {
            sessionId:selectedSessions.session.Id,
            attachmentId:attachments.Id,
            msg : assignmentsCommentData.find((data)=>data.index===aIndex).value,
            createdDate:new Date(),
            from:profile.sfid
        }

        let senderProfile = {
            uid:auth.uid,
            profilePic:profile.picURL?profile.picURL:"",
            Name:profile.firstName+" "+profile.lastName
        }

        let recieverData = [attachments.Uploaded_By__c===profile.sfid?studentsEnrolled.find((user)=>user.Contact__r.Registered_By__c==="Mentor")
                    :userList.find((user)=>user.Contact__r.Id===attachments.Uploaded_By__c)]
      
        
        let stateDetails={
            NotificationType:"assignmentFeedbackUploaded",
            attachmentId:attachments.Id,
            sessionId:selectedSessions.session.Id,
            moduleId:selectedSessions.session.CE_Module__c,
            activeTab:4
        }

        firebase.firestore().collection("AttachmentFeedback").add(body).then((doc)=>{
            console.log("result",)
            let copy = assignmentsCommentData
            copy = copy.filter((comment)=>{return comment.index!==aIndex})
            let moduleCopy = modules;
            body.id = doc.id

            stateDetails.commentId = doc.id
            
            sendNotificationtoAll({sessionId:selectedSessions.session.Id,menteeName:profile.firstName+" "+profile.lastName,notesTitle:attachments.Name,sessionTitle:selectedSessions.session.Session_Title__c,senderProfile:senderProfile,stateDetails:stateDetails},recieverData,"assignmentFeedbackUploaded")
            
            moduleCopy[index.moduleIndex].sessions[index.sessionIndex].feedback.push(body)
            let selectedSessionsCopy = selectedSessions
            selectedSessionsCopy.feedback = moduleCopy[index.moduleIndex].sessions[index.sessionIndex].feedback
            setSelectedSessions(selectedSessionsCopy)
            setAssignmentsCommentData(copy)
            setModules(moduleCopy)
        })
    }

    const handleModalEvent = (type,action)=> {
        console.log("Type ",type, "Action ",action,"EVENT ",selectedEvent)
        
        let moduleCopy = modules;
        let commentsList = moduleCopy[index.moduleIndex].sessions[index.sessionIndex].comments
    
        if(type==="CLOSE"){
            setShowDeleteAlert(false)
        }else if(type==="DELETE" && action==="DISCUSSIONDELETE"){
            if(selectedEvent.pId){
                firebase.firestore().collection("sessionscomment").doc(selectedEvent.id).delete().then((res)=>{
                    commentsList = commentsList.filter((comment)=>{return(comment.id!==selectedEvent.id)})
                    moduleCopy[index.moduleIndex].sessions[index.sessionIndex].comments  = commentsList
                    setModules(moduleCopy)

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
                        commentsList = commentsList.filter((comment)=>{return(comment.pId!==selectedEvent.id)})
                        moduleCopy[index.moduleIndex].sessions[index.sessionIndex].comments  = commentsList
                        setModules(moduleCopy)
                    }  
                }).catch((error)=>{
                    toast.error("Comment can't be deleted")
                    console.log(error)
                })
                firebase.firestore().collection("sessionscomment").doc(selectedEvent.id).delete().then((res)=>{
                    commentsList = commentsList.filter((comment)=>{return(comment.id!==selectedEvent.id)})
                    moduleCopy[index.moduleIndex].sessions[index.sessionIndex].comments  = commentsList
                    setModules(moduleCopy)

                    toast.success("Comment deleted")
                }).catch((err)=>{
                    toast.error(err)
                }).finally(()=>{
                    setShowDeleteAlert(false)
                })
            }
        }
        else if(type==="DELETE" && (action==="ASSIGNMENTDELETE" || action==="NOTEDELETE")) {
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
                            let moduleCopy = modules
                            let attachmentsList = moduleCopy[index.moduleIndex].sessions[index.sessionIndex].attachmentsByMentee ;
                            moduleCopy[index.moduleIndex].sessions[index.sessionIndex].attachmentsByMentee = attachmentsList.filter((attachment) => attachment.Id!==selectedEvent)
                            setModules(moduleCopy)
                        }else{
                            let moduleCopy = modules
                            let attachmentsList = moduleCopy[index.moduleIndex].sessions[index.sessionIndex].attachmentsByMentor;
                            moduleCopy[index.moduleIndex].sessions[index.sessionIndex].attachmentsByMentor = attachmentsList.filter((attachment) => attachment.Id!==selectedEvent)
                            setModules(moduleCopy)
                        }
                        toast.success("Successfully deleted")
                    }
                }).finally(()=>{
                    setShowDeleteAlert(false)
                }); 
            });
        }else if(type === "DELETE" && action === "FEEDBACKDELETE"){
            let feedbackList = moduleCopy[index.moduleIndex].sessions[index.sessionIndex].feedback
            firebase.firestore().collection("AttachmentFeedback").doc(selectedEvent.id).delete().then((res)=>{
                feedbackList = feedbackList.filter((comment)=>{return(comment.id!==selectedEvent.id)})
                moduleCopy[index.moduleIndex].sessions[index.sessionIndex].feedback  = feedbackList
                setModules(moduleCopy)

                toast.success("Comment deleted")
            }).catch((err)=>{
                toast.error(err)
            }).finally(()=>{
                setShowDeleteAlert(false)
            })
        }
    }

    const leftRightHandler = (type)=>{
        let counter = handlerCount;
        let reader=0;
        
        if(type==="prev" && counter>1){
            counter--;
        }else if(type==="next"){
            counter++;
        }                

        modules.forEach((cModule,mIndex)=>{
            if(cModule.sessions && cModule.sessions.length>0){
                cModule.sessions.forEach((cSession,sIndex)=>{
                    debugger;
                    if(cSession.attachmentsByMentor===null ||cSession.attachmentsByMentor.length===0){
                        
                        reader++
                        debugger;
                        if(reader===counter){
                            debugger;
                            if(cSession.comments){
                                setSelectedSessions(cSession)
                                setIndex({moduleIndex:mIndex,sessionIndex:sIndex})
                            }else{
                                setShowLoader(true)
                                fetchDiscussions(cSession,mIndex,sIndex)
                            }

                            if(!cSession.feedback){
                                fetchAssignmentFeedback(cSession,mIndex,sIndex)
                            }

                            setSelectedNotes({})
                            setHandlerCount(counter);

                            if(!cModule.open){
                                handleExpand(mIndex)
                            }
                            
                        }
                    }else if(cSession.attachmentsByMentor.length>0){
                        cSession.attachmentsByMentor.forEach((cNotes,cIndex)=>{
                            
                            reader++
                            debugger;
                            if(reader===counter){
                                debugger;
                                if(cSession.comments){
                                    setSelectedSessions(cSession)
                                    setIndex({moduleIndex:mIndex,sessionIndex:sIndex})
                                }else{
                                    setShowLoader(true)
                                    fetchDiscussions(cSession,mIndex,sIndex)
                                }

                                if(!cSession.feedback){
                                    fetchAssignmentFeedback(cSession,mIndex,sIndex)
                                }
                                
                                setSelectedNotes(cNotes)
                                setHandlerCount(counter);
                                if(!cModule.open){
                                    handleExpand(mIndex)
                                }
                                console.log("Your Data at index at ",counter, ": selectedSession ",cSession," and notes ",cNotes)
                            }
                        })
                    }
                })
            }
        })

        console.log("Counter ",counter,"Reader",reader)
    }

    const handleSessionComplete=(mIndex,sIndex)=>{
        debugger;
        let copyModules = [...modules]; 
        if(copyModules[mIndex].sessions[sIndex].status ){
            setShowProgress(true);

            let body = copyModules[mIndex].sessions[sIndex].status 

            if(body.Status__c){
                body.Status__c = body.Status__c==="Completed"?"Pending":"Completed";
            }else{
                body.Status__c = "Completed"; 
            }
            
            firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                menteePOST(
                    { idToken, uid: auth.uid },
                    `${API_POST_MARK_SESSION_STATUS}`,
                    body
                ).then((response) => {
                    setShowProgress(false);
                    console.log(response);
                    if (response && response.error) {
                        console.log(response.techMsg);
                    } else {
                        if( body.Status__c ==="Completed"){
                            setCompletedSession(completedSession+1)
                        }else{
                            setCompletedSession(completedSession-1)
                        }
                        debugger;
                        copyModules[mIndex].sessions[sIndex].status = body 
                        setModules(copyModules);
                    }
                });
              
            }).catch(()=>{
                setShowProgress(false);
            })
        }else{
            toast.error("Course Update id not found")
        }
    }
    
    const markSessionAsCompleteForMentor = ()=>{

        setShowLoader(true);
        setShowProgress(true)
        let eventToUpdate = [
            { Id: selectedSessions.session.Id, Status__c: "COMPLETED" },
        ];

        firebase.auth().currentUser.getIdToken(false).then(function(idToken){
            httpsPOST(
                { idToken, uid: auth.uid},
                `${API_POST_UPDATE_SESSIONS}${modules[0].moduleRec.Course_Enrollment__c}`,
                eventToUpdate
            ).then((response) => {
                console.log(response)
                setShowProgress(false)
                if (response && response.error) {
                    console.log(response.techMsg);
                    setShowLoader(false)
                }else{

                    // let sessionCopy = selectedSessions;
                    // sessionCopy.session.Status__c="COMPLETED";
                    // setSelectedSessions(sessionCopy)

                    let moduleCopy = modules;
                    moduleCopy[index.moduleIndex].sessions[index.sessionIndex].session.Status__c="COMPLETED"
                    setModules(moduleCopy)
                    setShowLoader(false)
                    toast("Session completed")
                }

            }).catch((error)=>{
                setShowProgress(false);
            })
        })
    }

    const handleInput = (e) => {
        setScheduleSessions({...scheduleSessions,[e.target.id]:e.target.value})
    };

    const yesterday = moment().subtract(1, "day");
    const valid=(current)=>{
        return current.isAfter(yesterday);
    }
    const handleDateChange = (moment, name) => {
        try {
            let modalEvent = { ...scheduleSessions};
            modalEvent[name] = moment.toDate();
            setScheduleSessions(modalEvent)
        } catch (error) {
            console.log(error)
        }
    };

    const rescheduleEventHandle=(type)=>{
        if(type==="CLOSE"){
            setShowReschedule(false)
        }else{

            const body = {
                Id:scheduleSessions.Id,
                Session_Title__c:scheduleSessions.Session_Title__c,
                Start_DateTime__c:scheduleSessions.Start_DateTime__c,
                End_DateTime__c:scheduleSessions.End_DateTime__c,
                Meeting_Link__c: scheduleSessions.Meeting_Link__c,
                Status__c:"SCHEDULED"
            }

            let stateDetails={
                NotificationType:"sessionRescheduledForSessionComponent",
                sessionId:selectedSessions.session.Id,
                moduleId:selectedSessions.session.CE_Module__c,
                activeTab:1
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
                    console.log("BODYDATA",body)
                    console.log(response);
                    let senderProfile={
                        uid:auth.uid,
                        profilePic:profile.picURL?profile.picURL:"",
                        Name:profile.firstName+" "+profile.lastName
                    }
                    sendNotificationtoAll({sessionId:scheduleSessions.Id,title:scheduleSessions.Session_Title__c,time:moment(scheduleSessions.Start_DateTime__c).calendar(),meetingLink:scheduleSessions.Meeting_Link__c,senderProfile:senderProfile,stateDetails:stateDetails},userList,"sessionRescheduledForSessionComponent")
                    if (response && response.error) {
                        console.log(response.techMsg);
                        toast.error(response.error)
                    } else {
                        let sessionCopy = selectedSessions;
                        sessionCopy.session.Session_Title__c = body.Session_Title__c;
                        sessionCopy.session.Start_DateTime__c = body.Start_DateTime__c;
                        sessionCopy.session.End_DateTime__c = body.End_DateTime__c;
                        sessionCopy.session.Meeting_Link__c = body.Meeting_Link__c;
                        sessionCopy.session.Status__c = body.Status__c;

                        setSelectedSessions(sessionCopy)
                        console.log(response);
                        setShowReschedule(false)
                        toast.success("Session updated.")
                    }
                });
            });
        }
    }

    const sessionModalUi=()=>{
        return (
            showReschedule && (
                <div class="grid gap-8 grid-cols-1">
                    <div class="flex flex-col ">
                        <div class="flex flex-col sm:flex-row items-center">
                            <h2 class="font-semibold text-lg mr-auto">
                                Update Session
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
                                        id="Session_Title__c"
                                        onChange={handleInput}
                                        value={scheduleSessions.Session_Title__c}
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
                                                    "Start_DateTime__c"
                                                )
                                            }
                                            isValidDate={valid}
                                            value={moment(scheduleSessions.Start_DateTime__c)}
                                        />
                                        {/* {this.state.errorModalEvent.errorStart?<p className="text-red-500">Choose Start Date</p>:null} */}
                                    </div>
                                    <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 py-2">
                                            Session to
                                        </label>
                                        <Datetime
                                            id="End_DateTime__c"
                                            isValidDate={valid}
                                            onChange={(moment) =>
                                                handleDateChange(moment, "End_DateTime__c")
                                            }
                                            value={moment(scheduleSessions.End_DateTime__c)}
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
                                            id="Meeting_Link__c"
                                            onChange={handleInput}
                                            value={scheduleSessions.Meeting_Link__c}
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


    return(
        <>
            <Base history={history}>
             
           
            <div className="grid md:grid-cols-8 sm:grid-cols-1" style={{backgroundColor:"#f3f2ef"}}>
                    <div className="md:col-span-6 col-span-1 h-screen" style={{scrollbarWidth:'none',msOverflowStyle:'none'}} id="course-content">
                    {showLoader?
                        <div className="flex items-center justify-center h-3/6">
                            <LoaderLarge type="ThreeDots" />
                        </div>:
                        <>
                        {showProgress &&
                            <div className="flex h-screen bg-gray-200 w-full justify-center items-center z-10 top-0 repeat">
                                <LoaderLarge type="ThreeDots" />
                            </div>
                        } 
                            {selectedNotes && selectedNotes.Id?
                                <>
                                    {selectedNotes.File_Type__c==="FILE"?
                                        <div className="relative">
                                            <iframe  src={selectedNotes.FILE_URL__c} title={selectedNotes.Name} className="w-full" height="800"  onLoad={console.log("onLoaded",Date.now())}>
                                                </iframe>
                                                <div className="z-10 absolute top-0 h-full  p-5">
                                                    <div className="flex flex-col justify-center items-center h-full">
                                                        <BsChevronLeft size={52} className="cursor-pointer bg-gray-500 p-3 rounded-full text-white bg-opacity-25 hover:bg-opacity-100" onClick={()=>leftRightHandler("prev")}/>
                                                    </div>
                                                </div>

                                                <div className="z-10 absolute right-0 top-0 h-full">
                                                    <div className="flex flex-col justify-center items-center h-full">
                                                        <BsChevronRight size={52} className="cursor-pointer bg-gray-500 p-3 rounded-full text-white mr-5 bg-opacity-25 hover:bg-opacity-100" onClick={()=>leftRightHandler("next")}/>
                                                    </div>
                                                </div>
                                        </div>

                                        : 
                                        <div class="relative">
                                                <YouTubeHelper videoId={selectedNotes.Video_Id__c} />
                                            <div className="z-10 absolute top-0 h-full  p-5">
                                                    <div className="flex flex-col justify-center items-center h-full">
                                                        <BsChevronLeft size={52} className="cursor-pointer bg-gray-500 p-3 rounded-full text-white bg-opacity-25 hover:bg-opacity-100" onClick={()=>leftRightHandler("prev")}/>
                                                    </div>
                                                </div>

                                                <div className="z-10 absolute right-0 top-0 h-full">
                                                    <div className="flex flex-col justify-center items-center h-full">
                                                        <BsChevronRight size={52} className="cursor-pointer bg-gray-500 p-3 rounded-full text-white mr-5 bg-opacity-25 hover:bg-opacity-100" onClick={()=>leftRightHandler("next")}/>
                                                    </div>
                                                </div>
                                        </div>  
                                    } 
                                </>:
                                <div class="flex flex-col justify-center h-3/5">
                                    {console.log("NoteSelectedxxxxxxxxxxNot",selectedNotes)}
                                    <div className="flex flex-row justify-between">
                                        <div className="flex flex-col justify-center items-center">
                                            <BsChevronLeft size={52} className="cursor-pointer bg-gray-500 p-3 rounded-full text-white bg-opacity-25 hover:bg-opacity-100 ml-5" onClick={()=>leftRightHandler("prev")}/>
                                        </div>
                                        <h1  className=" text-center ">File not found</h1>
                                        <div className="flex flex-col justify-center items-center">
                                            <BsChevronRight size={52} className="cursor-pointer bg-gray-500 p-3 rounded-full text-white mr-5 bg-opacity-25 hover:bg-opacity-100 " onClick={()=>leftRightHandler("next")}/>
                                        </div>
                                    </div>
                                </div>   
                            }
                            </>
                    }
                      
                      
                      <div className="flex flex-col p-3">
                            <div className="border-b border-gray-400 flex md:flex-row flex-col w-full justify-between">
                                <div className="flex flex-row">
                                    <div className={selectedOptions === 1?"text-black p-3 border-b-2 border-black":"cursor-pointer text-gray-700 p-3 hover:text-black"} onClick={()=>setSelectedOptions(1)}>
                                        Overview
                                    </div>
                                    <div className={selectedOptions === 2?"text-black p-3 border-b-2 border-black":"cursor-pointer text-gray-700 p-3 hover:text-black"} onClick={()=>setSelectedOptions(2)}>
                                        Q&A
                                    </div>
                                    <div className={selectedOptions === 3?"text-black p-3 border-b-2 border-black":"cursor-pointer text-gray-700 p-3 hover:text-black"} onClick={()=>setSelectedOptions(3)}>
                                        Notes
                                    </div>
                                    <div className={selectedOptions === 4?"text-black p-3 border-b-2 border-black":"cursor-pointer text-gray-700 p-3 hover:text-black"} onClick={()=>setSelectedOptions(4)}>
                                        Assignments
                                    </div>
                                </div>
                                {
                                    modules && modules.length>0 && profile.userType==="student" && 
                                    <div className="">
                                        
                                        <button className={modules[index.moduleIndex].sessions[index.sessionIndex].status 
                                        && modules[index.moduleIndex].sessions[index.sessionIndex].status.Status__c 
                                        && modules[index.moduleIndex].sessions[index.sessionIndex].status.Status__c==="Completed"?"bg-blue-600 text-white px-3 py-1 m-1":"bg-orange-500 text-white px-3 py-1 m-1 hover:bg-orange-600 cursor-pointer"} 
                                        onClick={()=>handleSessionComplete(index.moduleIndex,index.sessionIndex)}>{modules[index.moduleIndex].sessions[index.sessionIndex].status 
                                            && modules[index.moduleIndex].sessions[index.sessionIndex].status.Status__c 
                                            && modules[index.moduleIndex].sessions[index.sessionIndex].status.Status__c==="Completed"?"Completed":"Mark as complete"}</button>
                                    </div>

                                }

                                {/* ------------------- Instructors Functions ---------------  */}
                            
                                {profile.userType==="instructor" &&
                                    <div className="px-5 flex flex-row justify-between mb-2 md:py-0 py-2">
                                        {modules && modules[index.moduleIndex] && 
                                            modules[index.moduleIndex].sessions[index.sessionIndex].session.Status__c==="SCHEDULED" &&
                                                <button className="bg-blue-600 text-white px-3 rounded-md text-sm mr-3 md:py-0 py-2"
                                                    onClick={()=>{
                                                            setShowReschedule(true);
                                                            setScheduleSessions(selectedSessions.session)
                                                        }
                                                    }
                                                >   Reschedule session
                                                </button>
                                        }

                                        {modules && modules[index.moduleIndex] && 
                                            modules[index.moduleIndex].sessions[index.sessionIndex].session.Status__c==="CREATED" &&
                                                <button className="bg-blue-600 text-white px-3 rounded-md text-sm mr-3 md:py-0 py-2"
                                                    onClick={()=>{
                                                            setShowReschedule(true);
                                                            setScheduleSessions(selectedSessions.session)
                                                        }
                                                    }
                                                >   Schedules session
                                                </button>
                                        }

                                        {modules && modules[index.moduleIndex] 
                                            && profile.userType==="instructor" 
                                            && modules[index.moduleIndex].sessions[index.sessionIndex].session.Status__c==="SCHEDULED"
                                            && <button className="cursor-pointer bg-blue-600 text-white px-3 rounded-md text-sm md:py-0 py-2"
                                                    onClick={()=>{
                                                        if(modules[index.moduleIndex].sessions[index.sessionIndex].session.Status__c==="SCHEDULED"){
                                                            markSessionAsCompleteForMentor();
                                                        }
                                                    }}
                                                >
                                                    Complete session
                                                </button>
                                        }


                                        {modules && modules[index.moduleIndex] && 
                                            modules[index.moduleIndex].sessions[index.sessionIndex].session.Status__c==="COMPLETED" &&
                                            <button className="bg-orange-500 text-white px-3 rounded-md text-sm md:py-0 py-2"
                                                onClick={()=>{
                                                    toast("Session is already completed");
                                                }}>
                                                Session completed
                                            </button>
                                        }


                                    </div>
                                }
                              
                                {/* {     profile.userType==="instructor" &&
                                    <div className="px-5 flex flex-row justify-between mb-2">
                                        {modules && modules[index.moduleIndex] && modules[index.moduleIndex].sessions[index.sessionIndex].session.Status__c==="SCHEDULED" 
                                            && profile.userType==="instructor" 
                                            && <button className="bg-blue-600 text-white px-3 rounded-md text-sm mr-3"
                                                onClick={()=>{
                                                        setShowReschedule(true);
                                                        setScheduleSessions(selectedSessions.session)
                                                    }
                                                }
                                                >   Reschedule session
                                                </button>
                                        }

                                        {modules && modules[index.moduleIndex] 
                                            && profile.userType==="instructor" 
                                            && modules[index.moduleIndex].sessions[index.sessionIndex].session.Status__c==="SCHEDULED"
                                            && <button className={modules[index.moduleIndex].sessions[index.sessionIndex].session.Status__c==="SCHEDULED"
                                                    ?"cursor-pointer bg-blue-600 text-white px-3 rounded-md text-sm":"bg-orange-500 text-white px-3 rounded-md text-sm"}
                                                    onClick={()=>{
                                                        if(modules[index.moduleIndex].sessions[index.sessionIndex].session.Status__c==="SCHEDULED"){
                                                            markSessionAsCompleteForMentor();
                                                        }else{
                                                            toast("Session is already completed");
                                                        }
                                                    }}
                                                >{modules[index.moduleIndex].sessions[index.sessionIndex].session.Status__c==="SCHEDULED"?"Complete session":"Session completed"}
                                                </button>
                                        }
                                    </div>
                                } */}
                                
                               
                            </div>
                            {showLoader?
                                <div className="flex items-center justify-center h-3/6">
                                <LoaderLarge type="ThreeDots" />
                            </div>:setScreen()}
                        </div>
                    </div>
                    <div className="col-span-2 flex flex-col  h-full md:block hidden" id="course-plan">
                    <div className="bg-blue-500 p-5 justify-between mx-3 mb-3 mt-3 rounded-lg flex flex-row">
                        <h1 className="text-start text-white ">Course content</h1>
                        {profile.userType==="student" && totalSession>0 && 
                            <CircularProgress percentage={((completedSession*100)/totalSession).toString()}/>
                        }
                    </div>
                    {modules &&
                        modules.map((module,index)=>{

                            return(
                                <div className="bg-blue-500 flex flex-col rounded-lg mb-3 mx-3">
                                <div className="flex flex-col">
                                    <div className="cursor-pointer w-full flex flex-row justify-between bg-blue-500 p-5 rounded-lg" onClick={() => handleExpand(index)}>
                                        <div className="flex flex-row">
                                            <div className="bg-white px-2 rounded-full items-center mr-3 h-7">
                                                <h1 className=" text-gray-600 text-base font-bold mt-1">{index+1}</h1>
                                            </div>
                                            <p className="text-white text-start font-bold">{module.moduleRec.Name}</p>
                                        </div>
                                       
                                        
                                        {module.open?<IoIosArrowUp className="text-white" size={18} />:<IoIosArrowDown className="text-white" size={18} />}
                                        
                                    </div>
                                        {module.open && module.sessions && module.sessions.map((session,sessionIndex) =>{
                                            console.log("SessionsData",session)
                                            return(
                                                <div className={(session.session.Id===selectedSessions.session.Id)?"bg-white text-gray-500 flex flex-col  py-4 hover:border-l-4 hover:border-orange-500 border-l-4 border-orange-500 ":"cursor-pointer bg-white text-gray-500 flex flex-col py-4 hover:border-l-4 hover:border-orange-500"} 
                                                    onClick={()=>{
                                                        debugger;
                                                        setHandlerCount(session.session.handlerIndex)
                                                        if((session.attachmentsByMentor===null)||(session.attachmentsByMentor && session.attachmentsByMentor.length===0)){
                                                            setSelectedNotes({})
                                                        }
                                                        if(session.comments){
                                                            setIndex({moduleIndex:index,sessionIndex:sessionIndex})
                                                            setSelectedSessions(session)
                                                        }else{
                                                            setShowLoader(true)
                                                            fetchDiscussions(session,index,sessionIndex)
                                                        }
                                                        if(!session.feedback){
                                                            fetchAssignmentFeedback(session,index,sessionIndex)
                                                        }
                                                    }}
                                                >
                                                    
                                                    {profile.userType==="student" ?
                                                         <div className="flex flex-row items-center mb-1 mx-5" onClick={()=>handleSessionComplete(index,sessionIndex)}>
                                                            {session.status && session.status.Status__c && session.status.Status__c==="Completed"?
                                                                <div className="bg-orange-500 p-1 rounded-full mr-3">
                                                                    <FaCheck size={9} className="text-white bg-orange-500 font-bold" />
                                                                </div>:
                                                                <BiCircle size={21} className="text-gray-700 mr-3"/>
                                                            }
                                                            <p1 className="text-gray-800">{sessionIndex+1} {session.session.Session_Title__c}</p1>
                                                        </div>:
                                                        <div className="flex flex-row items-center mb-1 mx-5" >
                                                            <p1 className="text-gray-800">{sessionIndex+1} {session.session.Session_Title__c}</p1>
                                                        </div>
                                                    
                                                    }
                                                   
                                                    {session.attachmentsByMentor && session.attachmentsByMentor.length>0?
                                                    <>
                                                        {session.attachmentsByMentor.map((note,dataIndex)=>{
                                                            return(
                                                                <div className={selectedNotes && note.Id === selectedNotes.Id?"flex flex-row items-center bg-gray-300 px-12 py-2 ":"cursor-pointer flex flex-row items-center hover:bg-gray-200 px-12 py-2"} onClick={()=>{
                                                                        if(!session.comments){
                                                                            fetchDiscussions(session,index,sessionIndex)
                                                                        }
                                                                        if(!session.feedback){
                                                                            fetchAssignmentFeedback(session,index,sessionIndex)
                                                                        }
                                                                        console.log("NotesSelected",note)
                                                                        setIndex({moduleIndex:index,sessionIndex:sessionIndex})
                                                                        setSelectedNotes(note)
                                                                        setSelectedSessions(session)
                                                                        setHandlerCount(session.handlerIndex)
                                                                        debugger;
                                                                        }
                                                                    }>
                                                                    
                                                                    {note.File_Type__c==="FILE"?
                                                                        <AiFillFile size={18} />
                                                                        :<RiVideoLine size={18} />    
                                                                }
                                                                    <h1 className="text-base ml-2">{dataIndex+1} {note.Name} </h1>
                                                                </div>
                                                            )
                                                        })}  
                                                    </>:
                                                    <div className={session.session.Id===selectedSessions.session.Id?"flex flex-row items-center bg-gray-300 py-2 px-12":"flex flex-row items-center py-2 px-12 hover:bg-gray-300"} onCLick={()=>{
                                                        if(!session.comments){
                                                            fetchDiscussions(session,index,sessionIndex)
                                                        }
                                                        if(!session.feedback){
                                                            fetchAssignmentFeedback(session,index,sessionIndex)
                                                        }
                                                        setIndex({moduleIndex:index,sessionIndex:sessionIndex})
                                                        setSelectedNotes({})
                                                        setSelectedSessions(session)
                                                        setHandlerCount(session.handlerIndex)
                                                        debugger;
                                                    }}>
                                                        <RiFileForbidLine size={18} />
                                                        <h1 className="text-base ml-2">NA</h1>
                                                    </div>
                                                }
                                                </div>
                                            )
                                        })}
                                </div>                    
                            </div>
                            )
                        })
                    }
                  
                </div>
                {showDeleteAlert && (
                        <DeleteAlert
                            showModal={showDeleteAlert}
                            handleEvent={handleModalEvent}
                            action={action}
                        />
                    )}

                    {uploadAssignmentModal && createAssignmentContent()}
                    {showReschedule && 
                          <CommonDetailModal
                          handleEvent={rescheduleEventHandle}
                          showModal={showReschedule}>
                              {sessionModalUi()}    
                          </CommonDetailModal>
                    }
                </div>
            
            </Base>
        </>
    )
}



const mapDispatchToProps = (dispatch) => {
    return {
        sendNotificationtoAll: (data,menteeList,type) => dispatch(sendBulkNotification(data,menteeList,type)),
        sendReplyNotification: (data) => dispatch(sendReplyNotification(data))
    };
};

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile,
    };
};

export default connect(mapStateToProps,mapDispatchToProps)(LearnSession);