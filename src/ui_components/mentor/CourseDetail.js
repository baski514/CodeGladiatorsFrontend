import React, { useEffect, useState } from "react";
import Base from "../Base";
import Accordion from "../ui_utilities/Accordion";
import { httpsGET, httpsPOST } from "../../backend_api/mentorAPI";
import { httpsPOST as menteePost } from "../../backend_api/menteeAPI";
import renderHTML from "react-render-html";
import { connect } from "react-redux";
import {
    API_GET_COURSE_DETAIL,
    API_POST_ENROL_COURSE,
    KEY,
    API_CREATE_RAZOR_ORDER,
} from "../../backend";
import { LoaderLarge } from "../ui_utilities/Loaders";
import { randomColor } from "randomcolor";
import moment from "moment";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { updateUserProfile } from "../../store/actions/authActions";
import { updateMyEnrollOnFirebase } from "../../store/actions/appActions";
import update from "immutability-helper";
import { BiRupee } from "react-icons/bi";
import { GiRingingAlarm } from "react-icons/gi";
import { FaUserFriends } from "react-icons/fa";
import { GiTeacher } from "react-icons/gi";
import { MdEventNote } from "react-icons/md";
import { toast } from "react-toastify";
//import StripeCheckout from "react-stripe-checkout";
import CommonDetailModal from "../settings/CommonDetailModal";
import { firebase } from "../../config/fbConfig";


function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
}

