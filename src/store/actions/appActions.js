import moment from "moment"
export const updateMasterCourse = (course, dailyUpdates, mentors, courseMasterList) => {
    return (dispatch, getState) => {
        debugger;
        dispatch({
            type: "COURSE_MASTER_LOADED",
            course: course,
            dailyUpdates: dailyUpdates,
            mentors: mentors,
            courseMasterList: courseMasterList
        });
    };
}

export const updateMyEnrollment = (enrollments) => {
    return (dispatch, getState) => {
        debugger;
        dispatch({
            type: "ENROLLMENTS_LOADED",
            enrollments: enrollments,
        });
    };
};

export const updateMyWishList = (wishList) => {
    return (dispatch, getState) => {
        debugger;
        dispatch({
            type: "WISHLIST_LOADED",
            wishList: wishList,
        });
    };
};

export const updateMyEnrollOnFirebase = (courseEnrollments)=>{

    return (dispatch, getState, { getFirebase }) => {
        
        const firebase = getFirebase();
        firebase
            .firestore()
            .collection("users")
            .doc(getState().firebase.auth.uid)
            .set(courseEnrollments,{merge:true})
            .then(() =>{
                dispatch({ type: "Course_Enrollment_Updated" });
            }).catch(err => {  console.log(err)} );
    };
}

export const messageRecepient = (message) => {
    return (dispatch, getState, { getFirebase, getFirestore }) => {
        const firebase = getFirebase();
        const firestore = getFirestore();
        
        firestore
            .collection("messages")
            .add(message)
            .then((docRef) => {
                console.log("Document created with ID: ", docRef.id);
                dispatch({ type: "MSG_SENT_SUCCESSFULLY" });
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
                dispatch({ type: "ERROR_SENDING_MSG", error });
            });     
    };
}


export const readMessage = (userId, unreadMsgIds) => {
    return (dispatch, getState, { getFirebase }) => {
        debugger;
        const firebase = getFirebase();
        try {
            unreadMsgIds.map((id) => {
                firebase
                    .firestore()
                    .collection("messages")
                    .doc(id)
                    .set({ read: true }, { merge: true });
            });
            dispatch({ type: "MARK_MSG_AS_READ", userId: userId });
        } catch (error) {
            console.error("Error updating message document: ", error);
            dispatch({ type: "MARK_MSG_AS_READ_ERROR" });
        }
    };
};

