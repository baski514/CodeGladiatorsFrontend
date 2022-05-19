import React, { useState, Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { signOut, markAllReadNotifications} from "../../store/actions/authActions";
import logo from "../../assets/brand.svg";
import NavItem from "./NavItem";
import { firestoreConnect } from "react-redux-firebase";
import { compose } from "redux";
import { HiOutlineBell, HiMenu, HiOutlineX} from "react-icons/hi";
import {IoClose} from 'react-icons/all'
import moment from "moment";
import renderHTML from "react-render-html";
import {firebase} from '../../config/fbConfig'
import Countdown from "react-countdown";
import { toast } from "react-toastify";

const navigation = [
    { name: "My Enrolment", href: "/mycourse" },
    { name: "Wishlist", href: "/mywishlist" },
    { name: "Instructors", href: "/mentors" },
    { name: "Assesment", href:"/testdetails/questions" }
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

const SignedInNavbar = (props) => {

    // const [colorcodeVal,setColorCodeval] = useState(400);
    const timerBgColor = ["bg-yellow-400","bg-yellow-500","bg-yellow-600"]
    const [currentTimerBgIndex,setCurrentTimerBgIndex] = useState(0)
    const [showCurrentTimer,setShowCurrentTimer] = useState(true)

    let {
        authError,
        signOut,
        profile,
        history,
        handleClick,
        activeTabName,
        markAllReadNotifications,
        pathList,
        upcoming_session
    } = props;

    let upcoming_sessionList = [];

    upcoming_session = upcoming_session && upcoming_session.filter((session)=>{
       return session.sessionstarttime >= firebase.firestore.Timestamp.now() && ((session.sessionstarttime.seconds-firebase.firestore.Timestamp.now().seconds)/3600)<=1
    })

    upcoming_session && upcoming_session.slice().sort((a,b)=>{return b.sessionstarttime.seconds - a.sessionstarttime.seconds})

    const markAllComplete =(index)=>{
        if(index!==null){
            let notification = props.notifications.filter((notification) =>!notification.read)[index]
            markAllReadNotifications([notification])
            debugger;
        }else{
            markAllReadNotifications(props.notifications.filter((notification) =>!notification.read))
        }
    }

    const Completionist = () => <span>Session is Live!</span>;

    const renderer = ({ hours, minutes, seconds, completed }) => {
        if (completed) {
          return <Completionist />;
        } else {
          if(minutes<=30 && minutes>15 && currentTimerBgIndex!==1){  
            setCurrentTimerBgIndex(1)
          }else if(minutes <= 15 && currentTimerBgIndex!==2){
            setCurrentTimerBgIndex(2)
            }
           else if(minutes<=60 && minutes>30 && currentTimerBgIndex!==0){
            setCurrentTimerBgIndex(0)
           }   
          return <span className={currentTimerBgIndex>0?"text-purple-800":"text-purple-600"}>{hours}h {minutes}m {seconds}s</span>;
        }
      };

   
    const closeTimerDiv=()=>{
        setShowCurrentTimer(false)
        localStorage.setItem(upcoming_session[0].enrollmentid,true)
    }

    const navbarContent = () => {

        return (
            <>
            {upcoming_session && showCurrentTimer && upcoming_session.length>0 && !localStorage.getItem(upcoming_session[0].enrollmentid) &&
                <div className={`${timerBgColor[currentTimerBgIndex]} flex flex-row items-center`}>
                    <div className= "w-full justify-center p-3">
                        <h1 className={currentTimerBgIndex>0?"text-white text-center text-base":"text-purple-600 text-center text-base"}><a target="_blank" href={upcoming_session[0].meetinglink}>{upcoming_session[0].sessiontitle} Starting in </a></h1>
                        <h1 className="text-gray-600 text-center text-xl font-bold"><Countdown date={Date.now()+((upcoming_session[0].sessionstarttime.seconds-firebase.firestore.Timestamp.now().seconds)*1000)} renderer={renderer}/></h1>
                    </div>
                    <div>
                        <IoClose size={35} className="cursor-pointer text-gray-900 mr-5" onClick={()=>closeTimerDiv()}/>
                    </div>
                </div>
            }
        
            <Disclosure as="nav" className="bg-gray-700">
                {({ open }) => (
                    <>
                        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 ">
                            <div className="relative flex items-center justify-between h-16">
                                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                    {/* Mobile menu button*/}
                                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                        <span className="sr-only">
                                            Open main menu
                                        </span>
                                        {open ? (
                                            <HiOutlineX size={23} />
                                        ) : (
                                            <HiMenu size={23} />
                                        )}
                                    </Disclosure.Button>
                                </div>
                                <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                                    <div className="flex-shrink-0 flex">
                                        <img
                                            className="lg:block h-20 w-auto cursor-pointer"
                                            src={logo}
                                            alt="Workflow"
                                            onClick={() =>{ history.push('/') }}
                                        />
                                    </div>
                                    <div className="hidden sm:ml-6 sm:flex sm:flex-row sm:items-center">
                                        <div className="flex space-x-4">
                                            {navigation.map(
                                                (item, index) => (
                                                    <NavItem
                                                        key={index}
                                                        item={item}
                                                        isActive={
                                                            activeTabName ===
                                                            item.name
                                                        }
                                                        isMobile={false}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                    
                                </div>
                                {true && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                        {/* Notifications dropdown */}
                                            <Menu
                                                as="div"
                                                className="ml-3 relative flex flex-wrap"
                                            >
                                                {({ open }) => (
                                                    <>
                                                        <div>
                                                            <Menu.Button className="flex text-sm rounded-full focus:outline-none">
                                                                <span className="sr-only">
                                                                    Open user
                                                                    menu
                                                                </span>
                                                                <button
                                                                    className="py-4 px-1 relative p-1 rounded-full text-gray-400 hover:text-white focus:outline-none "
                                                                    aria-label="Cart"
                                                                >
                                                                    <HiOutlineBell
                                                                        size={
                                                                            23
                                                                        }
                                                                        className="inline"
                                                                    />
                                                                    {props.notifications && props.notifications.filter((notification) =>!notification.read).length>0?
                                                                          <span className="absolute inset-0 object-right-top -mr-6 top-1.5 right-1.5">
                                                                          <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold leading-4 bg-red-500 text-white">
                                                                              {
                                                                                  props.notifications.filter((notification) =>!notification.read).length
                                                                              }
                                                                          </div>
                                                                      </span>:null    
                                                                }
                                                                </button>
                                                            </Menu.Button>
                                                        </div>
                                                        <Transition
                                                            show={open}
                                                            as={Fragment}
                                                            enter="transition ease-out duration-100"
                                                            enterFrom="transform opacity-0 scale-95"
                                                            enterTo="transform opacity-100 scale-100"
                                                            leave="transition ease-in duration-75"
                                                            leaveFrom="transform opacity-100 scale-100"
                                                            leaveTo="transform opacity-0 scale-95"
                                                        >
                                                            <Menu.Items
                                                                static
                                                                className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1  ring-black ring-opacity-5 focus:outline-none z-10 flex flex-wrap"
                                                            >
                                                                <Menu.Item>
                                                                    {({
                                                                        active,
                                                                    }) => (
                                                                        <div className="p-2 text-start">
                                                                            <p className="font-bold p-2">
                                                                                Your
                                                                                Notifications
                                                                            </p>
                                                                            <hr />
                                                                            <div className="flex flex-col  mt-2">
                                                                                {props.notifications &&
                                                                                    props.notifications.map(
                                                                                        (
                                                                                            notification,
                                                                                            index
                                                                                        ) => {
                                                                                            return (
                                                                                                <>
                                                                                                {!notification.read &&

                                                                                                    // <Link to={`${notification.redirectTo}`} className="cursor-pointer">
                                                                                                    //     <h1>   {
                                                                                                    //         renderHTML(notification.message)
                                                                                                    //     } </h1>
                                                                                                        
                                                                                                    //     </Link>
                                                                                                  <p
                                                                                                  className={
                                                                                                      index +
                                                                                                          1 ===
                                                                                                      props
                                                                                                          .notifications
                                                                                                          .length
                                                                                                          ? "cursor-pointer text-sm text-gray-600 hover:text-black flex-wrap" 
                                                                                                          : "text-sm border-b cursor-pointer text-gray-600 hover:text-black flex-wrap"
                                                                                                  }
                                                                                                  key={
                                                                                                      index
                                                                                                  }

                                                                                                  onClick={()=>{
                                                                                                      debugger;
                                                                                                      console.log("ASASAAAA",notification)
                                                                                                      firebase.firestore().collection("notifications").doc(notification.id).set({read:true},{merge:true})

                                                                                                      props.history.push({pathname:notification.redirectTo,state:notification.state})
                                                                                                    }}
                                                                                              >
                                                                                                  {
                                                                                                      renderHTML(notification.message)
                                                                                                  }
                                                                                              </p>
                                                                                              }
                                                                                                </>
                                                                                              
                                                                                            );
                                                                                        }
                                                                                    )}
                                                                            </div>
                                                                            {props.notifications && props.notifications.filter((not)=>{return !not.read}).length>0?
                                                                                <div className="flex justify-between">
                                                                                <p className="cursor-pointer text-xs pt-2 px-2 text-gray-700" onClick={()=>{markAllComplete(null)}}>
                                                                                    Mark as read
                                                                                </p>
                                                                                <p className="cursor-pointer text-xs pt-2 px-2 text-gray-700" onClick={() => props.history.push('/notifications')}>
                                                                                    View All
                                                                                </p>
                                                                                </div>:
                                                                                       <div className="grid justify-items-center mt-2">
                                                                                       <img src="https://image.flaticon.com/icons/png/512/1057/1057939.png" className="w-10" alt="0 notifications" />
                                                                                       <h2 className="text-xs">notification not found</h2>
                                                                                        <p className="cursor-pointer text-xs py-2 px-2 text-white font-bold rounded-lg bg-purple-500 mt-2" onClick={() => props.history.push('/notifications')}>
                                                                                            View Previous
                                                                                        </p>
                                                                                   </div>
                                                                            }
                                                                        
                                                                        </div>

                                                                    )}
                                                                </Menu.Item>
                                                            </Menu.Items>
                                                        </Transition>
                                                    </>
                                                )}
                                            </Menu>
                                        {/* end */}

                                        {/* Profile dropdown */}
                                        <Menu
                                            as="div"
                                            className="ml-3 relative"
                                        >
                                            {({ open }) => (
                                                <>
                                                    <div>
                                                        <Menu.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                                            <span className="sr-only">
                                                                Open user menu
                                                            </span>
                                                            {profile.picURL ? (
                                                                <img
                                                                    className="h-8 w-8 rounded-full"
                                                                    src={
                                                                        profile.picURL
                                                                    }
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <div className="h-8 w-8 rounded-full content-center text-white bg-purple-500 flex items-center justify-center">
                                                                    <span className="font-bold">
                                                                        {
                                                                            profile.initials
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </Menu.Button>
                                                    </div>
                                                    <Transition
                                                        show={open}
                                                        as={Fragment}
                                                        enter="transition ease-out duration-100"
                                                        enterFrom="transform opacity-0 scale-95"
                                                        enterTo="transform opacity-100 scale-100"
                                                        leave="transition ease-in duration-75"
                                                        leaveFrom="transform opacity-100 scale-100"
                                                        leaveTo="transform opacity-0 scale-95"
                                                    >
                                                        <Menu.Items
                                                            static
                                                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                                                        >
                                                            
                                                            <Menu.Item>
                                                                {({
                                                                    active,
                                                                }) => (
                                                                    <Link
                                                                        to="/myprofile"
                                                                        className={classNames(
                                                                            active
                                                                                ? "bg-gray-100"
                                                                                : "",
                                                                            "block px-4 py-2 text-sm text-gray-700"
                                                                        )}
                                                                    >
                                                                        Your
                                                                        Profile
                                                                    </Link>
                                                                )}
                                                            </Menu.Item>
                                                            <Menu.Item>
                                                                {({
                                                                    active,
                                                                }) => (
                                                                    <Link
                                                                        to="/chats"
                                                                        className={classNames(
                                                                            active
                                                                                ? "bg-gray-100"
                                                                                : "",
                                                                            "block px-4 py-2 text-sm text-gray-700"
                                                                        )}
                                                                    >
                                                                        Messages
                                                                    </Link>
                                                                )}
                                                            </Menu.Item>
                                                               
                                                            <Menu.Item>
                                                                {({
                                                                    active,
                                                                }) => (
                                                                    <Link
                                                                        to="/signin"
                                                                        className={classNames(
                                                                            active
                                                                                ? "bg-gray-100"
                                                                                : "",
                                                                            "block px-4 py-2 text-sm text-gray-700"
                                                                        )}
                                                                        onClick={
                                                                            signOut
                                                                        }
                                                                    >   
                                                                        Sign out
                                                                    </Link>
                                                                )}
                                                            </Menu.Item>
                                                        </Menu.Items>
                                                    </Transition>
                                                </>
                                            )}
                                        </Menu>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Disclosure.Panel className="sm:hidden">
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {navigation.map((item, index) => (
                                    <NavItem
                                        key={index}
                                        item={item}
                                        isActive={activeTabName === item.name}
                                        isMobile={true}
                                    />
                                ))}
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
            </>
        );
    }

    const path = () => {
        const totalPath = pathList ? pathList.length - 1 : 0;
        return (
            pathList && <nav className="text-gray-100 bg-gray-700 py-2 border-t text-sm " aria-label="Breadcrumb">
                <div className="max-w-7xl mx-auto">
                    <div className="-mx-3">
                    <ul className="list-none p-0 inline-flex" style={{ listStyleType: "none !important"}}>
                        {pathList.map((hPath, index) => {
                             
                            return (
                                <li className={`flex items-center ${ index < totalPath ? `hover:underline` : 'cursor-text'}`} key={index}>
                                    {index<totalPath ? <Link to={hPath.to}>{hPath.name}</Link>:hPath.name}
                                    {index < totalPath && <svg
                                        className="fill-current w-3 h-3 mx-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 320 512"
                                    >
                                        <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                                    </svg>}
                                </li>
                            );

                        })}
                    </ul>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <>
            {navbarContent()}
            {/* {path()} */}
        </>
        
    );
};

const mapStateToProps = (state) => {
    return {
        authError: state.auth.authError,
        auth: state.firebase.auth,
        upcoming_session:state.firestore.ordered.upcoming_session,
        notifications: state.firestore.ordered.notifications,
        profile: state.firebase.profile,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        signOut: () => dispatch(signOut()),
        markAllReadNotifications:(notifications)=> dispatch(markAllReadNotifications(notifications)),
    };
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    firestoreConnect((props)=> {
        if(props.profile.enrollments){
            return [
                {
                    collection: "upcoming_session",
                    where: [["enrollmentid", "in", props.profile.enrollments]],
                }
            ]
        }else{
            return []
        }   

       
    }),
    firestoreConnect((props)=> {
        return [
        {
            collection: "notifications",
            where: [["user_id", "==", props.auth.uid], ["read", "==", false]],
            limit: 5,
        },
    ]})
   
)(SignedInNavbar);
