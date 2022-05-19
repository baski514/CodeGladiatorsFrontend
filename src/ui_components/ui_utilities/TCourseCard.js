import React from "react";
import { Link } from "react-router-dom";
import {SiGooglehangoutsmeet} from "react-icons/si";
import {ImHangouts} from "react-icons/all"
import { BsFillClockFill } from "react-icons/bs";
import { FaStar, FaStarHalfAlt, FaRegStar, FaUsers, FaUserTie } from "react-icons/fa";
import {BsFillHeartFill, BsHeart } from "react-icons/bs";
import {BiRupee} from "react-icons/bi";
import Tooltip from "./Tooltip";
import {IoCheckmarkOutline} from 'react-icons/all'

//https://www.youtube.com/watch?v=3IzleQ7UYLA&ab_channel=ShadowBlizzMusic

const TCourseCard = ({ course, markedAsWish, profile }) => {
    console.log("Course received",course)
    const cModules = course.Course_Offerings__r?course.Course_Offerings__r.records:[]
    const courseTitle = course.Name ? course.Name : "A photo from pexels";
    const discount = course.Discount__c?course.Discount__c:0;
    const courseDescrption = course.Description__c ? course.Description__c : "Default description";
    const thumbnailURL = course.Thumbnail_URL__c ? course.Thumbnail_URL__c : "https://via.placeholder.com/250";
    const shortDescription = course.Short_Description__c
        ? course.Short_Description__c
        : "";

    const getStudentRating = (rate) => {
        let rateView = [];
        for (let i = 1; i <= 5; i++) {
            if (rate >= i) {
                rateView.push(<FaStar className="text-orange-700" size={16} />);
            } else if (rate < i && rate > i - 1) {
                rateView.push(
                    <FaStarHalfAlt className="text-orange-700" size={16} />
                );
            } else {
                rateView.push(
                    <FaRegStar className="text-orange-700" size={16} />
                );
            }
        }
        return rateView;
    };

    const children =()=>{
        return(

        
        <div className="w-full p-4" style={{ cursor: "pointer" }}>
            <Link
                to={`/course/detail/${course.Id}`}
                className="c-card block bg-white shadow-md hover:shadow-xl rounded-lg overflow-hidden"
            >
                <div className="relative pb-48 overflow-hidden">
                    <img
                        className="absolute inset-0 h-full w-full object-cover"
                        src={thumbnailURL}
                        alt="Thumbnail"
                    />
                </div>
                <div className="p-4">
                    <span className="inline-block px-2 py-1 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs">
                        Trending
                    </span>
                    <h2 className="mt-2  font-bold truncate" title={courseTitle}>{courseTitle}</h2>
                    <p
                        className="text-sm max-h-10 overflow-ellipsis overflow-hidden"
                        style={{ minHeight: "2.5rem" }}
                    >
                        {shortDescription}
                    </p>
                    {profile &&
                        ((profile.userType === "student"&& profile.sfid)||!profile.sfid) &&
                        course.Course_Price__c && (
                            <div className="mt-1 -ml-2 flex items-center">
                                <div className="flex items-center">
                                    <BiRupee size={23} className="inline" />
                                    <h3
                                        className="font-semibold inline"
                                        style={{ marginLeft: "-5px" }}
                                    >
                                        {course.Discount__c>0?Math.round(course.Course_Price__c-(course.Course_Price__c*(course.Discount__c/100))):course.Course_Price__c}
                                    
                                        
                                    </h3>
                                </div>
                                {course.Discount__c>0 &&
                                       <div className="ml-1 line-through flex items-center">
                                            <BiRupee
                                                size={19}
                                                className="inline text-gray-600 line-through"
                                            />
                                            <h4
                                                className="inline font-xs text-gray-600 line-through"
                                                style={{ marginLeft: "-5px" }}
                                            >
                                                {course.Course_Price__c}
                                            </h4>
                                   </div>
                                
                                }
                             
                            </div>
                        )}
                </div>
                {/* <div className="p-4 border-t border-b text-xs text-gray-700">
                    <span className="flex items-center mb-1">
                        <SiGooglehangoutsmeet
                            className="inline mr-1 text-gray-500"
                            size={18}
                        />
                        {course.Total_Sessions__c
                            ? course.Total_Sessions__c
                            : 0}{" "}
                        Sessions
                    </span>
                    <span className="flex items-center mb-1">
                        <BsFillClockFill
                            className="inline mr-1 text-gray-500"
                            size={18}
                        />
                        {course.Total_Session_Hours__c
                            ? course.Total_Session_Hours__c
                            : 0}{" "}
                        Hours
                    </span>
                    <span className="flex items-center mb-1">
                        <FaUserTie
                            className="inline mr-1 text-gray-500"
                            size={18}
                        />
                        {course.Total_Mentor_Enrolments__c
                            ? course.Total_Mentor_Enrolments__c
                            : 0}{" "}
                        Mentors Enrolled
                    </span>

                    <span className="flex items-center mb-1">
                        <FaUsers
                            className="inline mr-1 text-gray-500"
                            size={18}
                        />
                        {course.Total_Student_Enrolments__c
                            ? course.Total_Student_Enrolments__c
                            : 0}{" "}
                        Students Enrolled
                    </span>
                </div> */}
                <div className="p-4 flex justify-between border-t text-sm text-gray-600">
                    <div className="flex items-center">
                        <span className="mr-1 font-semibold text-sm pt-1 text-orange-700">
                            {course.Average_review_rating__c}
                        </span>
                        <div className="flex items-center">
                            {getStudentRating(
                                course.Average_review_rating__c
                                    ? course.Average_review_rating__c
                                    : 0
                            )}
                        </div>
                        <span className="ml-1 text-xs">
                            (
                            {course.Total_Reviews__c
                                ? course.Total_Reviews__c
                                : 0}
                            )
                        </span>
                    </div>
                    <div>
                        {markedAsWish ? (
                            <BsFillHeartFill
                                size={20}
                                className="text-orange-700 inline"
                            />
                        ) : (
                            <BsHeart
                                size={20}
                                className="text-orange-700 inline"
                            />
                        )}
                    </div>
                </div>
            </Link>
        </div>
        )
    }

    const toolTipContent = ()=>{
        return(
            <div className="flex flex-col justify-center mt-2 max-w-xs z-40">
                <Link
                    to={`/course/detail/${course.Id}`}
                    className="hover:text-blue-600 px-2"
                > 
                    <h1 className="text-xl text-black text-start font-semibold hover:text-blue-500">{courseTitle}</h1>
                </Link>
                <div className="flex flex-row mt-2 border-b pb-3">
                    <h1 className="text-xs font-medium bg-yellow-200 text-gray-900 mx-2 py-1 px-2">Bestseller</h1>
                    <div className="flex flex-row items-center ml-3">
                        <h1 className="text-xs font-medium  text-gray-900 mr-1">Updated </h1>
                        <h1 className="text-xs font-bold text-gray-900">August 16</h1>
                    </div>
                </div>
                {/* <div className="flex flex-row mt-2 mb-2">
                    <h1 className="text-xs text-gray-700">Beginner</h1>
                    <div className="flex flex-row items-center">
                        <div className="h-0.5 w-0.5 rounded-full bg-gray-700 ml-2"></div>
                    </div>
                 
                    <h1 className="text-xs text-gray-700 ml-2">Subtitles</h1>
                </div> */}
                <div className="flex flex-row py-2 border-b my-2">
                    <div className="flex flex-row mr-3 mx-2">
                        <div className="text-xs text-gray-700">
                            <span className="flex items-center mb-1">
                                <ImHangouts
                                    className="inline mr-1 text-gray-500"
                                    size={18}
                                />
                                {course.Total_Sessions__c
                                    ? course.Total_Sessions__c
                                    : 0}{" "}
                                Sessions
                            </span>
                            <span className="flex items-center mb-1">
                                <BsFillClockFill
                                    className="inline mr-1 text-gray-500"
                                    size={18}
                                />
                                {course.Total_Session_Hours__c
                                    ? course.Total_Session_Hours__c
                                    : 0}{" "}
                                Hours
                            </span>
                           
                        </div>
                    </div>

                    <div className="flex flex-row">
                        <div className="text-xs text-gray-700">
                            
                            <span className="flex items-center mb-1">
                                <FaUserTie
                                    className="inline mr-1 text-gray-500"
                                    size={18}
                                />
                                {course.Total_Mentor_Enrolments__c
                                    ? course.Total_Mentor_Enrolments__c
                                    : 0}{" "}
                                Mentors Enrolled
                            </span>

                            <span className="flex items-center mb-1">
                                <FaUsers
                                    className="inline mr-1 text-gray-500"
                                    size={18}
                                />
                                {course.Total_Student_Enrolments__c
                                    ? course.Total_Student_Enrolments__c
                                    : 0}{" "}
                                Students Enrolled
                            </span>
                        </div>
                    </div>
                    
                </div>
                <p className="text-gray-900 text-sm mb-2 mx-2">{shortDescription}</p>
                {cModules.map((module,mIndex)=>{
                    return(
                        <div className="flex flex-row items-center mt-1 mx-2">
                            <IoCheckmarkOutline size={15} className="text-warmGray-700 mr-3"/>
                            <h1 className="text-sm text-warmGray-700"> {module.Name}</h1>
                        </div>
                    )
                })}
               
            </div>
        )
    }


    return (
        <Tooltip
            children={children()}
            placement="right"
            trigger="hover"
            delayShow={300}
            tooltip={toolTipContent()}>
        </Tooltip>
    );
};

export default TCourseCard;