export  const sendBulkNotification = (data,menteeList,type) => {
    let msg;
    let message;
    let user_type="Mentee";
    let createdDate = new Date();
    let redirectTo = null;

    console.log("DATA received ",data,"Mentee ",menteeList,"Type ",type)

    // let senderProfile = data.senderProfile
    if(type === "sessionCreated"){
        redirectTo=`${data.redirectTo}`
        msg=`${data.title}: Session has been scheduled at ${data.time} <a href="${data.meetingLink}" target="_blank">Click to join</a>`
    }else if(type === "sessionRescheduled"){
        redirectTo=`${data.redirectTo}`
        msg=`${data.title}: Session has been reschedules at ${data.time}, <a href="${data.meetingLink} target="_blank"">Click to join</a>`     
    }else if(type === "sessionCompleted"){
        msg=`${data.title}: Session has been completed`     
    }else if(type === "sessionCancelled"){
        msg=`${data.title}: Session has been cancelled`        
    }else if(type === "sessionDeleted"){
        msg=`${data.title}: Session has been Removed`    
    }else if(type === "notesUploaded"){
        msg=`${data.mentorName}: has uploaded a ${data.notesTitle} notes for ${data.sessionTitle}`  
    }else if(type === "assignmentUploaded"){
        user_type = "Mentor"
        redirectTo=`/learn/${menteeList[0].Id}`
        msg=`${data.menteeName}: has submitted a ${data.notesTitle} assignment on ${data.sessionTitle} `
    }else if(type === "assignmentFeedbackUploaded"){
        user_type = "Mentor"
        redirectTo=`/learn/${menteeList[0].Id}`
        msg=`${data.menteeName}: commented on ${data.notesTitle} assignment from ${data.sessionTitle} `
    }
    else if(type==="commentCreatedByMentor"){
        user_type = "Mentee"
        msg=`${data.mentorName}: opened a new discussion for ${data.sessionTitle}` 
    }else if(type==="commentCreatedByMentee"){
        user_type = "Mentor"
        redirectTo=`/learn/${menteeList[0].Id}`
        msg=`${data.mentorName}: opened a new discussion for ${data.sessionTitle}` 
    }

    return (dispatch, getState, { getFirebase, getFirestore }) => {
        const firestore = getFirestore();
        var batch = firestore.batch()

        menteeList.forEach(mentee =>{

            console.log("MenteeRecord",mentee)
            if(type==="sessionCreated"){
                redirectTo = `/courseschedule/${mentee.Course_Master__c}/${mentee.Id}`
                msg=`${data.title}: Session has been scheduled at ${data.time}, <a href="${data.meetingLink}" className="text-blue-500" target="_blank">Click to join</a>`
            }
            
            else if(type==="sessionRescheduled"){
                redirectTo = `/courseschedule/${mentee.Course_Master__c}/${mentee.Id}`
                msg=`${data.title}: Session has been reschedules at ${data.time}, <a href="${data.meetingLink}" className="text-blue-500" target="_blank">Click to join</a>`
            }
            
            else if(type==="notesUploaded"){
                redirectTo = `/learn/${mentee.Id}`
                msg=`${data.mentorName}: has uploaded a ${data.notesTitle} for ${data.sessionTitle}` 
            }
            
            else if(type==="AssignmentFeedback"){
                redirectTo = `/learn/${mentee.Id}`
                msg=`${data.senderProfile.Name}: replied you on ${data.notesTitle} Assignment` 
            }

            else if(type==="sessionCompleted"){
                redirectTo=`/learn/${mentee.Id}`
                msg=`${data.title}: Session has been completed`      
            }
            
            else if(type==="sessionRescheduledForSessionComponent"){
                redirectTo=`/learn/${mentee.Id}`
                msg=`${data.title}: Session has been reschedules at ${data.time}, <a href="${data.meetingLink}" target="_blank"> Click to join</a>`  
            }
            
            else if(type==="commentCreatedByMentor"){
                redirectTo=`/learn/${mentee.Id}`
                msg=`${data.mentorName}: opened a new discussion for ${data.sessionTitle}`      
            }

            message={
                message:msg,
                read:false,
                user_id:mentee.Contact__r.Firebase_Id__c,
                user_type:user_type,
                createdDate:createdDate,
                senderProfile: data.senderProfile,
                redirectTo:redirectTo
            }
            if(data.stateDetails){
                message.state = data.stateDetails
            }
            batch.set(firestore.collection("notifications").doc(),message);
        })

        batch.commit().then((res)=>{
            console.log("Bulk insert notification ",res)
            dispatch({ type: "MSG_SENT_SUCCESSFULLY" });
        }).catch((error) =>{
            console.error("Error adding document: ", error);
            dispatch({ type: "ERROR_SENDING_MSG", error });
        })
    };
}


export const sendReplyNotification = (data) => {
    let sessionId = data.sessionId
    let owner = data.ownerDetails;
    let tagToList = data.tagToList;
    let participants = data.participants;
    let stateDetails = data.stateDetails;
    
    let taggerMsg;
    let participantsMsg;
    let createdDate = new Date();

    let senderProfile = data.senderProfile

    console.log("DATA received",data)

    return (dispatch, getState, { getFirebase, getFirestore }) => {
        const firestore = getFirestore();
        var batch = firestore.batch()

        if(owner!==null){
            let ownerReceipentMsg = `You got a comment from ${data.senderName}`;
            batch.set(firestore.collection("notifications").doc(),{message:ownerReceipentMsg,read:false,user_id:owner.Contact__r.Firebase_Id__c,
                user_type:owner.Contact__r.Registered_By__c,createdDate:createdDate,senderProfile:senderProfile,redirectTo:`/learn/${owner.Id}`,state:stateDetails})
        }
        
        if(tagToList.length > 0){
            tagToList.forEach((tagTo)=>{
                taggerMsg = `${data.senderName} tag you in a comment`
                batch.set(firestore.collection("notifications").doc(),{message:taggerMsg,read:false,user_id:tagTo.Contact__r.Firebase_Id__c,
                    user_type:tagTo.Contact__r.Registered_By__c,createdDate:createdDate,senderProfile:senderProfile,redirectTo:`/learn/${tagTo.Id}`,state:stateDetails})
            })
        }

        if(participants && participants.length>0){
            participants.forEach((participant)=>{
                participantsMsg = `${data.senderName} commented`
                batch.set(firestore.collection("notifications").doc(),{message:participantsMsg,read:false,user_id:participant.Contact__r.Firebase_Id__c,
                    user_type:participant.Contact__r.Registered_By__c,createdDate:createdDate,senderProfile:senderProfile,redirectTo:`/learn/${participant.Id}`,state:stateDetails})
            })
        }

        batch.commit().then((res)=>{
            console.log("Bulk insert notification ",res)
            dispatch({ type: "MSG_SENT_SUCCESSFULLY" });
        }).catch((error) =>{
            console.error("Error adding document: ", error);
            dispatch({ type: "ERROR_SENDING_MSG", error });
        })   
    }
}