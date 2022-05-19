import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import { httpsGET } from "../../backend_api/mentorAPI";
import { httpsPOST } from "../../backend_api/menteeAPI"
import { API_GET_MY_COURSE, API_POST_COURSE_REVIEW} from "../../backend";
import { LoaderLarge } from "../ui_utilities/Loaders";
import { FaStar, FaStarHalfAlt, FaRegStar, FaUserTie, FaRegCalendarAlt } from "react-icons/fa";
import Base from "../Base";
import ReviewRatingModal from "../mentee/Modal/ReviewRatingModal";
import update from "immutability-helper";
import { toast } from "react-toastify";
import ShowMoreText from "react-show-more-text";
import { updateMyEnrollment } from "../../store/actions/appActions";
import { firebase } from "../../config/fbConfig";
import ReactStars from "react-stars";
import {PATH_MY_ENROLMENT} from "../path_constants";
import moment from "moment";
import { BiPlay } from "react-icons/bi";

const MyCourse = ({
    auth,
    profile,
    history,
    cacheEnrollments,
    rEnrollments,
    location
}) => {

    console.log("AUth ",auth)
    const [myCourse, setMyCourse] = useState({
        enrollments: [],
    });

    console.log("History ",history)

    const [showLoader, setShowLoader] = useState(true);
    const [showRatingModal, SetShowRatingModal] = useState(false);
    const [review, setReview] = useState("");
    const [star, setStar] = useState(0);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [commentNullError, setCommentNullError] = useState(false);
    const [ratingNullError, setRatingNullError] = useState(false);

    useEffect(() => {
        if (
            rEnrollments &&
            rEnrollments.length > 0 &&
            (!location.state || !location.state.recache)
        ) {
            setMyCourse({
                ...myCourse,
                enrollments: rEnrollments,
            });
            setShowLoader(false)
            debugger;
        } else {
            firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsGET({idToken, uid:auth.uid}, `${API_GET_MY_COURSE}${profile.sfid}`).then(
                    (data) => {
                        if (data && data.length > 0) {
                            console.log("MyCourse", data);
                            setMyCourse({
                                ...myCourse,
                                enrollments: data,
                            });
                            cacheEnrollments(data);
                        }
                        debugger;
                        setShowLoader(false);
                    }
                );
            });
            
        }
        
    }, []);

    const goToSchedule = (courseId, enrolId, courseMasterDetail) => {
        history.push({
            pathname: `/courseschedule/${courseId}/${enrolId}`,
            state:courseMasterDetail
        })
    };

    const viewStudents = (courseId) => {
        history.push(`/viewstudents/${courseId}/${profile.sfid}`);
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

    const onRatingClick = (course) => {
        console.log("Course Rating clicked",course)
        setStar(course.course_review ? course.course_review.Student_Rating__c : 0);
        setReview(
            course.course_review
                ? course.course_review.Description__c
                : null
        );
        setSelectedCourse(course);
        SetShowRatingModal(true);
    };

    if (!auth.uid) return <Redirect to="/signin" />;

    const enrolledCourse = () => {
        if (myCourse.enrollments && myCourse.enrollments.length > 0) {
            return myCourse.enrollments.map((enrollment, index) => {
                let progress =   enrollment.course_enrollment.Session_Percentage__c ? enrollment.course_enrollment.Session_Percentage__c :0

                return (
                    <div
                        className="group hover:bg-blue-500  hover:shadow-lg md:mx-auto bg-white rounded-xl shadow-md overflow-hidden border-r-8  hover:border-purple-700 md:max-w-2xl md:mt-10 w-full mb-3 transform hover:scale-110 motion-reduce:transform-none"
                        key={index}
                    >

                        <div className="md:flex">
                            <div className="md:flex-shrink-0">
                                <div className="h-48 w-full object-cover md:h-full md:w-48 relative">
                                    <img
                                        className="h-48 w-full object-cover md:h-full md:w-48"
                                        src={
                                            enrollment.course_enrollment
                                                .Course_Master__r.Thumbnail_URL__c
                                                ? enrollment.course_enrollment
                                                        .Course_Master__r
                                                        .Thumbnail_URL__c
                                                : "https://via.placeholder.com/200"
                                        }
                                        alt={
                                            enrollment.course_enrollment
                                                .Course_Master__r.Name
                                        }
                                    />
                                    {/* <div className="bg-gray-600">
                                        <BiPlay size={70} className="absolute top-1/4 left-1/4 text-white"/>
                                    </div> */}
                                </div>
                            </div>
                            <div className="p-6 w-full">
                                <div>
                                    <div className="uppercase tracking-wide text-md group-hover:text-white text-gray-600 font-semibold">
                                        {
                                            enrollment.course_enrollment
                                                .Course_Master__r.Name
                                        }
                                    </div>
                                    {enrollment.course_enrollment
                                        .Course_Master__r
                                        .Short_Description__c ? (
                                        <ShowMoreText
                                            lines={2}
                                            more={
                                                <h3 className="text-orange-800 text-sm underline group-hover:text-white">
                                                    Show More
                                                </h3>
                                            }
                                            less={
                                                <h3 className="text-orange-800 text-sm underline group-hover:text-white">
                                                    Show Less
                                                </h3>
                                            }
                                            className="text-sm mt-1 group-hover:text-white text-gray-600"
                                            anchorClass="my-anchor-css-class"
                                            expanded={false}
                                            truncatedEndingComponent={"... "}
                                        >
                                            {
                                                enrollment.course_enrollment
                                                    .Course_Master__r
                                                    .Short_Description__c
                                            }
                                        </ShowMoreText>
                                    ) : <></>}

                                {enrollment.course_enrollment.Mentor__c && profile.userType==="student" && 
                                    <span className="flex items-center mt-2">
                                        <FaUserTie
                                            className="inline mr-1 text-gray-500 group-hover:text-white"
                                            size={18}
                                        />
                                        {enrollment.course_enrollment.Mentor__r.Name}
                                    </span>
                                }

                                {enrollment.course_enrollment.Enrollment_Date__c && profile.userType==="student" && 
                                    <span className="flex items-center mt-2 group-hover:text-white">
                                        <FaRegCalendarAlt
                                            className="inline mr-1 text-gray-500 group-hover:text-white"
                                            size={18}
                                        />
                                        Enrolled on: <h1 className="text-xs text-gray-600 ml-1 group-hover:text-white"> {moment(enrollment.course_enrollment.Enrollment_Date__c).calendar()}</h1>
                                    </span>
                                }
                                    {((enrollment.course_enrollment.Mentor__c && profile.userType==="student") || (profile.userType==="instructor")) &&   
                                         <div
                                         className="inline-block px-2 py-1 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs mt-4 cursor-pointer"
                                         onClick={() =>
                                             !enrollment.course_enrollment
                                                 .Mentor__c &&
                                             profile.userType === "student"
                                                 ? toast.error(
                                                       "Mentor not assigned"
                                                   )
                                                 : goToSchedule(
                                                         enrollment
                                                             .course_enrollment
                                                             .Course_Master__c,
                                                         enrollment
                                                             .course_enrollment.Id,
                                                         {name:enrollment.course_enrollment
                                                             .Course_Master__r.Name,thumbnailUrl:enrollment.course_enrollment
                                                             .Course_Master__r.Thumbnail_URL__c }    
                                                         
                                                   )
                                         }
                                     >
                                         {profile.userType === "student"
                                             ? enrollment.course_enrollment
                                                   .Total_Session_of_Students__c
                                             : enrollment.course_enrollment
                                                   .Total_Sessions__c}
                                         {" sessions"}
                                     </div>
                                    }

                                    {profile.userType === "instructor" ? (
                                        <>
                                            <div
                                                className="inline-block px-2 py-1 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs mt-4 ml-2 cursor-pointer"
                                                onClick={() =>
                                                    viewStudents(
                                                        enrollment
                                                            .course_enrollment
                                                            .Course_Master__c
                                                    )
                                                }
                                            >
                                                {console.log("Student Enrolled",enrollment.course_enrollment.Students_Enrolled__c)}
                                                {enrollment.course_enrollment
                                                    .Students_Enrolled__c !=
                                                    null &&
                                                enrollment.course_enrollment
                                                    .Students_Enrolled__c === 1
                                                    ? `${enrollment.course_enrollment.Students_Enrolled__c} Student Enrolled`
                                                    : `${enrollment.course_enrollment.Students_Enrolled__c} Students Enrolled`}
                                            </div>

                                        </>
                                    ) : null}

                                    {profile.userType === "student" ? (
                                        <div
                                            className="inline-block px-2 py-1 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs mt-4 ml-2 cursor-pointer"
                                            onClick={() =>
                                                !enrollment.course_enrollment
                                                    .Mentor__c?toast("As mentor not assigned yet, you can't rate this course! 😔"):
                                                onRatingClick(enrollment)
                                            }
                                        >
                                            {enrollment.course_review ? (
                                                <div className="flex gap-1 items-center">
                                                   {getRating(
                                                        enrollment.course_review
                                                            .Student_Rating__c
                                                    )}
                                                </div>
                                            ) : (
                                                "Rate this course"
                                            )}
                                        </div>
                                    ) : null}

                                        <div
                                                className="inline-block px-2 py-1 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs mt-4 ml-2 cursor-pointer"
                                                onClick={() =>
                                                    
                                                    {
                                                        if(profile.userType==="student"){
                                                            !enrollment.course_enrollment
                                                            .Mentor__c?history.push({pathname:`course/detail/${enrollment.course_enrollment.Course_Master__c}`,state:"courseHasEnrolled"}):
                                                            history.push({
                                                                pathname: `/content/${enrollment
                                                                    .course_enrollment
                                                                    .Course_Master__c}/${ enrollment
                                                                        .course_enrollment.Id}`,
                                                                state: {courseEnrollment: enrollment.course_enrollment},
                                                            });
                                                        
                                                        }else{
                                                            history.push({
                                                                pathname: `/content/${enrollment
                                                                    .course_enrollment
                                                                    .Course_Master__c}/${ enrollment
                                                                        .course_enrollment.Id}`,
                                                                state: {courseEnrollment: enrollment.course_enrollment},
                                                            });
                                                        }
                                                        
                                                    }
                                                }
                                            >
                                              schedule
                                            </div>
                                            {profile.userType==="instructor"?
                                            <div
                                                className="inline-block px-2 py-1 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs mt-4 ml-2 cursor-pointer"
                                                onClick={() => {
                                                    history.push(`/learn/${enrollment.course_enrollment.Id}`)
                                                }}
                                            >
                                                Lessons
                                            </div>:
                                            <>
                                                { enrollment.course_enrollment
                                                    .Mentor__c &&
                                                    <div
                                                        className="inline-block px-2 py-1 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs mt-4 ml-2 cursor-pointer"
                                                        onClick={() => {
                                                            history.push(`/learn/${enrollment.course_enrollment.Id}`)
                                                        }}
                                                    >
                                                    Lessions
                                                    </div>
                                                }
                                            </>
                                        }      
                                           
                                </div>

                                <div className="mt-6">
                                    <hr />
                                    <div className="flex mb-2 items-center justify-between mt-2">
                                        <div>
                                            {progress === 100 ? (
                                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-purple-500 group-hover:bg-purple-700">
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-purple-200 group-hover:bg-purple-700">
                                                    In Progress
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-semibold inline-block text-purple-600 group-hover:bg-purple-700 group-hover:text-white">
                                                {progress}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200 group-hover:bg-purple-700">
                                        <div
                                            style={{ width: `${progress}%` }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 group-hover:bg-purple-700"
                                        ></div>
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
                //     <p className="ml-4">You have not enrolled to any Course.</p>
                // </div>

                <div className="flex items-center justify-center mt-10 p-4 mt-10">
                    <div className="flex flex-col bg-white pb-3">
                    <img src="https://imgproxy.epicpxls.com/UuwJaK46rwY9p05lYVnY0_PyKy8GP2VMPn6u9LndL1c/rs:fill:800:600:0/g:no/aHR0cHM6Ly9pdGVt/cy5lcGljcHhscy5j/b20vdXBsb2Fkcy9w/aG90by9jMzM4Y2Vl/NGQ2NmI4ZGI2MTQ2/MTMxYjAzN2RlNDc4/MA.jpg" alt="no course enrolled" />
                    <h1 className="text-center text-gray-500">No Course Enrolled yet, <br/>   <Link
                to={`/`}
                className="hover:overflow-hidden"
            >Enroll new course!</Link></h1>
                    </div>
                </div>
            );
        }
    };
   
    const ratingReviewsContent = () => {
        return (
            <div>
                <div className="w-full flex flex-col items-center" >
        <div className ="flex flex-col items-center md:py-6 space-y-3">
          <span className ="text-lg text-gray-800 text-center ">How much you liked this course?</span>
          <div class="flex space-x-3">
            <ReactStars
                count={5}
                size={42}
                value={star}
                edit={selectedCourse && selectedCourse.course_review
                    ? false
                    : true}
                onChange={(new_rating)=>setStar(new_rating)}    
                color2={'#ffd700'} />
          </div>
        </div>
        <div class="w-3/4 flex flex-col">
          <textarea type="text" id="rating"  disabled={
                            selectedCourse && selectedCourse.course_review
                                ? true
                                : false
                        }  onChange={(e) => setReview(e.target.value)}
                        placeholder="Leave a message, if you want"
                        value={review} rows="3" class="p-4 text-gray-500 rounded-xl resize-none"></textarea>
                        {commentNullError ? (
                        <p className="text-red-500">Please Write some review</p>
                    ) : null}
          <button class="md:py-3 py-2 md:my-8 my-5 text-lg bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white" onClick={()=>handleOfferingEvent("SAVE")}>Rate now</button>
        </div>
        {ratingNullError ? (
                        <p className="text-indigo-500">Please give star</p>
                    ) : null}
      </div>
      
                </div>
        );
    };

    const handleOfferingEvent = (type) => {
        console.log("Selected course ",selectedCourse)
        if (type === "CLOSE") {
            SetShowRatingModal(false);
        } else if (type === "SAVE" && selectedCourse.course_review) {
            toast.error("Comment Already committed");
        } else if (type === "SAVE" && !review) {
            setCommentNullError(true);
        } else if (type === "SAVE" && star < 0.5) {
            setRatingNullError(true);
        } else if (type === "SAVE" && !selectedCourse.course_review) {

            const course_review = {
                Course_Master__c:selectedCourse.course_enrollment.Course_Master__r.Id,
                Description__c:review,
                Student_Rating__c:star,
                Mentor_Course_Enrollment__c:selectedCourse.course_enrollment.Mentor_Course_Enrollment__c,
                Student_Course_Enrollment__c:selectedCourse.course_enrollment.Id,
                Given_By__c:selectedCourse.course_enrollment.Contact__c
            };

            console.log("Review Body ", course_review);
            firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsPOST({idToken,uid:auth.uid}, `${API_POST_COURSE_REVIEW}`, course_review).then(
                    (response) => {
                        if (response && response.error) {
                            toast.error("Couldn't add Comment");
                            console.log(response.techMsg);
                        } else if (response) {
                            course_review.Id = response.id;
                            const index = myCourse.enrollments.findIndex(
                                (course) =>
                                    course.course_enrollment.Id ===
                                    selectedCourse.course_enrollment.Id
                            );

                            const updatedEnrollments = update(
                                myCourse.enrollments,
                                {
                                    $splice: [
                                        [
                                            index,
                                            1,
                                            {
                                                course_review: course_review,
                                                course_enrollment:
                                                    selectedCourse.course_enrollment,
                                            },
                                        ],
                                    ],
                                }
                            );

                            setMyCourse({
                                ...myCourse,
                                enrollments: updatedEnrollments,
                            });

                            debugger;
                            console.log(response);
                            toast.success("Comment created");
                        }
                        SetShowRatingModal(false);
                    }
                );
        })
        }
    };

    return (
        <Base history={history} activeTabName="My Enrolment" pathList = {PATH_MY_ENROLMENT}>
            <div className="container mx-auto py-4 md:px-12 px-3">
                <center>
                    <h3>My Enrollments</h3>
                </center>
                {showLoader ? (
                    <div className="flex items-center justify-center h-3/6">
                        <LoaderLarge type="ThreeDots" />
                    </div>
                ) : (
                    <>
                    {enrolledCourse()}
                    <ReviewRatingModal
                            title="Your opinion matter to us !"
                            handleEvent={handleOfferingEvent}
                            showModal={showRatingModal}
                        >
                            { ratingReviewsContent() }
                        </ReviewRatingModal>
                    </>
                )}
            </div>
        </Base>
    );
};

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile,
        rEnrollments: state.app.enrollments,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        cacheEnrollments: (enrollments) =>
            dispatch(updateMyEnrollment(enrollments)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyCourse);
