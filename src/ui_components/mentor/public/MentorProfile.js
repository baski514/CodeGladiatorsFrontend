import React, { useState, useEffect } from 'react';
import { httpsGET } from '../../../backend_api/mentorAPI';
import Base from "../../Base";
import { LoaderLarge } from "../../ui_utilities/Loaders";
import { API_GET_MENTOR_DETAILS } from '../../../backend';
import moment from "moment";
import { connect } from "react-redux";
import {firebase} from '../../../config/fbConfig'
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPhone } from 'react-icons/fa';
import { AiFillFacebook, AiFillLinkedin } from 'react-icons/ai';
import { MdComputer } from 'react-icons/md';
import renderHTML from 'react-render-html';
import ReactStars from 'react-stars';


const MentorProfile = ({ props,history, match, similarProfiles }) => {
    const [showLoader, setShowLoader] = useState(true);
    const [mentorDetails, setMentorDetails] = useState({
        skills:[],
        experience:[],
        offerings:[],
        firstName:"",
        lastName:"",
        email:"",
        phone:"",
        rating:0,
        profilePic:"",
        title:"",
        gender:"",
        memberSince:"",
        description:"",
        currentAddress:"",
        permanentAddress:"",
        shortDescription:"",
        Facebook_Id__c:"",
        LinkedIn_Id__c:""
    });

    const [selectedOption,setSelectedOption] = useState(1);

    useEffect(() => {
        httpsGET(
            null,
            `${API_GET_MENTOR_DETAILS}${match.params.mentorFid}`
        ).then((data) => {
            
            firebase.firestore().collection("users").doc(match.params.mentorFid).get().then((doc)=>{

                console.log("FB Data ",doc.data())
                console.log(data);
                if (data && data.length > 0) {
                    setShowLoader(false);
                    const mentor = data[0];
                    const mentorProfile = doc.data()

                    debugger;                    

                    setMentorDetails({
                        ...mentorDetails,
                        skills: mentor.Key_Skill__r
                            ? mentor.Key_Skill__r.records
                            : [],
                        experience: mentor.Employment_detail__r
                            ? mentor.Employment_detail__r.records
                            : [],
                        offerings: mentor.Course_Enrollments__r
                            ? mentor.Course_Enrollments__r.records
                            :[],
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
                        description: mentorProfile.description ? mentorProfile.description : "",
                        currentAddress: mentorProfile.location ? mentorProfile.location : "",
                        permanentAddress: mentor.OtherAddress ? mentor.OtherAddress : "",
                        shortDescription: mentorProfile.shortDescription ? mentorProfile.shortDescription : "",
                        rating:mentor.Mentor_Rating__c?mentor.Mentor_Rating__c:0,
                        LinkedIn_Id__c:mentor.LinkedIn_Id__c?mentor.LinkedIn_Id__c:"",
                        Facebook_Id__c:mentor.Facebook_Id__c?mentor.Facebook_Id__c:""
                    });

                    console.log("Mentor Phone",mentorDetails.gender)
                    
                }
            }).catch((err)=>{
                setShowLoader(false);
                console.log("Error to fetch mentor profile ",err)
            }).finally(()=>{
                setShowLoader(false);
            })
        });
    }, []);

    const redirectToProfile = (fbId) => {
        console.log(fbId);
         
        let path = `/mentor/detail/${fbId}`;
        <Redirect to={path}/> 
    }

    const mentorDetail = () => {

        return (
            <div className="bg-gray-100">
                <div className="container mx-auto my-5 p-5">
                    <div className="md:flex no-wrap md:-mx-2">
                        <div className="w-full md:w-3/12 md:mx-2">
                            <div className="bg-white p-3 border-t-4 border-green-400">
                                <div className="image overflow-hidden">
                                    <img
                                        className="h-auto w-full mx-auto"
                                        src={mentorDetails.profilePic}
                                        alt=""
                                    />
                                </div>
                                <hr className="mt-2" />
                                <h1 className="text-gray-900 font-bold text-xl leading-8 my-1">
                                    <center>
                                        {mentorDetails.firstName +
                                            " " +
                                            mentorDetails.lastName}
                                    </center>
                                </h1>
                                <h3 className="text-gray-600 font-lg text-semibold leading-6">
                                    {mentorDetails.shortDescription}
                                </h3>
                                <p className="text-sm text-gray-500 hover:text-gray-600 leading-6">
                                    {mentorDetails.description}
                                </p>
                                <ul
                                    className="bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-2 mt-3 divide-y rounded shadow-sm list-none"
                                    style={{
                                        paddingLeft: "10px",
                                    }}
                                >
                                    <li className="flex items-center py-2">
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
                                                mentorDetails.memberSince
                                            ).calendar()}
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div className="my-4"></div>

                            <div className="bg-white p-3 hover:shadow">
                                <div className="flex items-center space-x-3 font-semibold text-gray-900 text-xl leading-8">
                                    <span className="text-green-500">
                                        <svg
                                            className="h-5 fill-current"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                    </span>
                                    
                                    <span>Similar Profiles</span>
                                </div>
                                <div className="grid grid-cols-3">
                                    {similarProfiles &&
                                        similarProfiles.slice(0,6).map(
                                            (mProfile, index) => {
                                                return (
                                                    <div
                                                        className="text-center my-2"
                                                        key={index}
                                                        onClick={() => {
                                                            
                                                            history.push(
                                                                `/mentor/detail/${mProfile.Firebase_Id__c}`
                                                            );
                                                        }}
                                                    >
                                                        {console.log("SIMILAR PROFILE ",mProfile)}
                                                        <img
                                                            className="h-16 w-16 rounded-full mx-auto"
                                                            src={
                                                                mProfile.Profile_Picture__c?mProfile.Profile_Picture__c:"https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"
                                                            }
                                                            alt=""
                                                        />
                                                        
                                                        <a
                                                            href="#"
                                                            className="text-main-color"
                                                        >
                                                            {mProfile.FirstName +
                                                                ` ` +
                                                                mProfile.LastName}
                                                        </a>
                                                    </div>
                                                );
                                            }
                                        )}
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-9/12 mx-2 h-64">
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
                                                {mentorDetails.firstName}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2">
                                            <div className="px-4 py-2 font-semibold">
                                                Last Name
                                            </div>
                                            <div className="px-4 py-2">
                                                {mentorDetails.lastName}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2">
                                            <div className="px-4 py-2 font-semibold">
                                                Gender
                                            </div>
                                            <div className="px-4 py-2">
                                                {console.log(mentorDetail.gender)}
                                                {mentorDetails.gender}
                                            </div>
                                        </div>
                                        
                                        
                                        {/* <div className="grid grid-cols-2">
                                            <div className="px-4 py-2 font-semibold">
                                                Contact No.
                                            </div>
                                            <div className="px-4 py-2">
                                                {mentorDetails.phone}
                                            </div>
                                        </div> */}
                                        <div className="grid grid-cols-2">
                                            <div className="px-4 py-2 font-semibold">
                                                Current Address
                                            </div>
                                            <div className="px-4 py-2"></div>
                                        </div>
                                        <div className="grid grid-cols-2">
                                            <div className="px-4 py-2 font-semibold">
                                                Permanant Address
                                            </div>
                                            <div className="px-4 py-2">
                                                {mentorDetails.currentAddress}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2">
                                            <div className="px-4 py-2 font-semibold">
                                                Email.
                                            </div>
                                            <div className="px-4 py-2">
                                                <a
                                                    className="text-blue-800 truncate md:overflow-clip mr-3"
                                                    href={`mailto:${mentorDetails.email}`}
                                                >
                                                    {mentorDetails.email}
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
                                {/* <button className="block w-full text-blue-800 text-sm font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:shadow-outline focus:bg-gray-100 hover:shadow-xs p-3 my-4">
                                    Show Full Information
                                </button> */}
                            </div>

                            <div className="my-4"></div>
                            {(mentorDetails.skills && mentorDetails.skills.length>0) || (mentorDetails.experience && mentorDetails.experience.length>0)?
                            <div className="bg-white p-3 shadow-sm rounded-sm">
                                
                                <div className="grid grid-cols-2">
                                    {mentorDetails && mentorDetails.skills.length>0 && 
                                    
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
                                        {mentorDetails &&
                                            mentorDetails.skills &&
                                            mentorDetails.skills.map(
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
                                    }
                                {mentorDetails.experience && mentorDetails.experience.length>0 && 
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
                                        </div>
                                        <ul className="list-inside space-y-2">
                                            {mentorDetails &&
                                                mentorDetails.experience &&
                                                mentorDetails.experience.map(
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
                                                                            [experience.End_Date__c]
                                                                        ).diff(
                                                                            moment(
                                                                                [experience.Start_Date__c]
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
                                    }
                                </div>
                            </div>:null}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

    const expUi=(exp,index)=>{
        console.log("EXP",exp);
        return(
            <div
                class="flex flex-col md:grid grid-cols-9 mx-auto p-2 text-blue-50"
            >
                {(index+1)%2!==0?
                    <div class="col-start-5 col-end-6 flex md:flex-row-reverse flex-col md:contents">
                        <div className="col-start-5 col-end-6 flex md:flex-col flex-row items-center justify-center">
                            <h1 className="text-gray-600 text-sm md:mr-0 mr-3">{exp.Start_Date__c}</h1>
                            <h1 className="text-gray-600 text-sm">{exp.End_Date__c}</h1>
                        </div>
                        <div
                            class="w-full bg-blue-500 col-start-1 col-end-5 p-4 rounded-xl my-4 ml-auto shadow-md"
                        >
                            <h3 class="font-semibold text-lg mb-1">{exp.Name}</h3>
                            <p class="leading-tight text-justify">
                                {exp.Description__c}
                            </p>
                        </div>
                        <div class="md:col-start-5 md:col-end-6 md:mx-auto md:relative mr-10 hidden md:block">
                            <div class="h-full w-6 flex items-center justify-center">
                                <div class="h-full w-1 bg-blue-800 pointer-events-none"></div>
                            </div>
                            <div
                                className="w-6 h-6 absolute top-1/2 -mt-3 rounded-full bg-blue-500 shadow"
                            ></div>
                        </div>
                     
                    </div>:
                    <div class="flex md:flex-row flex-col md:contents">
                        <div className="col-start-5 col-end-6 flex md:flex-col items-center justify-center">
                            <h1 className="text-gray-600 text-sm md:mr-0 mr-3">{exp.Start_Date__c}</h1>
                            <h1 className="text-gray-600 text-sm">{exp.End_Date__c}</h1>
                        </div>
                        
                        <div class="md:col-start-5 md:col-end-6 mr-10 md:mx-auto md:relative hidden md:block">
                            <div class="h-full w-6 flex items-center justify-center">
                                <div class="h-full w-1 bg-blue-800 pointer-events-none"></div>
                            </div>
                            <div
                                class="w-6 h-6 absolute top-1/2 -mt-3 rounded-full bg-blue-500 shadow"
                            ></div>
                        </div>
                        <div
                            class="bg-blue-500 col-start-6 col-end-10 p-4 rounded-xl my-4 mr-auto shadow-md"
                        >
                            <h3 class="font-semibold text-lg mb-1">{exp.Name}</h3>
                            <p class="leading-tight text-justify">
                                {exp.Description__c}
                            </p>
                        </div>
                        
                    </div>
                
            }
            </div>
        )
    }

    const getScreen=()=>{
        if(selectedOption===1){
            return(
                <div className="flex flex-col py-5">
                    <h1 className="text-gray-900 text-lg">About Me</h1>
                    <h1 className="text-gray-600 text-base mt-3">{mentorDetails.description}</h1>

                    {mentorDetails.skills && mentorDetails.skills.length > 0 &&
                        <>
                            <h1 className="text-gray-900 text-lg mt-3">Skills</h1>
                            <div className="container mx-auto max-full mt-5">
                                <div className="md:grid md:grid-cols-3 flex flex-col">
                                    {
                                        mentorDetails.skills.map((skill)=>{
                                            console.log("Skill",skill);
                                            return(
                                                skillUi(skill)
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </>
                    }
                   
                    {mentorDetails.experience && mentorDetails.experience.length>0 &&
                        <>
                            <h1 className="text-gray-900 text-lg mt-5">Experience</h1>
                            {
                                mentorDetails.experience.map((exp,i)=>{
                                    return(
                                        expUi(exp,i)
                                    )
                                })
                            }
                        </>
                    }
                </div>
            )
        }else{
            return(
                <div className="container mx-auto max-full">
                    <div className="md:grid md:grid-cols-3 flex flex-col">
                        {mentorDetails.offerings && mentorDetails.offerings.map((offering)=>{
                            return(
                                <div class=" overflow-hidden py-3 px-2 m-1 transform hover:scale-110 motion-reduce:transform-none">
                                <div className="w-full h-20"></div>
                                <div className="group bg-white hover:bg-blue-500 hover:shadow-lg rounded-lg cursor-pointer"  
                                    onClick={() => {
                                        history.push(
                                            `/course/detail/${offering.Course_Master__r.Id}`
                                        );
                                    }}>
                                    
                                    <div class="flex justify-center -mt-10">
                                        <img src={offering.Course_Master__r.Thumbnail_URL__c?offering.Course_Master__r.Thumbnail_URL__c:"https://cdn1.iconfinder.com/data/icons/avatar-97/32/avatar-18-512.png"} className="rounded-full border-solid border-white border-2 -mt-10 h-20 w-20" alt="profile"/>		
                                    </div>
                    
                                    <div class="text-center px-3 pb-6 pt-2">
                                        <h3 class="group-hover:text-white text-gray-900 text-lg">{offering.Course_Master_Name__c}</h3>
                                        {/* <h3 class="mt-2 text-sm group-hover:text-white text-gray-700 bold h-3 truncate">{offering.Course_Master__r.Description__c?renderHTML(offering.Course_Master__r.Description__c):""}</h3> */}
                                    </div>
                                    
                                    <div class="flex justify-center pb-3">
                                        <div className="w-full grid grid-cols-2">
                                                <div class="text-center border-r text-base">
                                                    <h2 className="group-hover:text-white text-gray-900 text-base">{offering.Schedule_Start_Date__c}</h2>
                                                    <span className="group-hover:text-white text-gray-600">From</span>
                                                </div>

                                                <div class="text-center text-base">
                                                <h2 className="text-base group-hover:text-white text-gray-900">{offering.Schedule_End_Date__c}</h2>
                                                    <span className="group-hover:text-white text-gray-600">To</span>
                                                </div>

                                             
                                              </div>
                                    </div>
                                </div>
                            </div>
                            )
                        })}
                    </div>
                </div>
            )
        }
    }
    const handleClick = (url) => {
        window.open(url);
    };
    const instructorDetail =()=>{
        return(
            <div className="flex flex-col">
                <div className="bg-white rounded-md md:my-5 px-5 flex md:flex-row flex-col justify-between">
                   
                    <div className="bg-white rounded-md flex flex-row py-5 px-3 mb-3 ">
                            <img src={mentorDetails.profilePic?mentorDetails.profilePic:"https://cdni.iconscout.com/illustration/premium/thumb/business-mentor-2706556-2264645.png"} className="md:h-52 md:w-52 h-12 w-12"/>
                            <div className="w-full flex flex-row justify-between">
                                <div className="md:py-5 ml-7">
                                    <div className="flex flex-col h-full">
                                        <h1 className="text-gray-900 text-xl"> {capsLatter(mentorDetails.firstName +" " +mentorDetails.lastName)}</h1>
                                        <h1 className="text-gray-400 text-base">{mentorDetails.email}</h1>
                                        <ReactStars
                                            count={5}
                                            size={18}
                                            value={mentorDetails.rating}
                                            edit={false}
                                            color2={'#ffd700'} 
                                        />
                                        <h1 className="text-gray-400 text-base">{mentorDetails.shortDescription}</h1>
                                    </div>
                                </div>
                            </div>  
                    </div>

                    <div className="flex flex-row items-start md:p-5">
                        <div className="p-2 border border-gray-300 rounded-sm mr-2 cursor-pointer text-gray-600 hover:text-white hover:bg-blue-600 hover:border-0">
                            <AiFillLinkedin size={23} onClick={()=>{
                                    mentorDetails.LinkedIn_Id__c?handleClick(mentorDetails.LinkedIn_Id__c):handleClick("https://linkedin.com")
                                }
                                }/>
                        </div>
                        <div className="p-2 border border-gray-300 rounded-sm mr-2 cursor-pointer text-gray-600 hover:text-white hover:bg-blue-600 hover:border-0">
                            <FaPhone size={23} 
                            onClick={()=>{
                                alert("Phone number :- ",mentorDetails.Phone?mentorDetails.Phone:"Not available")
                            }
                            }/>
                        </div>
                        <div className="p-2 border border-gray-300 rounded-sm mr-2 cursor-pointer text-gray-600 hover:text-white hover:bg-blue-600 hover:border-0">
                            <AiFillFacebook size={23} onClick={()=>{
                                    mentorDetails.Facebook_Id__c?handleClick(mentorDetails.Facebook_Id__c):handleClick("https://facebook.com")
                                }
                                }/>
                        </div>
                    </div>
                        
                </div>  

                <div className="bg-white rounded-md p-5 flex flex-col">
                    <div className="flex flex-row justify-around border-b">
                        <div className={selectedOption === 1?"w-full text-blue-400 p-3 border-b-4 border-blue-400 text-center":"w-full cursor-pointer text-gray-700 p-3 hover:text-black text-center"} onClick={()=>setSelectedOption(1)}>
                            Overview
                        </div>
                        <div className={selectedOption === 2?"w-full text-blue-400 p-3 border-b-4 border-blue-400 text-center":"w-full cursor-pointer text-gray-700 p-3 hover:text-black text-center"} onClick={()=>setSelectedOption(2)}>
                            Courses
                        </div>
                    </div>
                    {getScreen()}
                </div>  
            </div>   
        )
    }

    return (
        <Base history={history} activeTabName="Instructors" pathList={[{to:"/",name:"Home"},{to:"/mentors",name:"Instructors"},{to:"#",name:mentorDetails.firstName+" "+mentorDetails.lastName}]}>
            
            <div className="w-full bg-white h-16 flex-col items-center justify-center">
                <h1 className="text-lg items-center p-5">Mentor profile</h1>
            </div>
            <div className="container mx-auto py-4 md:px-12">
                {showLoader ? (
                    <div className="flex items-center justify-center h-3/6">
                        <LoaderLarge type="ThreeDots" />
                    </div>
                ) : (
                    // mentorDetail()
                    instructorDetail()
                )}
            </div>
        </Base>
    );
}

const mapStateToProps = (state, ownProps) => {
    // console.log(state);
    const id = ownProps.match.params.mentorFid;
    const filteredMentors = state.app.mentors ? state.app.mentors.filter(
        (mentor) => mentor.Firebase_Id__c !== id
    ) : [];
    return {
        similarProfiles: filteredMentors,
    };
};

export default connect(mapStateToProps)(MentorProfile)