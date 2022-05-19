import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import { Redirect, Link } from "react-router-dom";
import { firebase,storage } from "../../../config/fbConfig";
import { updateUserProfile } from "../../../store/actions/authActions";
import "../../../styles/profile.css";
import { FaMapMarkerAlt, FaUniversity, FaBriefcase, FaPhone } from "react-icons/fa";
import { FaCamera } from "react-icons/fa";
import Base from "../../Base";
import ShowMoreText from "react-show-more-text";
import {API_GET_MENTOR_DETAILS} from '../../../backend'
import {httpsGET} from '../../../backend_api/mentorAPI'
import { AiFillFacebook, AiFillLinkedin } from "react-icons/ai";
import { MdComputer } from "react-icons/md";
import { LoaderLarge } from "../../ui_utilities/Loaders";

//TODO: https://github.com/react-hook-form/react-hook-form

const Profile = ({ auth, profile, updateProfile, history }) => {
    console.log("Profile",profile);
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [showLoader, setShowLoader] = useState(true);
    const [selectedOption,setSelectedOption] = useState(1);

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

    const handleChange = (e) => {
        if (e.target.files[0]) {
            //setImage(e.target.files[0]);
            handleUpload(e.target.files[0]);
        }
    };

    useEffect(() => {
        httpsGET(
            null,
            `${API_GET_MENTOR_DETAILS}${auth.uid}`
        ).then((data) => {
            
            firebase.firestore().collection("users").doc(auth.uid).get().then((doc)=>{

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

    const handleUpload = (image) => {
        if (image) {
            let fileExtension = image.name.split(".").pop();
            if (fileExtension) {
                const uploadTask = storage
                    .ref(`images/${profile.sfid}_profile_pic.${fileExtension}`)
                    .put(image);
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
                                `${profile.sfid}_profile_pic.${fileExtension}`
                            )
                            .getDownloadURL()
                            .then((url) => {
                                updateProfile({ picURL: url });
                                console.log(`File URL ${url}`);
                            })
                            .catch((err) => {
                                console.log("ERROR" + err);
                            });
                    }
                );
            } else {
                alert("Invalid image: please select a valid image.");
            }
        }
    };

    let fileInput = useRef(null);

    const triggerFileSelection = () => {
        fileInput.current.click();
    };

    if (!auth.uid) return <Redirect to="/signin" />;

    const myProfile =()=>{
        return(
            <div className="flex flex-col">
                <div className="bg-white rounded-md my-5 px-5 flex md:flex-row flex-col justify-between">
                   
                    <div className="bg-white rounded-md flex md:flex-row flex-col py-5 px-3 mb-3 ">
                    
                    <div className="relative">
                                                <div
                                                    className="relative align-middle"
                                                    style={{
                                                        maxWidth: "150px",
                                                        minWidth: "150px",
                                                        height: "150px",
                                                    }}
                                                >
                                                    <div
                                                        className="absolute "
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                        }}
                                                    >
                                                        <img
                                                            alt="..."
                                                            src={
                                                                mentorDetails.profilePic?mentorDetails.profilePic
                                                                    : "https://f0.pngfuel.com/png/136/22/profile-icon-illustration-user-profile-computer-icons-girl-customer-avatar-png-clip-art.png"
                                                            }
                                                            className="border-2 border-gray-800 shadow-xl rounded-full h-full"
                                                        />
                                                    </div>
                                                    <div className="absolute capture-holder rounded-full flex items-center justify-center z-50 bg-gray-800 opacity-0 hover:opacity-50">
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            style={{
                                                                width: "-webkit - fill - available",
                                                            }}
                                                            onChange={
                                                                handleChange
                                                            }
                                                            accept="image/*"
                                                            ref={fileInput}
                                                        />
                                                        <FaCamera
                                                            size={20}
                                                            className="inline text-white capture z-100 cursor-pointer"
                                                            onClick={() => {
                                                                triggerFileSelection();
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                            <div className="w-full flex flex-row justify-between">
                                <div className="md:py-5 md:ml-7">
                                    <div className="flex flex-col h-full">
                                        <h1 className="text-gray-900 text-xl"> {(mentorDetails.firstName +" " +mentorDetails.lastName).toUpperCase()}</h1>
                                        <h1 className="text-gray-400 text-base">{mentorDetails.email}</h1>
                                        {/* <ReactStars
                                            count={5}
                                            size={18}
                                            value={mentorDetails.rating}
                                            edit={false}
                                            color2={'#ffd700'} 
                                        /> */}
                                        <h1 className="text-gray-400 text-base">{mentorDetails.shortDescription}</h1>
                                    </div>
                                </div>
                            </div>  
                    </div>

                   <div className="flex flex-col md:p-5">
                        
                   <div className="flex flex-row items-start">
                        <div className="p-2 border border-gray-300 rounded-sm mr-2 cursor-pointer text-gray-600 hover:text-white hover:bg-blue-600 hover:border-0">
                            <AiFillLinkedin size={23} onClick={()=>{
                                    mentorDetails.LinkedIn_Id__c?handleClick(mentorDetails.LinkedIn_Id__c):handleClick("https://linkedin.com")
                                }
                                }/>
                        </div>
                        <div className="p-2 border border-gray-300 rounded-sm mr-2 cursor-pointer text-gray-600 hover:text-white hover:bg-blue-600 hover:border-0">
                            <FaPhone size={23}    onClick={()=>{
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

                   <Link
                        className="bg-purple-500 hover:bg-purple-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 mt-2 text-center"
                        type="button"
                        style={{
                            transition:
                                "all .15s ease",
                        }}
                        to="/editprofile"
                    >
                        Edit Profile
                        </Link>
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
                           <div className="col-start-5 col-end-6 flex flex-col items-center justify-center">
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
                        
                        <div class="col-start-5 col-end-6 mr-10 md:mx-auto relative">
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

                    <h1 className="text-gray-900 text-lg mt-3">Skills</h1>

                    <div className="container mx-auto max-full mt-5 justify-center">
                        <div className="md:grid md:grid-cols-3 flex flex-row ">
                            {mentorDetails.skills && mentorDetails.skills.length>0 &&
                                mentorDetails.skills.map((skill)=>{
                                    console.log("Skill",skill);
                                    return(
                                        skillUi(skill)
                                    )
                                })
                            }
                        </div>
                    </div>
                    {profile.userType==="instructor" &&
                        <>
                            <h1 className="text-gray-900 text-lg mt-5">Experience</h1>
                            {mentorDetails.experience && mentorDetails.experience.length>0 &&
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
                                        history.push("/mycourse");
                                    }}>
                                    
                                    <div class="flex justify-center -mt-10">
                                        <img src={offering.Course_Master__r.Thumbnail_URL__c?offering.Course_Master__r.Thumbnail_URL__c:"https://cdn1.iconfinder.com/data/icons/avatar-97/32/avatar-18-512.png"} className="rounded-full border-solid border-white border-2 -mt-10 h-20 w-20" alt="profile"/>		
                                    </div>
                    
                                    <div class="text-center px-3 pb-6 pt-2">
                                        <h3 class="group-hover:text-white text-gray-900 text-lg">{offering.Course_Master_Name__c}</h3>
                                        {/* <h3 class="mt-2 text-sm group-hover:text-white text-gray-700 bold h-3 truncate">{offering.Course_Master__r.Description__c?renderHTML(offering.Course_Master__r.Description__c):""}</h3> */}
                                    </div>
                                    
                                    {profile.userType==="instructor" &&
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
                                    }
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

    const profileDetails = () => {
        return (
            <Base history={history} pathList={[{to:"/",name:"Home"},{to:"#",name:"MyProfile"}]}>

                <div className="w-full bg-white h-16 flex-col items-center justify-center">
                    <h1 className="text-lg items-center p-5">My profile</h1>
                </div>
                
                    {showLoader ? (
                        <div className="flex items-center justify-center h-3/6">
                            <LoaderLarge type="ThreeDots" />
                        </div>
                        ) : (
                            <div className="profile-page bg-gray-300 h-full">
                            <div
                                className="relative block"
                                style={{ height: "500px" }}
                            >
                                <div
                                    className="absolute top-0 w-full h-full bg-center bg-cover bg-gradient-to-tr from-violet-500 to-orange-300"
                                    style={{
                                        backgroundImage:
                                            "url('https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80')",
                                    }}
                                >
                                    {/* <span
                                        id="blackOverlay"
                                        className="w-full h-full absolute opacity-50 bg-black"
                                    ></span> */}
                                </div>
                                <div
                                    className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden"
                                    style={{ height: "70px" }}
                                >
                                    <svg
                                        className="absolute bottom-0 overflow-hidden"
                                        xmlns="http://www.w3.org/2000/svg"
                                        preserveAspectRatio="none"
                                        version="1.1"
                                        viewBox="0 0 2560 100"
                                        x="0"
                                        y="0"
                                    >
                                        <polygon
                                            className="text-gray-300 fill-current"
                                            points="2560 0 2560 100 0 100"
                                        ></polygon>
                                    </svg>
                                </div>
                            </div>
                            <section className="relative md:py-16 bg-gray-300">
                                <div className="container mx-auto px-4">
                                    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg md:-mt-80 -mt-96">
                                        {myProfile()}
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </Base>
        );
    };

    return <>{profileDetails()}</>;
};


const mapStateToProps = (state) => {
    // console.log(state);
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile,
    };
};


const mapDispatchToProps = (dispatch) => {
    return {
        updateProfile: (localProfile) =>
            dispatch(updateUserProfile(localProfile, true)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);