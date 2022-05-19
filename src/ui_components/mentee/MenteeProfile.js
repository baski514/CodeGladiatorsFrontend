import React, { useState, useEffect } from "react";
import { httpsGET } from "../../backend_api/mentorAPI";
import Base from "../Base";
import { LoaderLarge } from "../ui_utilities/Loaders";
import { API_GET_MENTOR_DETAILS as GET_MENTEE_DETAILS } from "../../backend";
import moment from "moment";
import {firebase} from '../../config/fbConfig';
import { connect } from "react-redux";
import { AiFillFacebook, AiFillLinkedin } from "react-icons/ai";
import { FaPhone } from "react-icons/fa";
import { MdComputer } from "react-icons/md";

const MenteeProfile = ({ history, match, auth }) => {
    const [showLoader, setShowLoader] = useState(false);
    const [menteeDetails, setmenteeDetails] = useState({
        skills: [],
        experience: [],
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        profilePic: "",
        title: "",
        memberSince: "",
        gender:"",
        address:"",
        description:"",
        shortDesc:""
    });

    useEffect(() => {
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsGET({idToken , uid: auth.uid}, `${GET_MENTEE_DETAILS}${match.params.menteeFid}`).then(
                    (data) => {
                        console.log(data);
                        console.log("FB ID",match.params.menteeFid)
                        firebase.firestore().collection("users").doc(match.params.menteeFid).get().then((doc)=>{
                            console.log("FB Data ",doc.data())
                            
                            if (data && data.length > 0) {
                                const mentor = data[0];
                                const mentorProfile = doc.data()
            
                                setmenteeDetails({
                                    ...menteeDetails,
                                    skills: mentor.Key_Skill__r
                                        ? mentor.Key_Skill__r.records
                                        : [],
                                    experience: mentor.Employment_detail__r
                                        ? mentor.Employment_detail__r.records
                                        : [],
                                    firstName: mentor.FirstName ? mentor.FirstName : "",
                                    lastName: mentor.LastName ? mentor.LastName : "",
                                    email: mentor.Email ? mentor.Email : "",
                                    phone: mentorProfile.phone ? mentorProfile.phone : "",
                                    gender:mentorProfile.gender?mentorProfile.gender:"",
                                    profilePic: mentor.Profile_Picture__c
                                        ? mentor.Profile_Picture__c
                                        : "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png",
                                    title: mentor.Title ? mentor.Title : "",
                                    memberSince: mentor.CreatedDate,
                                    address:mentorProfile.location,
                                    description:mentorProfile.description,
                                    shortDesc:mentor.shortDescription?mentor.shortDescription:""
                                });
                            }
                        }).catch((err)=>{
        
                        })
        
                      
                        setShowLoader(false);
                    }
                );
            });
    }, []);

    const menteeDetail = () => {
        return (
            <div className="bg-gray-100">
                <div className="container md:mx-auto md:my-5 md:p-5">
                    <div className="md:flex no-wrap md:-mx-2">
                        <div className=" md:w-3/12 md:mx-2">
                            <div className="bg-white md:p-3 md:border-t-4 md:border-green-400">
                                <div className="image overflow-hidden">
                                    <img
                                        className="md:h-auto md:w-full mx-auto h-28 w-28 mt-5"
                                        src={menteeDetails.profilePic}
                                        alt=""
                                    />
                                </div>
                                <h1 className="text-gray-900 font-bold text-xl leading-8 my-1 md:text-left text-center">
                                    {menteeDetails.firstName +
                                        " " +
                                        menteeDetails.lastName}
                                </h1>
                                <h3 className="text-gray-600 font-lg text-semibold leading-6">
                                    {menteeDetails.shortDesc}
                                </h3>
                                <p className="text-sm text-gray-500 hover:text-gray-600 leading-6">
                                    {menteeDetails.description}
                                </p>
                                <div className="md:bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-2 mt-3 divide-y rounded shadow-sm list-none">
                                    <div className="flex flex-row my-2">
                                        <span>Status</span>
                                            <span className="ml-auto">
                                                <span className="bg-green-600 py-1 px-2 rounded text-white text-sm">
                                                    Active
                                                </span>
                                        </span>
                                    </div>

                                    <div className="flex items-center py-3 text-sm">
                                        <span>Member since</span>
                                        <span className="ml-auto">
                                            {moment(
                                                menteeDetails.memberSince
                                            ).calendar()}
                                        </span>
                                    </div>
                                </div>
                                {/* <ul
                                    className="bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-2 mt-3 divide-y rounded shadow-sm list-none"   
                                >
                                    <li className="flex justify-center py-2">
                                        <span>Status</span>
                                        <span className="ml-auto">
                                            <span className="bg-green-600 py-1 px-2 rounded text-white text-sm">
                                                Active
                                            </span>
                                        </span>
                                    </li>
                                    <li className="flex items-center py-3 text-sm">
                                        <span>Member since</span>
                                        <span className="ml-auto">
                                            {moment(
                                                menteeDetails.memberSince
                                            ).calendar()}
                                        </span>
                                    </li>
                                </ul> */}
                            </div>

                            <div className="my-4"></div>

                        </div>
                        <div className="md:w-9/12 md:mx-2 h-64">
                            <div className="bg-white p-3 shadow-sm rounded-sm">
                                <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8">
                                    <span clas="text-green-500">
                                        <svg
                                            className="h-5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </span>
                                    <span className="tracking-wide">About</span>
                                </div>
                                <div className="text-gray-700">
                                    <div className="grid md:grid-cols-2 text-sm">
                                        <div className="grid grid-cols-2">
                                            <div className="px-4 py-2 font-semibold">
                                                First Name
                                            </div>
                                            <div className="px-4 py-2">
                                                {menteeDetails.firstName}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2">
                                            <div className="px-4 py-2 font-semibold">
                                                Last Name
                                            </div>
                                            <div className="px-4 py-2">
                                                {menteeDetails.lastName}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2">
                                            <div className="px-4 py-2 font-semibold">
                                                Gender
                                            </div>
                                            <div className="px-4 py-2">
                                                {menteeDetails.gender}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2">
                                            <div className="px-4 py-2 font-semibold">
                                                Contact No.
                                            </div>
                                            <div className="px-4 py-2">
                                                {menteeDetails.phone}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2">
                                            <div className="px-4 py-2 font-semibold">
                                                Current Address
                                            </div>
                                            <div className="px-4 py-2">
                                                {menteeDetails.address}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2">
                                            <div className="px-4 py-2 font-semibold">
                                                Permanant Address
                                            </div>
                                            <div className="px-4 py-2">
                                                Arlington Heights, IL, Illinois
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2">
                                            <div className="px-4 py-2 font-semibold">
                                                Email.
                                            </div>
                                            <div className="px-4 py-2">
                                                <a
                                                    className="text-blue-800"
                                                    href={`mailto:${menteeDetails.email}`}
                                                >
                                                    {menteeDetails.email}
                                                </a>
                                            </div>
                                        </div>
                                        {/* <div className="grid grid-cols-2">
                                            <div className="px-4 py-2 font-semibold">
                                                Birthday
                                            </div>
                                            <div className="px-4 py-2">
                                                Feb 06, 1998
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>

                            <div className="my-4"></div>

                            <div className="bg-white p-3 shadow-sm rounded-sm">
                                <div className="grid grid-cols-2">
                                    <div>
                                        <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8 mb-3">
                                            <span clas="text-green-500">
                                                <svg
                                                    className="h-5"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </span>
                                            <span className="tracking-wide">
                                                Key Skills
                                            </span>
                                        </div>
                                        <ul className="list-inside space-y-2">
                                            {menteeDetails &&
                                                menteeDetails.skills &&
                                                menteeDetails.skills.map(
                                                    (skill, index) => {
                                                        return (
                                                            <li key={index}>
                                                                <div className="text-orange-600">
                                                                    {skill.Name}
                                                                </div>
                                                                <div className="text-gray-500 text-xs">
                                                                    {moment(
                                                                        skill.CreatedDate
                                                                    ).calendar()}
                                                                </div>
                                                            </li>
                                                        );
                                                    }
                                                )}
                                        </ul>
                                    </div>
                                    <div>
                                        {/* <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8 mb-3">
                                            <span clas="text-green-500">
                                                <svg
                                                    className="h-5"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        fill="#fff"
                                                        d="M12 14l9-5-9-5-9 5 9 5z"
                                                    />
                                                    <path
                                                        fill="#fff"
                                                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                                                    />
                                                </svg>
                                            </span>
                                            <span className="tracking-wide">
                                                Experience
                                            </span>
                                        </div> */}
                                        <ul className="list-inside space-y-2">
                                            {menteeDetails &&
                                                menteeDetails.experience &&
                                                menteeDetails.experience.map(
                                                    (experience, index) => {
                                                        return (
                                                            <li key={index}>
                                                                <div className="text-orange-600">
                                                                    {
                                                                        experience.Name
                                                                    }
                                                                </div>
                                                                <div className="text-gray-500 text-xs">
                                                                    {experience.Start_Date__c &&
                                                                        experience.End_Date__c &&
                                                                        moment(
                                                                            experience.End_Date__c
                                                                        ).diff(
                                                                            moment(
                                                                                experience.Start_Date__c
                                                                            ),
                                                                            "months",
                                                                            true
                                                                        )}{" "}
                                                                    Months
                                                                </div>
                                                            </li>
                                                        );
                                                    }
                                                )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const capsLatter=(latter)=>{
        return latter.toUpperCase() 
    }

    const skillUi=(mentor)=>{
        debugger;
        return(
            <div class=" overflow-hidden py-3 px-2 m-1 border">
            <div className="w-full h-20"></div>
            <div className="bg-white  rounded-lg cursor-pointer"  
              >
                
                <div class="flex justify-center -mt-10">
                    <MdComputer size={23} className="text-gray-500 rounded-full border-solid -mt-10 h-20 w-20" />
                    {/* <img src={mentor.Profile_Picture__c?mentor.Profile_Picture__c:"https://cdn1.iconfinder.com/data/icons/avatar-97/32/avatar-18-512.png"} className="rounded-full border-solid border-white border-2 -mt-10 h-20 w-20" alt="profile"/>		 */}
                </div>

                <div class="text-center px-3 pb-3 pt-2">
                    <h3 class="group-hover:text-white text-gray-900 text-lg font-bold">{mentor.Name}</h3>
                    <p class="mt-2 text-lg group-hover:text-white text-gray-700 bold h-3 font-bold">{mentor.Current_Company__c?mentor.Current_Company__c:""}</p>
                </div>
                
                <div class="flex justify-center pb-3">
                        <div className="w-full">
                            <div class="text-center text-base">
                                <p className="group-hover:text-white text-gray-600">{mentor.Description__c}</p>
                            </div>
                        </div>
                </div>
            </div>
        </div>
        )
    }

    const getScreen=()=>{
        return(
            <div className="flex flex-col py-5">
                <h1 className="text-gray-900 text-lg">About Me</h1>
                <h1 className="text-gray-600 text-base mt-3">{menteeDetails.description}</h1>

                <h1 className="text-gray-900 text-lg mt-3">Skills</h1>

                <div className="container mx-auto max-full mt-5">
                    <div className="md:grid md:grid-cols-3 flex flex-col">
                        {menteeDetails.skills && menteeDetails.skills.length>0 &&
                            menteeDetails.skills.map((skill)=>{
                                console.log("Skill",skill);
                                return(
                                    skillUi(skill)
                                )
                            })
                        }
                    </div>
                </div>
                {/* <h1 className="text-gray-900 text-lg mt-5">Experience</h1>
                {mentorDetails.experience && mentorDetails.experience.length>0 &&
                    mentorDetails.experience.map((exp,i)=>{
                        return(
                            expUi(exp,i)
                        )
                    })
                } */}
                
            </div>
        )
    }

    const menteeDetailUi =()=>{
        return(
            <div className="flex flex-col">
                <div className="bg-white rounded-md my-5 px-5 flex flex-row justify-between">
                   
                    <div className="bg-white rounded-md flex flex-row py-5 px-3 mb-3 ">
                            <img src={menteeDetails.profilePic?menteeDetails.profilePic:"https://cdni.iconscout.com/illustration/premium/thumb/business-mentor-2706556-2264645.png"} className="h-52 w-52"/>
                            <div className="w-full flex flex-row justify-between">
                                <div className="py-5 ml-7">
                                    <div className="flex flex-col h-full">
                                        <h1 className="text-gray-900 text-xl"> {capsLatter(menteeDetails.firstName +
                                        " " +
                                        menteeDetails.lastName)}</h1>
                                        <h1 className="text-gray-400 text-base">{menteeDetails.email}</h1>
                                        {/* <ReactStars
                                            count={5}
                                            size={18}
                                            value={mentorDetails.rating}
                                            edit={false}
                                            color2={'#ffd700'} 
                                        /> */}
                                        <h1 className="text-gray-400 text-base">{menteeDetails.shortDesc}</h1>
                                    </div>
                                </div>
                            </div>  
                    </div>

                    <div className="flex flex-row items-start p-5">
                        <div className="p-2 border border-gray-300 rounded-sm mr-2 cursor-pointer text-gray-600 hover:text-white hover:bg-blue-600 hover:border-0">
                            <AiFillLinkedin size={23} />
                        </div>
                        <div className="p-2 border border-gray-300 rounded-sm mr-2 cursor-pointer text-gray-600 hover:text-white hover:bg-blue-600 hover:border-0">
                            <FaPhone size={23} />
                        </div>
                        <div className="p-2 border border-gray-300 rounded-sm mr-2 cursor-pointer text-gray-600 hover:text-white hover:bg-blue-600 hover:border-0">
                            <AiFillFacebook size={23} />
                        </div>
                    </div>
                        
                </div>  

                <div className="bg-white rounded-md p-5 flex flex-col">
                    {/* <div className="flex flex-row justify-around border-b">
                        <div className={selectedOption === 1?"w-full text-blue-400 p-3 border-b-4 border-blue-400 text-center":"w-full cursor-pointer text-gray-700 p-3 hover:text-black text-center"} onClick={()=>setSelectedOption(1)}>
                            Overview
                        </div>
                        <div className={selectedOption === 2?"w-full text-blue-400 p-3 border-b-4 border-blue-400 text-center":"w-full cursor-pointer text-gray-700 p-3 hover:text-black text-center"} onClick={()=>setSelectedOption(2)}>
                            Courses
                        </div>
                    </div> */}
                    {getScreen()}
                </div>  
            </div>   
        )
    }

    return (
        <Base history={history}>
            <div className="container mx-auto py-4 md:px-12">
                {showLoader ? (
                    <div className="flex items-center justify-center h-3/6">
                        <LoaderLarge type="ThreeDots" />
                    </div>
                ) : (
                    menteeDetailUi()
                )}
            </div>
        </Base>
    );
};

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile,
    };
};
export default connect(mapStateToProps)(MenteeProfile);