const CourseDetail = ({
    match,
    profile,
    auth,
    history,
    updateProfile,
    location,
    updateCEOnFb,
}) => {
    console.log("Location", KEY);

    const [courseDetail, setCourseDetail] = useState({
        name: "",
        shortDescription: "",
        description: "",
        thumbnailURL: "https://via.placeholder.com/350",
        offerings: [],
        schedules: [],
        reviews: [],
        menteesEnrolled: [],
        coursePrice: null,
        paidCourse: false,
        avgRating: 0,
        upcomingSessions: [],
        topMentors: [],
    });

    const [showLoader, setShowLoader] = useState(true);
    const [mentorCoursePlan, setMentorCoursePlan] = useState({
        totalStudent: 0,
        price: 0,
        Schedule_Start_Date__c: "",
        Schedule_End_Date__c: "",
    });
    const [mentorCoursePlanError, setMentorCoursePlanError] = useState({
        totalStudentError: false,
        priceError: false,
        startDateError: false,
        endDateError: false,
    });

    const [paymentProcessHasStarted, setPaymentProcessHasStarted] =
        useState(false);
    const [showModal, setShowModal] = useState(false);
    let selectedMentor;
    let selectecdMentorPrice;

    useEffect(() => {
        httpsGET(null, `${API_GET_COURSE_DETAIL}${match.params.courseId}`).then(
            (data) => {
                debugger;
                if (data && data.error) {
                    console.log(data.techMsg);
                } else if (data && data.error) {
                    console.log(data.error);
                } else {
                    const listOfMentees = [];
                    console.log("Course Details", data);
                    const course = data.course_master;

                    if (data.menteesEnrollment) {
                        data.menteesEnrollment.forEach((mentee) => {
                            listOfMentees.push(mentee.Contact__c);
                        });
                    }
                    setCourseDetail({
                        ...courseDetail,
                        name: course.Name,
                        shortDescription: course.Short_Description__c
                            ? course.Short_Description__c
                            : "",
                        description: course.Description__c
                            ? course.Description__c
                            : "",
                        thumbnailURL: course.Thumbnail_URL__c,
                        offerings: course.Course_Offerings__r
                            ? course.Course_Offerings__r.records
                            : [],
                        reviews: course.Students_Feedback__r
                            ? course.Students_Feedback__r.records
                            : [],
                        menteesEnrolled: listOfMentees,
                        coursePrice: course.Course_Price__c,
                        paidCourse: course.Paid_Course__c,
                        avgRating: course.Average_review_rating__c
                            ? course.Average_review_rating__c
                            : 0,
                        upcomingSessions: data.upcoming_sessions
                            ? data.upcoming_sessions
                            : [],
                        topMentors: data.top_mentors ? data.top_mentors : [],
                    });
                    setShowLoader(false);
                }
            }
        );
    }, []);


    async function displayRazorpay() {
        debugger;
        const res = await loadScript(process.env.REACT_APP_RAZOR_JS);

        if (!res) {
            alert("Failed to load. Are you online?");
            return;
        }
        firebase
        .auth()
        .currentUser.getIdToken(false)
        .then(function (idToken) {
            menteePost(
                { idToken, uid: auth.uid },
                `${API_CREATE_RAZOR_ORDER}${match.params.courseId}`,
                {
                    studentId: profile.sfid,
                    mEnrolId: selectedMentor.Id,
                    mentorId: selectedMentor.Contact__c,
                    amount: selectedMentor.Mentoring_Fee__c, //courseDetail.coursePrice,
                    stdFbId: auth.uid
                }
            )
                .then((data) => {
                    if (data) {
                        const options = {
                            key: process.env.REACT_APP_RAZOR_KEY,
                            currency: data.currency,
                            amount: data.amount.toString(),
                            order_id: data.id,
                            name: "Course Enrollment",
                            description: courseDetail.name + " Course",
                            image: process.env.REACT_APP_PAYMENT_LOGO,
                            handler: function (data) {
                                console.log(data);
                                debugger;
                                if (data.error) {
                                    setShowLoader(false);
                                    toast.error(
                                        "Enrollment failed ,",
                                        data.error
                                    );
                                } else {
                                    /*let enrollmentsList = [];
                                if (profile.enrollments) {
                                    enrollmentsList = profile.enrollments;
                                }
                                enrollmentsList = [
                                    ...enrollmentsList,
                                    data.result.Id,
                                ];
                                updateCEOnFb({ enrollments: enrollmentsList });*/
                                    toast.success("Payment done");
                                    history.push({
                                        pathname: "/mycourse",
                                        state: {
                                            recache: true,
                                        },
                                    });
                                }
                            },
                            prefill: {
                                name:
                                    profile.firstName + " " + profile.lastName,
                                email: profile.email,
                                phone_number: "",
                            },
                        };
                        const paymentObject = new window.Razorpay(options);
                        paymentObject.open();
                    }
                })
                .catch((error) => {
                    toast.error("Error", error);
                    console.log("Error", error);
                });
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    const handleInput = (e) => {
        setMentorCoursePlan({
            ...mentorCoursePlan,
            [e.target.id]: e.target.value,
        });
        console.log(mentorCoursePlan);
    };

    const handleModalEvent = (type) => {
        if (type === "CLOSE") {
            setShowModal(false);
        } else {
            if (mentorCoursePlan.totalStudent <= 0) {
                setMentorCoursePlanError({
                    totalStudentError: true,
                    priceError: false,
                    startDateError: false,
                    endDateError: false,
                });
            } else if (mentorCoursePlan.price == null) {
                setMentorCoursePlanError({
                    totalStudentError: false,
                    priceError: true,
                    startDateError: false,
                    endDateError: false,
                });
            } else if (mentorCoursePlan.Schedule_Start_Date__c.length < 1) {
                setMentorCoursePlanError({
                    totalStudentError: false,
                    priceError: false,
                    startDateError: true,
                    endDateError: false,
                });
            } else if (mentorCoursePlan.Schedule_End_Date__c.length < 1) {
                setMentorCoursePlanError({
                    totalStudentError: false,
                    priceError: false,
                    startDateError: false,
                    endDateError: true,
                });
            } else if (
                moment(mentorCoursePlan.Schedule_End_Date__c).isSame(
                    moment(mentorCoursePlan.Schedule_Start_Date__c)
                ) &&
                mentorCoursePlan.Schedule_Start_Date__c ===
                    mentorCoursePlan.Schedule_End_Date__c
            ) {
                toast.error("Start and end Time can't be same");
            } else if (
                moment(mentorCoursePlan.Schedule_Start_Date__c).isBefore(
                    moment(Date.now())
                ) ||
                moment(mentorCoursePlan.Schedule_End_Date__c).isBefore(
                    moment(Date.now())
                )
            ) {
                toast.error(
                    "Start Date and End Date should be greater than today"
                );
            } else if (
                moment(mentorCoursePlan.Schedule_Start_Date__c).isAfter(
                    moment(mentorCoursePlan.Schedule_End_Date__c)
                )
            ) {
                toast.error("End Date should be greater than start date");
            } else {
                debugger;
                setShowLoader(true);
                firebase
                    .auth()
                    .currentUser.getIdToken(false)
                    .then(function (idToken) {
                        httpsPOST(
                            { idToken, uid: auth.uid },
                            API_POST_ENROL_COURSE,
                            {
                                Course_Master__c: match.params.courseId,
                                Contact__c: profile.sfid,
                                Students_to_Be_Alloted__c: parseInt(
                                    mentorCoursePlan.totalStudent
                                ),
                                Mentoring_Fee__c: parseInt(
                                    mentorCoursePlan.price
                                ),
                                Schedule_Start_Date__c:
                                    mentorCoursePlan.Schedule_Start_Date__c,
                                Schedule_End_Date__c:
                                    mentorCoursePlan.Schedule_End_Date__c,
                            }
                        )
                            .then((data) => {
                                if (data) {
                                    if (data && data.error) {
                                        toast.error("Error", data.error);
                                        console.log("Error", data.techMsg);
                                    } else {
                                        console.log("MyEnrollments", data);
                                        let wishList = profile.wishList
                                            ? profile.wishList
                                            : [];
                                        const profileWishlistindex =
                                            wishList.findIndex(
                                                (course) =>
                                                    course.Id ===
                                                    match.params.courseId
                                            );
                                        const pWishList = update(wishList, {
                                            $splice: [
                                                [profileWishlistindex, 1],
                                            ],
                                        });
                                        updateProfile({
                                            wishList: pWishList,
                                        });

                                        let enrollmentsList = [];
                                        if (profile.enrollments) {
                                            enrollmentsList =
                                                profile.enrollments;
                                        }
                                        enrollmentsList = [
                                            ...enrollmentsList,
                                            data.id,
                                        ];
                                        updateCEOnFb({
                                            enrollments: enrollmentsList,
                                        });

                                        toast.success(
                                            "Congrats! 🎉 Enrolled new course"
                                        );
                                        history.push({
                                            pathname: "/mycourse",
                                            state: { recache: true },
                                        });
                                    }
                                }
                            })
                            .catch((error) => {
                                toast.error("Error", error);
                                console.log("Error", error);
                            });
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        }
    };

    //STRIPE method commented for now.
    /*const paynow = (stripeToken) => {
        console.log("SELECTEDMENTOR", selectedMentor);
        setPaymentProcessHasStarted(true);
        setShowLoader(true);

        if (selectedMentor.Contact__c !== null) {
            let bodyRequested = {
                courseMasterId: match.params.courseId,
                studentId: profile.sfid,
                stripeToken,
                amount: selectecdMentorPrice,
                mentorId: selectedMentor.Contact__c,
                mentorEnrollId: selectedMentor.Id,
                CE_Status: "Allocated for Mentoring",
            };

            debugger;
            console.log("BodyRequested", bodyRequested);
            firebase
                .auth()
                .currentUser.getIdToken(false)
                .then(function (idToken) {
                    menteePost(
                        { idToken, uid: auth.uid },
                        API_POST_PAYMENT_CHECKOUT,
                        {
                            courseMasterId: match.params.courseId,
                            studentId: profile.sfid,
                            stripeToken,
                            amount: courseDetail.coursePrice,
                            mentorId: selectedMentor.Contact__c,
                            mentorEnrollId: selectedMentor.Id,
                        }
                    ).then((data) => {
                        console.log("MyEnrollments", data);
                        if (data.error) {
                            setShowLoader(false);
                            toast.error("Enrollment failed ,", data.error);
                        } else {
                            let enrollmentsList = [];
                            if (profile.enrollments) {
                                enrollmentsList = profile.enrollments;
                            }

                            enrollmentsList = [
                                ...enrollmentsList,
                                data.result.Id,
                            ];
                            updateCEOnFb({ enrollments: enrollmentsList });

                            if (data) {
                                toast.success("Payment done");

                                history.push({
                                    pathname: "/mycourse",
                                    state: {
                                        recache: true,
                                    },
                                });
                            }
                        }
                    });
                });
        }
    };*/

    const handleEnrolClick = () => {
        checkIfLoggedin();

        if (profile.userType === "student") {
            // if(courseDetail.paidCourse){

            //     history.push({
            //         pathname: `/student/payment/${match.params.courseId}`,
            //         state: {coursePrice: courseDetail.coursePrice,courseDetail:courseDetail},
            //     });
            //     return;
            // }

            setShowLoader(true);
            firebase
                .auth()
                .currentUser.getIdToken(false)
                .then(function (idToken) {
                    httpsPOST(
                        { idToken, uid: auth.uid },
                        API_POST_ENROL_COURSE,
                        {
                            Course_Master__c: match.params.courseId,
                            Contact__c: profile.sfid,
                        }
                    ).then((data) => {
                        if (data) {
                            console.log("MyEnrollments", data);
                            let wishList = profile.wishList
                                ? profile.wishList
                                : [];
                            let enrollmentsList = [];
                            const profileWishlistindex = wishList.findIndex(
                                (course) => course.Id === match.params.courseId
                            );
                            const pWishList = update(wishList, {
                                $splice: [[profileWishlistindex, 1]],
                            });
                            updateProfile({
                                wishList: pWishList,
                            });

                            if (profile.enrollments) {
                                enrollmentsList = profile.enrollments;
                            }
                            try {
                                enrollmentsList = [
                                    ...enrollmentsList,
                                    data.result.Id,
                                ];
                            } catch (e) {
                                enrollmentsList = [...enrollmentsList, data.id];
                            }
                            setShowLoader(false);

                            debugger;
                            updateCEOnFb({ enrollments: enrollmentsList });

                            history.push({
                                pathname: "/mycourse",
                                state: {
                                    recache: true,
                                },
                            });
                        }
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else {
            setShowModal(true);
        }
    };

    const checkIfLoggedin = () => {
        if (!auth.uid) {
            history.push({
                pathname: "/signin",
                state: { callbackUrl: history.location.pathname },
            });
        }
    };

    const handleWishlistClick = () => {
        checkIfLoggedin();
        let wishList = profile.wishList ? profile.wishList : [];
        wishList.push(match.params.courseId);
        updateProfile({
            wishList,
        });
    };

    const addedToWishList = () => {
        if (
            profile.wishList &&
            profile.wishList.includes(match.params.courseId)
        )
            return true;
        else return false;
    };

    const getRating = (rate) => {
        let rateView = [];
        for (let i = 1; i <= 5; i++) {
            if (rate >= i) {
                rateView.push(<FaStar className="text-orange-500" />);
            } else if (rate < i && rate > i - 1) {
                rateView.push(<FaStarHalfAlt className="text-orange-500" />);
            } else {
                rateView.push(<FaRegStar className="text-orange-500" />);
            }
        }
        return rateView;
    };

    const getUpcomingSessions2 = () => {
        return (
            courseDetail.upcomingSessions &&
            courseDetail.upcomingSessions.map((courseEnrollment, index) => {
                console.log("Session", courseEnrollment);
                return (
                    <div class="w-full overflow-hidden py-3 px-2  transform hover:scale-110 motion-reduce:transform-none">
                        <div className="w-full h-20"></div>
                        <div className="group bg-white hover:bg-blue-500 hover:shadow-lg rounded-lg cursor-pointer">
                            <div class="flex justify-center -mt-10">
                                <img
                                    src={
                                        courseEnrollment.Contact__r
                                            .Profile_Picture__c
                                            ? courseEnrollment.Contact__r
                                                  .Profile_Picture__c
                                            : "https://cdn1.iconfinder.com/data/icons/avatar-97/32/avatar-18-512.png"
                                    }
                                    className="rounded-full border-solid border-white border-2 -mt-10 h-20 w-20"
                                    alt="profile"
                                />
                            </div>

                            <div
                                class="text-center px-3 pt-2"
                                onClick={() => {
                                    history.push(
                                        `/mentor/detail/${courseEnrollment.Contact__r.Firebase_Id__c}`
                                    );
                                }}
                            >
                                <h3 class="group-hover:text-white text-gray-600 text-sm">
                                    {courseEnrollment.Contact__r.Name}
                                </h3>

                                <h3 class="group-hover:text-white text-gray-600 text-xs pb-3">
                                    Starting from -{" "}
                                    {courseEnrollment.Schedule_Start_Date__c}
                                </h3>
                                <div className="group-hover:text-white font-semibold text-2xl">
                                    <BiRupee size={23} className="inline" />
                                    {courseEnrollment.Mentoring_Fee__c}/-
                                </div>
                                {/* <p class="mt-2 text-lg group-hover:text-white text-gray-700 bold h-3 font-bold">{mentor.Current_Company__c?mentor.Current_Company__c:""}</p> */}
                            </div>

                            <div class="flex justify-center pb-3">
                                <div
                                    onClick={() => {
                                        selectedMentor = courseEnrollment;
                                        debugger;
                                    }}
                                >
                                    {!courseDetail.menteesEnrolled.includes(
                                        profile.sfid
                                    ) && (
                                        <>
                                            {courseEnrollment.Mentoring_Fee__c ===
                                            0 ? (
                                                <button
                                                    className="cursor-pointer bg-blue-600 group-hover:bg-white group-hover:text-gray-600 text-white font-bold py-2 px-12 rounded w-full mt-2"
                                                    type="submit"
                                                    onClick={() => {
                                                        handleEnrolClick();
                                                    }}
                                                >
                                                    Enrol
                                                </button>
                                            ) : (
                                                // <StripeCheckout
                                                //     stripeKey={KEY}
                                                //     token={paynow}
                                                //     amount={
                                                //         courseEnrollment.Mentoring_Fee__c *
                                                //         100
                                                //     }
                                                //     name="Buy Courses"
                                                // >
                                                //     <button
                                                //         className="cursor-pointer bg-blue-600 group-hover:bg-white group-hover:text-gray-600 text-white font-bold py-2 px-12 rounded w-full mt-2"
                                                //         type="submit"
                                                //         onClick={() => {
                                                //             selectecdMentorPrice =
                                                //                 courseEnrollment.Mentoring_Fee__c;
                                                //             selectedMentor =
                                                //                 courseEnrollment;
                                                //             debugger;
                                                //         }}
                                                //     >
                                                //         Enrol
                                                //     </button>
                                                // </StripeCheckout>
                                                <button
                                                    className="cursor-pointer bg-blue-600 group-hover:bg-white group-hover:text-gray-600 text-white font-bold py-2 px-12 rounded w-full mt-2"
                                                    type="submit"
                                                    onClick={() => {
                                                        selectecdMentorPrice =
                                                            courseEnrollment.Mentoring_Fee__c;
                                                        selectedMentor = courseEnrollment;
                                                        displayRazorpay();
                                                    }}
                                                >
                                                    Enrol
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                                {/* {mentor.Current_Role__c?
                                  <>
                                  <div className="w-full grid grid-cols-2">
                                    <div class="text-center border-r text-base">
                                        <h2 className="group-hover:text-white text-gray-900">{parseInt(mentor.Total_Experience__c/12)} yrs</h2>
                                        <span className="group-hover:text-white text-gray-600">Expirence</span>
                                    </div>
                                    <div class="pr-3 flex items-center justify-center">
                                        <h2 className="text-base group-hover:text-white text-gray-900 font-bold">{mentor.Current_Role__c}</h2>
                                    </div>
                                  </div>
                                </>:
                                <div class="w-full text-center text-base">
                                  <h2 className="group-hover:text-white text-gray-900">{parseInt(mentor.Total_Experience__c/12)} yrs</h2>
                                  <span className="group-hover:text-white text-gray-600">Expirence</span>
                                </div>   
                        } */}
                            </div>
                        </div>
                    </div>
                );
            })
        );
    };

    const getUpcomingSessions = () => {
        return (
            courseDetail.upcomingSessions &&
            courseDetail.upcomingSessions.map((session, index) => {
                return (
                    <div
                        className="flex justify-between w-full mb-2"
                        key={index}
                    >
                        <div className="flex flex-col">
                            <div className="flex flex-row">
                                <span>
                                    <GiRingingAlarm
                                        size={23}
                                        className="inline"
                                    />
                                </span>
                                <span className="text-orange-500 ml-2">
                                    {moment(
                                        session.Schedule_Start_Date__c
                                    ).calendar()}
                                </span>
                            </div>
                            <div className="flex flex-row">
                                <span>
                                    <FaUserFriends
                                        size={23}
                                        className="inline"
                                    />
                                </span>
                                <span className="text-orange-500 ml-2">
                                    {session.Students_to_Be_Alloted__c} slots
                                    left
                                </span>
                            </div>
                            <div className="flex flex-row">
                                <span>
                                    <MdEventNote size={23} className="inline" />
                                </span>
                                <span className="text-orange-500 ml-2">
                                    {session.Total_Sessions__c} Session's
                                </span>
                            </div>
                            <div className="flex flex-row">
                                <span>
                                    <GiTeacher size={23} className="inline" />
                                </span>
                                <span className="text-orange-500 ml-2">
                                    By <b>{session.Contact__r.Name}</b>
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })
        );
    };

    const getTopMentors = () => {
        return (
            courseDetail.topMentors &&
            courseDetail.topMentors.map((mentor, index) => {
                console.log("MENTORS", mentor);
                return (
                    <div
                        className="flex justify-between w-full mb-2"
                        key={index}
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                                <img
                                    className="h-12 w-12 rounded-full"
                                    src={
                                        mentor.contact_details
                                            .Profile_Picture__c
                                            ? mentor.contact_details
                                                  .Profile_Picture__c
                                            : "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"
                                    }
                                    alt=""
                                />
                            </div>
                            <div className="ml-2">
                                <div className="text-md font-medium text-orange-500">
                                    {mentor.contact_details.Name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {mentor.contact_details.Email}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })
        );
    };

    const coursePlanContentc = () => {
        return (
            <div class="grid  gap-8 grid-cols-1">
                <div class="flex flex-col ">
                    <div class="flex flex-col sm:flex-row items-center">
                        <h2 class="font-semibold md:text-lg text-base mr-auto">
                            Create Course Plan
                        </h2>
                    </div>
                    <div class="md:mt-2">
                        <div class="form">
                            <div class="md:space-y-2 md:mb-3">
                                <div class="flex  py-3">
                                    <div class="md:w-20 md:h-20 h-12 w-12 mr-4 flex-none rounded-xl border overflow-hidden">
                                        <img
                                            class="md:w-20 md:h-20 h-12 w-12 mr-4 object-cover"
                                            src={
                                                courseDetail.thumbnailURL
                                                    ? courseDetail.thumbnailURL
                                                    : "https://images.unsplash.com/photo-1532622785990-d2c36a76f5a6?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
                                            }
                                            alt="Avatar Upload"
                                        />
                                    </div>
                                    <div>
                                        <h1 className="md:text-base text-base">
                                            {courseDetail.name}
                                        </h1>
                                        <h1 className="text-xs md:mt-2 text-gray-600">
                                            {courseDetail.shortDescription}
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                <div class="mb-3 md:space-y-2 w-full text-xs">
                                    <label class="font-semibold text-gray-600 py-2">
                                        Total Student Seats
                                    </label>
                                    <input
                                        id="totalStudent"
                                        onChange={handleInput}
                                        value={mentorCoursePlan.totalStudent}
                                        placeholder="Students in your batch"
                                        className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                                        required="required"
                                        type="number"
                                    />
                                    {mentorCoursePlanError.totalStudentError && (
                                        <h1 className="text-xs text-red-500">
                                            Enter seats
                                        </h1>
                                    )}
                                </div>
                                {courseDetail.paidCourse && (
                                    <div class="md:mb-3 md:space-y-2 w-full text-xs">
                                        <label class="font-semibold text-gray-600 py-2">
                                            Course Price
                                        </label>
                                        <input
                                            placeholder="Choose price"
                                            className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4 text-base"
                                            required="required"
                                            id="price"
                                            type="number"
                                            onChange={handleInput}
                                            value={mentorCoursePlan.price}
                                        />
                                        {mentorCoursePlanError.priceError && (
                                            <h1 className="text-xs text-red-500">
                                                Choose price
                                            </h1>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div class="md:flex md:flex-row md:space-x-4 w-full text-xs">
                                <div class="w-full flex flex-col md:mb-3">
                                    <label class="font-semibold text-gray-600 md:py-2 pt-2">
                                        Course Start Date
                                    </label>
                                    <input
                                        id="Schedule_Start_Date__c"
                                        class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                                        type="date"
                                        placeholder="Session Start Date"
                                        onChange={handleInput}
                                        value={
                                            mentorCoursePlan.Schedule_Start_Date__c
                                        }
                                    />
                                    {mentorCoursePlanError.startDateError && (
                                        <h1 className="text-xs text-red-500">
                                            Choose Start Date
                                        </h1>
                                    )}
                                </div>
                                <div class="w-full flex flex-col mb-3">
                                    <label class="font-semibold text-gray-600 md:py-2 pt-2">
                                        Course End Date
                                    </label>
                                    <input
                                        id="Schedule_End_Date__c"
                                        type="date"
                                        class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                                        placeholder="Session End date"
                                        onChange={handleInput}
                                        value={
                                            mentorCoursePlan.Schedule_End_Date__c
                                        }
                                    />
                                    {mentorCoursePlanError.endDateError && (
                                        <h1 className="text-xs text-red-500">
                                            Choose End Date
                                        </h1>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Base
            history={history}
            pathList={[
                { to: "/", name: "Home" },
                { to: "#", name: courseDetail.name },
            ]}
        >
            {showLoader ? (
                <div className="container mx-auto py-4 md:px-12">
                    <div className="flex items-center justify-center h-3/6">
                        <LoaderLarge type="ThreeDots" />
                    </div>
                    {paymentProcessHasStarted && (
                        <h1 className="text-center">
                            Wait a while, Do not refresh this page <br /> you'll
                            redirect to the course as soon payment process
                            finished
                        </h1>
                    )}
                </div>
            ) : (
                <div className="container md:mx-auto md:grid md:grid-cols-3 md:gap-16 py-4 md:px-12 max-w-7xl">
                    <div className="col-span-2">
                        <div className="c-card block bg-white shadow-md hover:shadow-xl rounded-lg overflow-hidden p-4">
                            <p className="text-2xl">{courseDetail.name}</p>
                            <div className="mt-4">
                                {courseDetail.shortDescription}
                            </div>
                            <div className="mt-4">
                                {renderHTML(courseDetail.description)}
                            </div>
                        </div>
                        {courseDetail.offerings &&
                            courseDetail.offerings.length > 0 && (
                                <div className="c-card block bg-white shadow-md hover:shadow-xl rounded-lg overflow-hidden md:p-4 mt-4 p-4">
                                    <Accordion
                                        questionsAnswers={
                                            courseDetail.offerings
                                        }
                                    />
                                </div>
                            )}

                        {courseDetail.reviews &&
                            courseDetail.reviews.length > 0 && (
                                <div className="c-card block bg-white shadow-md hover:shadow-xl rounded-lg overflow-hidden p-4 mt-4">
                                    <h2 className="faq__title text-2xl">
                                        Student Reviews
                                    </h2>
                                    {courseDetail.reviews &&
                                        courseDetail.reviews.map(
                                            (review, index) => {
                                                return (
                                                    <>
                                                        <div
                                                            className="grid grid-cols-6 pt-6"
                                                            key={index}
                                                        >
                                                            <div className="col-span-1 flex justify-center">
                                                                <div
                                                                    className="rounded-full text-white flex items-center justify-center w-16 h-16 font-bold"
                                                                    style={{
                                                                        backgroundColor:
                                                                            randomColor(
                                                                                {
                                                                                    luminosity:
                                                                                        "bright",
                                                                                    hue: "random",
                                                                                }
                                                                            ),
                                                                    }}
                                                                >
                                                                    {
                                                                        review
                                                                            .Given_By__r
                                                                            .Initials__c
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="col-span-5">
                                                                <div className="font-medium text-gray-600">
                                                                    {`${review.Given_By__r.FirstName} ${review.Given_By__r.LastName}`}
                                                                </div>
                                                                <div className="mt-2">
                                                                    <div className="flex gap-1 items-center">
                                                                        {getRating(
                                                                            review.Student_Rating__c
                                                                        )}
                                                                        <span className="text-gray-500 text-xs">
                                                                            {moment(
                                                                                review.CreatedDate
                                                                            ).calendar()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2">
                                                                    <p className="text-xs">
                                                                        {
                                                                            review.Description__c
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {index !==
                                                            courseDetail.reviews
                                                                .length -
                                                                1 && (
                                                            <hr className="mt-2 bg-gray-600" />
                                                        )}
                                                    </>
                                                );
                                            }
                                        )}
                                </div>
                            )}
                    </div>
                    <div className="col-span-1">
                        {/* formobileUI */}
                        <div
                            className="md:hidden w-full sticky bottom-0 z-50 flex flex-col rounded-lg bg-white p-2"
                            style={{ position: "fixed", bottom: 0 }}
                        >
                            <div className="flex flex-row">
                                <img
                                    className="h-20 w-20 object-cover"
                                    src={
                                        courseDetail.thumbnailURL
                                            ? courseDetail.thumbnailURL
                                            : "https://via.placeholder.com/350"
                                    }
                                    alt="Thumbnail"
                                />

                                {location.state === undefined &&
                                    profile.userType !== "instructor" &&
                                    auth.uid && (
                                        <div className="flex flex-col ml-2 w-full mr-2 justify-center">
                                            <button
                                                className={`bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 border border-orange-800 rounded w-full ${
                                                    addedToWishList()
                                                        ? "hidden"
                                                        : ""
                                                }`}
                                                onClick={handleWishlistClick}
                                            >
                                                Add to Wishlist
                                            </button>
                                            {courseDetail.upcomingSessions
                                                .length === 0 &&
                                                !courseDetail.menteesEnrolled.includes(
                                                    profile.sfid
                                                ) && (
                                                    <button
                                                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 border border-purple-800 rounded w-full mt-2"
                                                        onClick={
                                                            handleEnrolClick
                                                        }
                                                    >
                                                        Pre-Enrol
                                                    </button>
                                                )}
                                        </div>
                                    )}
                                {location.state === undefined &&
                                    ((profile.userType === "instructor" &&
                                        auth.uid) ||
                                        !auth.uid) && (
                                        <div className="flex flex-col ml-2 w-full mr-2 justify-center">
                                            <button
                                                className={`bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 border border-orange-800 rounded w-full ${
                                                    addedToWishList()
                                                        ? "hidden"
                                                        : ""
                                                }`}
                                                onClick={handleWishlistClick}
                                            >
                                                Add to Wishlist
                                            </button>

                                            <button
                                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 border border-purple-800 rounded w-full mt-2"
                                                onClick={handleEnrolClick}
                                            >
                                                Enrol
                                            </button>
                                        </div>
                                    )}
                            </div>

                            {courseDetail.paidCourse && (
                                <div className="flex flex-col justify-start">
                                    {(!auth.uid ||
                                        (profile.userType === "student" &&
                                            auth.uid)) &&
                                    location.state === undefined ? (
                                        <div className="font-semibold text-2xl">
                                            <BiRupee
                                                size={23}
                                                className="inline"
                                            />
                                            {courseDetail.coursePrice}/-
                                        </div>
                                    ) : null}

                                    <div className="flex gap-1 items-center">
                                        {getRating(courseDetail.avgRating)}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="md:c-card md:block md:bg-white md:shadow-md hover:shadow-xl md:rounded-lg md:overflow-hidden hidden">
                            <div className="relative pb-48 overflow-hidden">
                                <img
                                    className="absolute inset-0 h-full w-full object-cover"
                                    src={
                                        courseDetail.thumbnailURL
                                            ? courseDetail.thumbnailURL
                                            : "https://via.placeholder.com/350"
                                    }
                                    alt="Thumbnail"
                                />
                            </div>
                            <div className="p-4">
                                {courseDetail.paidCourse && (
                                    <div className="flex justify-between">
                                        {/* {
                                            ((!auth.uid) || (profile.userType === "student" && auth.uid)) && location.state===undefined?
                                            <div className="font-semibold text-2xl">
                                                <BiRupee
                                                    size={23}
                                                    className="inline"
                                                />
                                                {courseDetail.coursePrice}/-
                                            </div>:
                                            null
                                        } */}

                                        <div className="flex gap-1 items-center">
                                            {getRating(courseDetail.avgRating)}
                                        </div>
                                    </div>
                                )}
                                <div className="mt-4"></div>

                                {location.state === undefined &&
                                    profile.userType !== "instructor" &&
                                    auth.uid && (
                                        <>
                                            <button
                                                className={`bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 border border-orange-800 rounded w-full  ${
                                                    addedToWishList()
                                                        ? "hidden"
                                                        : ""
                                                }`}
                                                onClick={handleWishlistClick}
                                            >
                                                Add to Wishlist
                                            </button>
                                            {courseDetail.upcomingSessions
                                                .length === 0 &&
                                                !courseDetail.menteesEnrolled.includes(
                                                    profile.sfid
                                                ) && (
                                                    <button
                                                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 border border-purple-800 rounded w-full mt-2"
                                                        onClick={
                                                            handleEnrolClick
                                                        }
                                                    >
                                                        Pre-Enrol
                                                    </button>
                                                )}
                                        </>
                                    )}
                                {location.state === undefined &&
                                    ((profile.userType === "instructor" &&
                                        auth.uid) ||
                                        !auth.uid) && (
                                        <>
                                            <button
                                                className={`bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 border border-orange-800 rounded w-full ${
                                                    addedToWishList()
                                                        ? "hidden"
                                                        : ""
                                                }`}
                                                onClick={handleWishlistClick}
                                            >
                                                Add to Wishlist
                                            </button>
                                            <button
                                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 border border-purple-800 rounded w-full mt-2"
                                                onClick={handleEnrolClick}
                                            >
                                                Enrol
                                            </button>
                                        </>
                                    )}
                            </div>
                        </div>

                        {/* upcoming sessions */}
                        {courseDetail.upcomingSessions &&
                            courseDetail.upcomingSessions.length > 0 && (
                                <div className="c-card block bg-white shadow-md hover:shadow-xl rounded-lg overflow-hidden mt-8">
                                    <center className="mt-4">
                                        <p className="text-xl">
                                            Upcoming Sessions
                                        </p>
                                    </center>
                                    <hr className="mt-3" />
                                    <div className="flex items-center flex-col p-4 md:mb-0 mb-28">
                                        {profile.userType === "student" ? (
                                            <>{getUpcomingSessions2()}</>
                                        ) : (
                                            <>{getUpcomingSessions()}</>
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* top mentors */}
                        {courseDetail.topMentors &&
                            courseDetail.topMentors.length > 0 && (
                                <div className="c-card block bg-white shadow-md hover:shadow-xl rounded-lg overflow-hidden mt-8">
                                    <center className="mt-4">
                                        <p className="text-xl">Top Mentors</p>
                                    </center>
                                    <hr className="mt-3" />
                                    <div className="flex items-center p-4 flex-col">
                                        {getTopMentors()}
                                    </div>
                                </div>
                            )}
                        {/* {showModal?
                         <CourseEnrollPrice
                         title="Choose Course details"
                         handleEvent={handleModalEvent}
                         showModal={showModal}
                        >
                         {coursePlanContent()}
                     </CourseEnrollPrice>:null
                    } */}
                        {showModal ? (
                            <CommonDetailModal
                                showModal={showModal}
                                handleEvent={handleModalEvent}
                            >
                                {coursePlanContentc()}
                            </CommonDetailModal>
                        ) : null}
                    </div>
                </div>
            )}
        </Base>
    );
};

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateProfile: (userProfile) =>
            dispatch(updateUserProfile(userProfile, false)),
        updateCEOnFb: (myEnrollments) =>
            dispatch(updateMyEnrollOnFirebase(myEnrollments, false)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseDetail);