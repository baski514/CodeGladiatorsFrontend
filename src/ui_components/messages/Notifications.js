import React, {useEffect, useState } from "react";
import { connect } from "react-redux";
import { LoaderLarge } from "../ui_utilities/Loaders";
import Base from "../Base";
import moment from "moment";
import { compose } from "redux";
import {firebase} from "../../config/fbConfig"
import { markAllReadNotifications } from "../../store/actions/authActions";
import { firestoreConnect } from "react-redux-firebase";
import renderHTML from "react-render-html";
import { toast } from "react-toastify";

const Notifications = ({
    auth,
    profile,
    history,
    location,
    markAllReadNotifications,
    // notifications
}) => {
    // let noteList = [];
    // var yesterday = firebase.firestore.Timestamp.now();
    // yesterday.seconds = yesterday.seconds - ((24 * 60 * 60)*2);

    // console.log("Yesterday",yesterday.toDate());
    // noteList = []
    // notifications && notifications.forEach((notification,i) =>{
    //     if(notification.createdDate<yesterday){
    //         firebase.firestore().collection("notifications").doc(notification.id).delete()
    //     }else{
    //         noteList.push(notification)
    //     }
    // })
    // noteList = noteList && noteList.slice().sort((a,b)=>{return b.createdDate.seconds - a.createdDate.seconds})

    const [showLoader, setShowLoader] = useState(true);
    const [notificationList,setNotificationList] = useState([])
  

    const markAllComplete =(notificationList)=>{
        markAllReadNotifications(notificationList)
    }

    const getNotifications =()=>{
        firebase.firestore().collection("notifications").where("user_id", "==", auth.uid).get().then((querySnapshot)=>{
            let nList = [];
            
            var yesterday = firebase.firestore.Timestamp.now();
            yesterday.seconds = yesterday.seconds - ((24 * 60 * 60));

            if(querySnapshot.size>0){
                querySnapshot.forEach((doc)=>{
                    if(doc.createdDate<yesterday){
                        firebase.firestore().collection("notifications").doc(doc.id).delete()
                    }else{
                        let body = doc.data()
                        body.id = doc.id
                        nList.push(body)
                    }
                })
                nList = nList && nList.slice().sort((a,b)=>{return b.createdDate.seconds - a.createdDate.seconds})
                
                setNotificationList(nList);
                setShowLoader(false);
            }else{
                setShowLoader(false);
            }  
        })
    }

    useEffect(() => {
        getNotifications()
    },[])
    

    return (
        <Base history={history} activeTabName="My Enrolment" pathList = {[{to:"/",name:"Home"},{to:"/notifications",name:"Notifications"}]}>
            <div className="container mx-auto py-4 md:px-12 px-3">
                <center>
                    <h3>My Notifications</h3>
                </center>
                {showLoader ? (
                    <div className="flex items-center justify-center h-3/6">
                        <LoaderLarge type="ThreeDots" />
                    </div>
                ) : (
                    <div className="rounded-lg bg-white md:max-w-2xl w-full mx-auto md:mt-5">
                    {notificationList && notificationList.length>0 ?
                        notificationList.map((notification, index) => {
                            console.log("Notifications ",notification)
                            return (
                                <>
                                <div className={notification.read===false?"cursor-pointer bg-blue-100 p-3":"bg-white p-3 cursor-pointer"} onClick={()=>{
                                        firebase.firestore().collection("notifications").doc(notification.id).set({read:true},{merge:true})
                                        history.push({pathname:notification.redirectTo,state:notification.state})
                                    }}>
                                <div className="flex flex-row items-center">
                                <div className={!notification.read?"h-2 w-2 bg-blue-700 opacity-75 rounded-full mr-3":"h-2 w-2 bg-blue-700 opacity-0 rounded-full mr-3"}/>
                                    {notification.senderProfile && 
                                        <img src={notification.senderProfile.profilePic.length>0?notification.senderProfile.profilePic:"https://picsum.photos/200"} alt={notification.senderProfile.Name} className="h-16 w-16 rounded-full"/>
                                    }
                                    <div className="w-full flex flex-row ml-2 justify-between items-center">
                                        <h1 className={location.state && location.state.index===index?"text-gray-700 text-base mr-12":"text-gray-700 text-base mr-2"}>{renderHTML(notification.message)}</h1>
                                        <h1 className={location.state && location.state.index===index?"text-gray-700 text-xs text-center":"text-gray-700 text-xs text-center"}>{moment(new Date()).from(moment(notification.createdDate.toDate()),true)}</h1>
                                    </div>
                                </div>
                                
                                </div>
                                <hr className="bg-gray-500 h-0.5 opacity-75"/>
                                {/* <div className="w-full  bg-gray-600 h-0.5"></div> */}
                                </>  
                            );
                        }):
                        <div className="flex flex-col justify-center">
                            <h2 className="text-center">Notification not found</h2>
                        </div>
                    }
                    </div>
                )}
            </div>
        </Base>
    );
};

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile,
        // notifications: state.firestore.ordered.notifications,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        markAllReadNotifications:(notificationList)=> dispatch(markAllReadNotifications(notificationList))
    };
};

export default compose(
    connect(mapStateToProps,mapDispatchToProps)
//     firestoreConnect((props)=> {       
//         return [
//         {
//             collection: "notifications",
//             where: [["user_id", "==", props.auth.uid]]
//         },
//     ]
// })
)(Notifications);
