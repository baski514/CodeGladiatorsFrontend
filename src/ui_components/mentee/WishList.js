import React, {useEffect, useState } from 'react';
import { connect } from "react-redux";
import { httpsPOST } from "../../backend_api/menteeAPI";
import { API_GET_COUSE_BY_ID } from "../../backend";
import { LoaderLarge } from "../ui_utilities/Loaders";
import { BsFillHeartFill } from "react-icons/bs";
import update from "immutability-helper";
import { updateUserProfile } from "../../store/actions/authActions";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Base from "../Base";
import { updateMyWishList } from "../../store/actions/appActions";
import {BiRupee} from "react-icons/bi";
import {PATH_WISHLIST} from "../path_constants";
import {firebase} from "../../config/fbConfig"
import { Link } from 'react-router-dom';

const WishList = ({
    auth,
    profile,
    updateProfile,
    history,
    cacheWishList,
    rWishList,
}) => {
    const [courseList, setCourseList] = useState([]);
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        if(rWishList && rWishList.length > 0) {
            setCourseList(rWishList);
            setShowLoader(false);
            debugger;
        }
        else if (profile && profile.wishList) {
            firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsPOST({idToken,uid:auth.uid}, `${API_GET_COUSE_BY_ID}`, profile.wishList).then(
                (data) => {
                    if (data && data.length > 0) {
                        console.log(data);
                        setCourseList(data);
                        cacheWishList(data);
                    }
                    setShowLoader(false);
                    debugger;
                }
            );
        
        });
    }else{
            setShowLoader(false);
            debugger;
        }
    }, []);

    const removeFromWishlist = (courseId) => {
        let wishList = profile.wishList;

        const profileWishlistindex = wishList.findIndex(
            (course) => course.Id === courseId
        );
        const pWishList = update(wishList, {
            $splice: [[profileWishlistindex, 1]],
        });

        //FIXME: dynamic ui updates
        updateProfile({
            wishList: pWishList,
        });

        const index = courseList.findIndex((course) => course.Id === courseId);
        const updatedCourseList = update(courseList, {
            $splice: [[index, 1]],
        });
        setCourseList(updatedCourseList);
    };

    const gotoCourseDetail = (courseId) => {
        history.push(`/course/detail/${courseId}`);
    };

    const getConfirmation = (courseId) => {
        confirmAlert({
            title: "Confirm to submit",
            message: "Do you want to remove this course from your Wish List?",
            buttons: [
                {
                    label: "Remove",
                    onClick: () => {
                        removeFromWishlist(courseId);
                    },
                },
                {
                    label: "Cancel",
                    onClick: () => {},
                },
            ],
        });
    };

    const myWishList = () => {
        if (courseList && courseList.length > 0) {
            return courseList.map((course, index) => {
                return (
                    <div
                        className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-10 transform hover:scale-110 motion-reduce:transform-none"
                        key={index}
                    >
                        <div className="md:flex">
                            <div className="md:flex-shrink-0">
                                <img
                                    className="h-48 w-full object-cover md:h-full md:w-48"
                                    src={
                                        course.Thumbnail_URL__c
                                            ? course.Thumbnail_URL__c
                                            : "https://via.placeholder.com/200"
                                    }
                                    alt={course.Name}
                                />
                            </div>
                            <div className="p-6 w-full">
                                <div>
                                    <div
                                        className="uppercase tracking-wide text-md text-gray-600 font-semibold hover:underline cursor-pointer"
                                        onClick={() =>
                                            gotoCourseDetail(course.Id)
                                        }
                                    >
                                        {course.Name}
                                    </div>
                                    <p className="mt-2 text-gray-500 text-sm">
                                        {course.Short_Description__c}
                                    </p>
                                    <div className="inline-block px-2 py-1 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs mt-4">
                                        {course.Total_Student_Enrolments__c}{" "}
                                        Students
                                    </div>
                                    <div className="inline-block px-2 py-1 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs mt-4 ml-2">
                                        {course.Total_Mentor_Enrolments__c}{" "}
                                        Mentors
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <hr />
                                    <div className="flex mb-2 items-center justify-between mt-2">
                                        {profile.userType === "student" ? (
                                            <div>
                                                <span className="text-md font-bold inline-block py-1 px-2 uppercase rounded-full text-gray-800">
                                                    <BiRupee
                                                        size={21}
                                                        className="inline"
                                                    />
                                                    {course.Course_Price__c
                                                        ? `${course.Course_Price__c}`
                                                        : 0}
                                                </span>
                                            </div>
                                        ) : (
                                            ""
                                        )}
                                        <div className="text-right">
                                            <span
                                                className="text-xs font-bold inline-block cursor-pointer z-20"
                                                onClick={() =>
                                                    getConfirmation(course.Id)
                                                }
                                            >
                                                <BsFillHeartFill
                                                    size={20}
                                                    className="text-orange-700 hover:text-orange-900 inline"
                                                />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            });
        } else {
            return (
                // <div
                //     className="flex items-center justify-center mt-10 bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4"
                //     role="alert"
                // >
                //     <p className="font-bold">INFO: </p>
                //     <p className="ml-4">Your wishlist is empty.</p>
                // </div>
                <div className="flex items-center justify-center mt-10 p-4 mt-10">
                <div className="flex flex-col bg-white pb-3">
                <img src="https://imgproxy.epicpxls.com/UuwJaK46rwY9p05lYVnY0_PyKy8GP2VMPn6u9LndL1c/rs:fill:800:600:0/g:no/aHR0cHM6Ly9pdGVt/cy5lcGljcHhscy5j/b20vdXBsb2Fkcy9w/aG90by9jMzM4Y2Vl/NGQ2NmI4ZGI2MTQ2/MTMxYjAzN2RlNDc4/MA.jpg" alt="no course enrolled" />
                <h1 className="text-center text-gray-500">Your wishlist is empty!</h1>
                </div>
            </div>
            );
        }
    };

    return (
        <Base
            history={history}
            activeTabName="Wishlist"
            pathList={PATH_WISHLIST}
        >
            <div className="container mx-auto py-4 px-12">
                <center>
                    <h3>My Wishlist</h3>
                </center>
                {showLoader ? (
                    <div className="flex items-center justify-center h-3/6">
                        <LoaderLarge type="ThreeDots" />
                    </div>
                ) : (
                    myWishList()
                )}
            </div>
        </Base>
    );
};

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile,
        rWishList: state.app.wishList
    };
};


const mapDispatchToProps = (dispatch) => {
    return {
        updateProfile: (userProfile) =>
            dispatch(updateUserProfile(userProfile, false)),
        cacheWishList: (wishList) => dispatch(updateMyWishList(wishList)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(WishList);