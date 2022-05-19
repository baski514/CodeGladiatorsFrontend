import React, { useState, useEffect } from "react";
import Card from "../ui_utilities/TCourseCard";
import { httpsGET } from "../../backend_api/mentorAPI";
import { API_GET_COURSE } from "../../backend";
import Slider from "react-slick";
import Corousal from "../ui_utilities/Corousal";
import { LoaderLarge } from "../ui_utilities/Loaders";
import { connect } from "react-redux";
import Footer from "../ui_utilities/Footer";
import { updateMasterCourse } from "../../store/actions/appActions";
import { GrPlayFill } from "react-icons/gr";
import { ImStarFull, ImInfinite } from "react-icons/im";
import renderHTML from "react-render-html";
import { Redirect } from "react-router-dom";

const MentorDashboard = ({ sfid, profile, updateMCourse, rCourse, rDailyUpdates, courseMasterList, mentorList}) => {
    const [categories, setCategories] = useState([]);
    const [dailyUpdate, setDailyUpdate] = useState([]);
    const [error, setError] = useState(false);
    const [loader, setLoader] = useState(true);
    const [numberOFCourseMaster,setNoOfCourseMaster] = useState(0);
    const [numberOfMentors,setNumberOfMentors] = useState(0);

    const loadAllCourses = () => {
        if (rCourse && rCourse.length > 0) {
            setCategories(rCourse);
            setDailyUpdate(rDailyUpdates);
            setNoOfCourseMaster(courseMasterList.length)
            setNumberOfMentors(mentorList.length)
        }else{
            httpsGET(null, `${API_GET_COURSE}${sfid ? sfid : "noid"}`).then(
                (data) => {
                    debugger;
                    console.log('SF RESPONSE-',data);
                    if (data && data.error) {
                        setError(data.error);
                    } else if (data) {
                        setCategories(data.cetegories);
                        setDailyUpdate(data.dailyUpdate);
                        setNoOfCourseMaster(data.courseMasterList.length);
                        setNumberOfMentors(data.all_mentors.length)
                    }
                    updateMCourse(data.cetegories, data.dailyUpdate, data.all_mentors, data.courseMasterList);
                }
            );
        }
        setLoader(false);
    };

    function SampleNextArrow(props) {
        const { className, style, onClick } = props;
        debugger;
        return (
            <button
                className={className}
                style={{
                    ...style,
                    display: "block",
                    width: "47px",
                    height: "47px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(63, 63, 70, 1)",
                    boxShadow:
                        "0 0 1px 1px rgba(20,23,28,.1), 0 3px 1px 0 rgba(20,23,28,.1)",
                    zIndex: "1",
                    top: "calc( 50% - 25px)",
                }}
                onClick={onClick}
            />
        );
    }

    function SamplePrevArrow(props) {
        const { className, style, onClick } = props;
        return (
            <button
                className={className}
                style={{
                    ...style,
                    display: "block",
                    width: "47px",
                    height: "47px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(63, 63, 70, 1)",
                    boxShadow:
                        "0 0 1px 1px rgba(20,23,28,.1), 0 3px 1px 0 rgba(20,23,28,.1)",
                    zIndex: "1",
                    top: "calc( 50% - 25px)",
                }}
                onClick={onClick}
            />
        );
    }

    const handleClick = (url) => {
        window.open(url);
    };
    

    var settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 4,
        initialSlide: 0,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true,
                },
            },
            {
                breakpoint: 760,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    initialSlide: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    useEffect(() => {
        loadAllCourses();
    }, []);

    const checkIfmarkedAsWish = (courseId) => {
        return profile.wishList && profile.wishList.includes(courseId);
    };

    const highlighterBar = () => {
        return (
            <div className="grid grid-cols-3 p-2">
                <div className="flex justify-center items-center">
                    <span className="bg-gray-300 rounded-full p-3">
                        <GrPlayFill size={20} />{" "}
                    </span>
                    <p className="ml-2 font-semibold">
                        Learn in-demand skills with over {numberOfMentors} mentors
                    </p>
                </div>
                <div className="flex justify-center items-center">
                    <span className="bg-gray-300 rounded-full p-3">
                        <ImStarFull size={20} />{" "}
                    </span>
                    <p className="ml-2 font-semibold">
                        Choose courses taught by real-world experts
                    </p>
                </div>
                <div className="flex justify-center items-center">
                    <span className="bg-gray-300 rounded-full p-3">
                        <ImInfinite size={20} />{" "}
                    </span>
                    <p className="ml-2 font-semibold">
                        Learn at your own pace, with lifetime access on mobile
                        and desktop
                    </p>
                </div>
            </div>
        );
    }

    const instructorView = () => {
        return (
            <div className="flex justify-center items-center">
                <div>
                    <img
                        src="https://s.udemycdn.com/home/non-student-cta/instructor-1x-v3.jpg"
                        alt="mentor"
                    />
                </div>
                <div className="ml-4">
                    <h3 className="text-4xl font-semibold">
                        Become an Instructor
                    </h3>
                    <p className="">
                        If you have passion of training engineering graduates 
                        and want to change the way skills are being imparted, 
                        Join us.
                    </p>
                    {/* <a href = "https://codegladiators.in/mentor-creation" 
                        className="mt-4 bg-gray-700 py-4 px-8 text-white font-bold uppercase text-xs rounded hover:bg-black"
                        target="_blank">
                        Start teaching today
                    </a> */}
                    <button className="mt-4 bg-gray-700 py-4 px-8 text-white font-bold uppercase text-xs rounded hover:bg-black" onClick={()=>handleClick("https://codegladiators.in/mentor-creation")}>
                        Start teaching today
                    </button>
                </div>
            </div>
        );
    }

    const studentView = () => {
        return (
            <div className="flex justify-center items-center">
                <div className="ml-4">
                    <h3 className="text-4xl font-semibold">Become a Mentee</h3>
                    <p className="">
                        Learner across India are joining CodeGladiators to enrich their knowledge and enter in their dream industries.
                    </p>
                    <button className="mt-4 bg-gray-700 py-4 px-8 text-white font-bold uppercase text-xs rounded hover:bg-black" onClick={()=>handleClick("https://codegladiators.in/mentee-creation")}>
                        Start learning today
                    </button>
                </div>
                <div>
                    <img
                        src="https://img.freepik.com/free-photo/teenager-student-girl-yellow-pointing-finger-side_1368-40175.jpg?size=626&ext=jpg"
                        alt="mentor"
                    />
                </div>
            </div>
        );
    };

    const transformView = () => {
        return (
            <div className="flex justify-center items-center">
                <div className="ml-4">
                    <h3 className="text-4xl font-semibold">
                        Transform your life through education
                    </h3>
                    <p className="">
                        Learners around the world are launching new careers,
                        advancing in their fields, and enriching their lives.
                    </p>
                    <button className="mt-4 bg-gray-700 py-4 px-8 text-white font-bold uppercase text-xs rounded hover:bg-black" onClick={()=>handleClick("https://codegladiators.in/")}>
                        Find out how
                    </button>
                </div>

                <div>
                    <img
                        src="https://s.udemycdn.com/home/non-student-cta/transform-1x-v3.jpg"
                        alt="mentor"
                    />
                </div>
               
            </div>
        );
    }

    return (
        loader ? (
            <div className="flex align-center justify-center mt-10">
                <LoaderLarge type="ThreeDots" />
            </div>
            ) : (
                <div className="flex flex-col h-screen">
                {/* <Corousal dailyUpdate={dailyUpdate} /> */}
                <div className="flex flex-grow justify-center items-center flex-row mb-4">
                    <div className="container mx-auto">
                        <center className="mt-5 md:hidden sm:block">
                            <h1>Top courses</h1>
                        </center>
                        {dailyUpdate && dailyUpdate.length > 0 && (
                            <div
                                className="bg-cover bg-center  h-auto text-white py-24 px-10 object-fill"
                                style={{
                                    backgroundImage: `url(${dailyUpdate[1].banner_url})`,
                                }}
                            >
                                <div className="md:w-1/2">
                                    <p className="font-bold text-sm uppercase">
                                        Top Course
                                    </p>
                                    <p className="text-2xl ">
                                        {dailyUpdate[1].title}
                                    </p>
                                    <p className="text-3xl mb-10 leading-none font-bold">
                                        {dailyUpdate[1].description}
                                    </p>
                                    <a
                                        href="https://codegladiators.in/" target="_blank"
                                        className="bg-purple-800 py-4 px-8 text-white font-bold uppercase text-xs rounded hover:bg-gray-200 hover:text-gray-800"
                                    >
                                        Learn More
                                    </a>
                                </div>
                            </div>
                        )}
                        <div className="md:mt-5">
                            <div className="flex flex-col">
                                <p className="text-3xl font-semibold">
                                    A broad selection of courses
                                </p>
                                <p>
                                    Choose from {numberOFCourseMaster} online courses with new
                                    additions published every month
                                </p>
                                <div className="mt-4">
                                    {categories.map((category, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className="border-gray-400 border mt-6 bg-gray-100"
                                            >
                                                <p className="pl-4 pt-4 text-2xl font-semibold">
                                                    {category.display_name}
                                                </p>
                                                <Slider {...settings}>
                                                    {category.course.map(
                                                        (course, cIndex) => {
                                                            return (
                                                                <Card
                                                                    course={
                                                                        course
                                                                    }
                                                                    key={cIndex}
                                                                    markedAsWish={checkIfmarkedAsWish(
                                                                        course.Id
                                                                    )}
                                                                    profile={profile}
                                                                />
                                                            );
                                                        }
                                                    )}
                                                </Slider>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full bg-gray-100 mt-4 mb-4">
                    <div className="container mx-auto">{highlighterBar()}</div>
                </div>
                <div className="w-full mt-4 mb-4">
                    <div className="container mx-auto">{studentView()}</div>
                </div>
                <div className="w-full mt-4 mb-4">
                    <div className="container mx-auto">{instructorView()}</div>
                </div>
              
                <div className="w-full mt-4 mb-4">
                    <div className="container mx-auto">{transformView()}</div>
                </div>
                <Footer />
            </div>
        )
        
    );
};

const mapStateToProps = (state) => {
    return {
        profile: state.firebase.profile,
        rCourse: state.app.course,
        rDailyUpdates: state.app.dailyUpdates,
        courseMasterList:state.app.courseMasterList,
        mentorList: state.app.mentors
    };
}; 

const mapDispatchToProps = (dispatch) => {
    return {
        updateMCourse: (course, dailyUpdates, mentors, courseMasterList) => dispatch(updateMasterCourse(course, dailyUpdates, mentors, courseMasterList)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MentorDashboard);           