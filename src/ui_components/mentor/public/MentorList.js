import React, { useState, useEffect } from "react";
import Base from "../../Base";
import { LoaderLarge } from "../../ui_utilities/Loaders";
import { connect } from "react-redux";
import { randomColor } from "randomcolor";
import moment from "moment";
import { updateMasterCourse } from "../../../store/actions/appActions";
import { httpsGET } from "../../../backend_api/mentorAPI";
import {API_GET_COURSE} from "../../../backend";
import {IoIosArrowBack,IoIosArrowForward} from "react-icons/all"
import { toast } from "react-toastify";
import ReactStars from "react-stars";

const MentorList = ({ history, mentors,courses, sfid, updateMCourse, stateLoaded }) => {

    const [showLoader, setShowLoader] = useState(true);
    const [uiMentors, setUiMentors] = useState([]);
    const [pageSize, setPageSize] = useState(4);
    const [pageNumber, setPageNumber] = useState(1);
    const [filteredData,setFilteredData] = useState(uiMentors)
    const [backupData,setbackupData] = useState([])
    const [courseList,setCourseList] = useState([]);
    const [courseMasterList,setCourseMasterList] = useState([]);


    const [startedValue,setStartedValue] = useState(1)
    const [endedValue,setEndedValue] = useState(pageSize)
    const [ratingFilterdValue,setRatingFilterdValue] = useState(null);

    //Some codes


    const loadAllCourses = () => {
        console.log("ISSTATELOADED",stateLoaded)
        if (stateLoaded) {
            debugger;
            if(mentors)
                setUiMentors(mentors.slice(0, pageSize));
                setFilteredData(mentors.slice(0, pageSize));
                setbackupData(mentors)
                setStartedValue(1)
                if(mentors.length>=pageSize){
                    setEndedValue(pageSize)
                }else{
                    setEndedValue(mentors.length)
                }
            if(courses){
                let coursesMasterTemp = []
                courses.forEach((c)=>{
                    c.course.forEach((cMaster)=>{
                        coursesMasterTemp.push(cMaster)
                    })
                })
                setCourseMasterList(coursesMasterTemp);
            }
            setShowLoader(false);
                
        } else {
            
            httpsGET(null, `${API_GET_COURSE}${sfid ? sfid : "noid"}`).then(
                (data) => {
                    if (data && data.error) {
                        console.log(data.techMsg);
                    } else if (data && data.all_mentors) {   

                        console.log("Response",data)
                        debugger;
                       
                        setUiMentors(data.all_mentors.slice(0, pageSize));
                        setFilteredData(data.all_mentors.slice(0, pageSize));
                        setbackupData(data.all_mentors)
                      
                        setStartedValue(1)
                        if(data.all_mentors.length>=pageSize){
                            setEndedValue(pageSize)
                        }else{
                            setEndedValue(data.all_mentors.length)
                        }

                        if(data.cetegories){
                            let coursesMasterTemp = []
                            data.cetegories.forEach((c)=>{
                                c.course.forEach((cMaster)=>{
                                    coursesMasterTemp.push(cMaster)
                                })
                            })
                            setCourseMasterList(coursesMasterTemp);
                        }
                    }
                    updateMCourse(
                        data.cetegories,
                        data.dailyUpdate,
                        data.all_mentors
                    );
                    setShowLoader(false);
                }
            ).catch((error)=>{
                setShowLoader(false);
            })
        }
        
    };

    useEffect(() => {
        loadAllCourses();
    }, []);

    const handleListChange = (e) => {
        if(mentors) {
            setUiMentors(mentors.slice(0, e.target.value));
            setFilteredData(mentors.slice(0, e.target.value))
            setPageSize(e.target.value);
            setPageNumber(1);
            setStartedValue(1)

            if(e.target.value>=mentors.length){
                setEndedValue(mentors.length)
            }else{
                setEndedValue(e.target.value)
            }
        }
    }

    const handleSearch = (event) =>{
        let value = event.target.value.toLowerCase();
        let result = [];

        result = backupData.filter((data) => {
            return data.FirstName.toLowerCase().search(value) !== -1;
        });
        
        if(pageNumber>1 && value.length===0){
            setFilteredData(result.slice(pageSize,result.length));
        }else{
            setFilteredData(result.slice(0,pageSize));
        }
    }

    const showPrevSet = () => {
        debugger;
        updateContactList("prev");
    }

    const showNextSet = () => {
        debugger;
        updateContactList("next");
    }
    
    const updateContactList = (transType) => {
        debugger;
        const offset = ((transType === "prev" ? (pageNumber - 1) : (pageNumber + 1)) - 1) * pageSize;
        
        if(mentors) {
            const updatedUIMentors = mentors.slice(offset, (transType === "prev" ? (pageNumber - 1) * pageSize : (pageNumber + 1) * pageSize));
            setUiMentors(updatedUIMentors);
            setFilteredData(updatedUIMentors)

            setStartedValue(offset+1)
            if(mentors.length>=pageSize){
                setEndedValue((transType === "prev" ? ((pageNumber-1) * pageSize)+1 : (pageNumber + 1) * pageSize)-1)
            }else{
                setEndedValue(mentors.length)
            }
            
            if(transType === "prev")
            {
                setPageNumber(pageNumber - 1);
            }else{
                setPageNumber(pageNumber + 1);
            }
        }
    }

    const mentorsList = () => {
        return (
            <>
            <div className="container mx-auto px-4 md:px-8 no-underline overflow-hidden md:max-w-3xl mt-2 md:p-5 text-gray-900">
                <div className="py-3 flex justify-center">
                    <div className="md:px-4 flex sm:flex-row md:flex-row rounded-xl bg-white px-3 py-2">
                        <div className="flex flex-row mb-1 sm:mb-0 mr-1">
                            <div className="relative">
                                <select
                                    className="h-full appearance-none w-full bg-white text-gray-700 py-2 px-4 pr-8 border-0 rounded-lg focus:border-0"
                                    onChange={handleListChange}
                                    value={pageSize}
                                >
                                    <option>4</option>
                                    <option>8</option>
                                    <option>12</option>
                                </select>
                            </div>
                            {/* <div className="relative">
                                <select className="h-full rounded-r border-t sm:rounded-r-none sm:border-r-0 border-r border-b block appearance-none w-full bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:border-l focus:border-r focus:bg-white focus:border-gray-500">
                                    <option>All</option>
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </select>
                            </div> */}
                        </div>
                        <div className="block relative rounded-lg">
                            <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4 fill-current text-gray-500"
                                >
                                    <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z"></path>
                                </svg>
                            </span>
                            <input
                                placeholder="Search"
                                className="appearance-none border-0 rounded-lg  pl-8 pr-6 py-3 w-full bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
                                onChange={(event) =>handleSearch(event)} 
                            />
                        </div>
                    </div>
               
                </div>
            </div>
            <div className="container mx-auto max-full">
                <div className="md:grid md:grid-cols-4 flex flex-col">
                    {filteredData && filteredData.map((mentor, index) => {
                        return(newMentorUi(mentor))
                    })}
                </div>

                <div className="px-4 py-4 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between mt-12">
                                <span className="text-xs xs:text-sm text-gray-900">
                                    {getPaginationDetail()}
                                    
                                </span>
                                <div className="inline-flex mt-2 xs:mt-0">
                                  
                                    <div className={pageNumber!==1?"cursor-pointer rounded-full p-3 bg-blue-500 mr-3 transform hover:bg-blue-700 hover:scale-110 motion-reduce:transform-none":"cursor-pointer rounded-full p-3 bg-gray-800 mr-3 transform hover:scale-110 motion-reduce:transform-none"}  onClick={() => {
                                            if(pageNumber!==1){
                                                showPrevSet();
                                            }
                                        }}
                                        
                                        >
                                        <IoIosArrowBack size={23} className="text-white"/>
                                    </div>

                                    <div className={filteredData.length >= pageSize?"cursor-pointer rounded-full p-3 bg-blue-500 hover:bg-blue-700 ml-3 transform hover:scale-110 motion-reduce:transform-none":"cursor-pointer rounded-full p-3 bg-gray-800 ml-3 transform hover:scale-110 motion-reduce:transform-none"}  onClick={() => {
                                            if(filteredData.length >= pageSize){
                                                showNextSet();
                                            }
                                        }}
                                        >
                                        <IoIosArrowForward size={23} className="text-white"/>
                                    </div>
                                </div>
                            </div>
            </div>
            </>
        );
    }

    const getPaginationDetail = ()=>{
        return(
            <>
            {`Showing ${startedValue} to ${endedValue} of ${mentors.length} Entries`}
            </>
        )
    }

    const newMentorUi=(mentor)=>{
        console.log("Mentor ",mentor)
        return(
            <div class=" overflow-hidden py-3 px-2 m-1 transform hover:scale-110 motion-reduce:transform-none">
            <div className="w-full h-20"></div>
            <div className="group bg-white hover:bg-blue-500 hover:shadow-lg rounded-lg cursor-pointer"  
                onClick={() => {
                    history.push(
                        `/mentor/detail/${mentor.Firebase_Id__c}`
                    );
                }}>
                
                <div class="flex justify-center -mt-10">
                    <img src={mentor.Profile_Picture__c?mentor.Profile_Picture__c:"https://cdn1.iconfinder.com/data/icons/avatar-97/32/avatar-18-512.png"} className="rounded-full border-solid border-white border-2 -mt-10 h-20 w-20" alt="profile"/>		
                </div>

                <div class="text-center px-3 pb-6 pt-2">
                    <h3 class="group-hover:text-white text-gray-900 text-lg font-bold">{mentor.FirstName+" "+mentor.LastName}</h3>
                    <p class="mt-2 text-lg group-hover:text-white text-gray-700 bold h-3 font-bold">{mentor.Current_Company__c?mentor.Current_Company__c:""}</p>
                </div>
                
                <div class="flex justify-center pb-3">
                    {mentor.Current_Role__c?
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
                }
                </div>
            </div>
        </div>
        )
    }


    const applyFilter=(filterType,filterVal)=>{
        debugger;
        let courseListCopy = courseList;
        let filteredMentorCopy = backupData;

        let filteredMentorCopyTemp = []
        
        if(filterType!=="ratingFilter"){
           
            if(courseListCopy.find((cName=>cName===filterVal))){
                courseListCopy = courseListCopy.filter((cName=>cName!==filterVal))
            }else{
                courseListCopy.push(filterVal)
            }

            if(courseListCopy.length!==0){
                
                filteredMentorCopy.forEach((mentor)=>{
                    if(mentor.Course_Enrollments__r && mentor.Course_Enrollments__r.records && mentor.Course_Enrollments__r.records.length>0){
                        if(courseListCopy.every((course)=>mentor.Course_Enrollments__r.records.find((c)=>c.Course_Master_Name__c===course && (ratingFilterdValue!==null ?(Math.round(mentor.Mentor_Rating__c)?Math.round(mentor.Mentor_Rating__c)===ratingFilterdValue:ratingFilterdValue===0):true)))){
                            filteredMentorCopyTemp.push(mentor)
                        }
                    }
                })
                setFilteredData(filteredMentorCopyTemp);
            }else{
                if(ratingFilterdValue!==null){
                    filteredMentorCopy.forEach((mentor)=>{
                        if(Math.round(mentor.Mentor_Rating__c)?Math.round(mentor.Mentor_Rating__c)===ratingFilterdValue:ratingFilterdValue===0){
                            filteredMentorCopyTemp.push(mentor)
                        }
                    })
                    setFilteredData(filteredMentorCopyTemp);
                }else{
                    setFilteredData(backupData.slice(0,pageSize));
                }
            }
        }else{
            console.log("RatingFilteredValue",filterVal);
            debugger;

            if(courseListCopy.length!==0){
                
                filteredMentorCopy.forEach((mentor)=>{
                    if(mentor.Course_Enrollments__r && mentor.Course_Enrollments__r.records && mentor.Course_Enrollments__r.records.length>0){
                        debugger;
                        if(filterVal!=null){
                            if(courseListCopy.every((course)=>mentor.Course_Enrollments__r.records.find((c)=>c.Course_Master_Name__c===course && filterVal!=null && Math.round(mentor.Mentor_Rating__c)===filterVal))){
                                filteredMentorCopyTemp.push(mentor)
                            }
                        }else{
                            if(courseListCopy.every((course)=>mentor.Course_Enrollments__r.records.find((c)=>c.Course_Master_Name__c===course))){
                                filteredMentorCopyTemp.push(mentor)
                            }
                        }
                        
                    }
                })
                setFilteredData(filteredMentorCopyTemp);
            }else{
                if(filterVal!==null){
                    filteredMentorCopy.forEach((mentor)=>{
                        if(Math.round(mentor.Mentor_Rating__c)===filterVal){
                            filteredMentorCopyTemp.push(mentor)
                        }
                    })
                    setFilteredData(filteredMentorCopyTemp);
                }else{
                    setFilteredData(backupData.slice(0,pageSize));
                }
                
            }
            setRatingFilterdValue(filterVal)
        } 
        setCourseList(courseListCopy)
    }

    const newInstructorUi=()=>{
        return(
            <div className="w-full flex md:flex-row flex-col">

                <div className="w-full max-w-md bg-white rounded-md flex flex-col" style={{ height: "fit-content" }}>
                    <div className="border-b-2 border-gray-200">
                        <h1 className="text-base py-3 px-5 text-warmGray-600">Search Filter</h1>
                    </div>

                    <div className="my-5 w-full px-5">
                        <input type="text" className="px-3 w-full border-gray-200 rounded-md" placeholder="Mentor Name" onChange={(event) =>handleSearch(event)} />
                    </div>


                    <div className="px-5 flex flex-col mb-5">
                        <h1 className="text-base mb-1">Ratings</h1>

                        <div className="cursor-pointer flex flex-row py-1 items-center" onClick={()=>
                            ratingFilterdValue===5?applyFilter("ratingFilter",null):applyFilter("ratingFilter",5)}
                            >
                            <input type="checkbox" className="p-2 border-gray-300 my-1 rounded-sm focus:ring-0" value={5} checked={ ratingFilterdValue===5?true:false}/>
                            <h1 className="text-base mx-2 text-gray-600">5</h1>
                            <ReactStars
                                count={5}
                                size={18}
                                value={5}
                                edit={false}
                                color2={'#ffd700'} 
                            />
                        </div>

                        <div className="cursor-pointer flex flex-row py-1 items-center" onClick={()=>ratingFilterdValue===4?applyFilter("ratingFilter",null):applyFilter("ratingFilter",4)}>
                            <input type="checkbox" className="p-2 border-gray-300 my-1 rounded-sm focus:ring-0" value={4} checked={ratingFilterdValue===4?true:false}/>
                            <h1 className="text-base mx-2 text-gray-600">4</h1>
                            <ReactStars
                                count={5}
                                size={18}
                                value={4}
                                edit={false}
                                color2={'#ffd700'} 
                            />
                        </div>

                        <div className="cursor-pointer flex flex-row py-1 items-center" onClick={()=>ratingFilterdValue===3?applyFilter("ratingFilter",null):applyFilter("ratingFilter",3)}>
                            <input type="checkbox" className="p-2 border-gray-300 my-1 rounded-sm focus:ring-0" value={3} checked={ratingFilterdValue===3?true:false}/>
                            <h1 className="text-base mx-2 text-gray-600">3</h1>
                            <ReactStars
                                count={5}
                                size={18}
                                value={3}
                                edit={false}
                                color2={'#ffd700'} 
                            />
                        </div>

                        <div className="cursor-pointer flex flex-row py-1 items-center" onClick={()=>ratingFilterdValue===2?applyFilter("ratingFilter",null):applyFilter("ratingFilter",2)}>
                            <input type="checkbox" className="p-2 border-gray-300 my-1 rounded-sm focus:ring-0" value={2} checked={ratingFilterdValue===2?true:false}/>
                            <h1 className="text-base mx-2 text-gray-600">2</h1>
                            <ReactStars
                                count={5}
                                size={18}
                                value={2}
                                edit={false}
                                color2={'#ffd700'} 
                            />
                        </div>

                        <div className="cursor-pointer flex flex-row py-1 items-center" onClick={()=>ratingFilterdValue===1?applyFilter("ratingFilter",null):applyFilter("ratingFilter",1)}>
                            <input type="checkbox" className="p-2 border-gray-300 my-1 rounded-sm focus:ring-0" value={1} checked={ratingFilterdValue===1?true:false}/>
                            <h1 className="text-base mx-2 text-gray-600">1</h1>
                            <ReactStars
                                count={5}
                                size={18}
                                value={1}
                                edit={false}
                                color2={'#ffd700'} 
                            />
                        </div>

                    </div>


                    {/* <div className="px-5 flex flex-col">
                        <h1 className="text-base mb-1">Gender</h1>

                        <div className="cursor-pointer flex flex-row py-1 items-center">
                            <input type="checkbox" className="p-2 border-gray-300 my-1 rounded-sm focus:ring-0"/>
                            <h1 className="text-base mx-2 text-gray-600">Male</h1>
                        </div>

                        <div className="cursor-pointer flex flex-row  items-center">
                            <input type="checkbox" className="p-2 border-gray-300 my-1 rounded-sm focus:ring-0"/>
                            <h1 className="text-base mx-2 text-gray-600">Female</h1>
                        </div>

                    </div> */}

                   


                    <div className="px-5 my-5">
                        <h1 className="text-base">Select Course</h1>
                        <div className="flex flex-col h-52 overflow-y-scroll mt-3">
                            {courseMasterList && courseMasterList.length > 0 &&
                                courseMasterList.map((course)=>{
                                    return(
                                        <div className="cursor-pointer flex flex-row py-1 items-center">
                                            <input type="checkbox" className="p-2 border-gray-300 my-1 rounded-sm focus:ring-0" value={course.Name} onClick={(e)=>{applyFilter("courseFilter",course.Name)}}/>
                                            <h1 className="text-base mx-2 text-gray-600">{course.Name}</h1>
                                        </div>
                                    )
                                })     
                            }
                        </div>          
                    </div>
                    

                    {/* <div className="px-5 my-5">
                        <button className="text-white bg-purple-700 hover:bg-purple-900 w-full py-3 rounded-md">Search</button>
                    </div> */}

                    <div className="px-4 py-4 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between mt-12">
                                <span className="text-xs xs:text-sm text-gray-900">
                                    {getPaginationDetail()}
                                    
                                </span>
                                <div className="inline-flex mt-2 xs:mt-0">
                                  
                                    <div className={pageNumber!==1?"cursor-pointer rounded-full p-3 bg-blue-500 mr-3 transform hover:bg-blue-700 hover:scale-110 motion-reduce:transform-none":"cursor-pointer rounded-full p-3 bg-gray-800 mr-3 transform hover:scale-110 motion-reduce:transform-none"}  onClick={() => {
                                            if(pageNumber!==1){
                                                showPrevSet();
                                            }
                                        }}
                                        
                                        >
                                        <IoIosArrowBack size={23} className="text-white"/>
                                    </div>

                                    <div className={filteredData.length >= pageSize?"cursor-pointer rounded-full p-3 bg-blue-500 hover:bg-blue-700 ml-3 transform hover:scale-110 motion-reduce:transform-none":"cursor-pointer rounded-full p-3 bg-gray-800 ml-3 transform hover:scale-110 motion-reduce:transform-none"}  onClick={() => {
                                            if(filteredData.length >= pageSize){
                                                showNextSet();
                                            }
                                        }}
                                        >
                                        <IoIosArrowForward size={23} className="text-white"/>
                                    </div>
                                </div>
                     </div>
                </div>
                <div className="w-full md:ml-5 flex flex-col">

                {filteredData && filteredData.length > 0?
                    <>
                        {filteredData.map((mentor, index) => {
                            console.log("Mentor ",mentor)
                        return(
                            <div className="bg-white rounded-md flex flex-row py-5 px-3 md:mb-3 ">
                                <img src={mentor.Profile_Picture__c?mentor.Profile_Picture__c:"https://cdni.iconscout.com/illustration/premium/thumb/business-mentor-2706556-2264645.png"} className="md:h-36 md:w-36 h-12 w-12 rounded-sm"/>
                                
                                <div className="w-full flex md:flex-row flex-col justify-between">
                                    <div className="md:py-5 ml-5">
                                        <div className="flex flex-col h-full">
                                            <h1 className="text-gray-700 text-xl">{mentor.FirstName+" "+mentor.LastName}</h1>
                                            <h1 className="text-gray-400 text-base">{mentor.Current_Company__c?'Org - '+mentor.Current_Company__c:""}</h1>
                                            <h1 className="text-gray-400 text-base">{mentor.Current_Role__c?'Role- '+mentor.Current_Role__c:""}</h1>
                                            <ReactStars
                                                count={5}
                                                size={20}
                                                value={mentor.Mentor_Rating__c}
                                                edit={false}
                                                color2={'#ffd700'} />
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center">
                                    <button className="ml-5 cursor-pointer px-12 py-3 mr-5 border-2 border-blue-400 bg-white text-blue-600 hover:bg-blue-600 hover:text-white hover:border-0 rounded-sm" onClick={()=>{
                                          history.push(
                                            `/mentor/detail/${mentor.Firebase_Id__c}`
                                        );

                                    }}>VIEW PROFILE</button>
                                    </div>
                                </div>  
                            </div>
                        )
                    })}
                    </>:
                    <div className="bg-white rounded-md flex flex-col py-5 px-3 mb-3 items-center justify-center h-full">
                            <img src="https://cdni.iconscout.com/illustration/premium/thumb/business-mentor-2706556-2264645.png" className="h-56 w-56 rounded-sm"/>
                            <h1>ohoo, Mentor not found! 😢</h1>
                    </div>
                }
               
                </div>
            </div>
        )
    }

    return (
        <Base history={history} activeTabName="Instructors" pathList={[{to:"/",name:"Home"},{to:"#",name:"Instructors"}]}>
            <div className="w-full bg-white h-16 flex-col items-center justify-center">
                <h1 className="text-lg items-center p-5">Mentors</h1>
            </div>
            <div className="md:px-5 bg-gray-100 h-screen py-5">
             
                {showLoader ? (
                    <div className="flex items-center justify-center h-3/6">
                        <LoaderLarge type="ThreeDots" />
                    </div>
                ) : (
                    // mentorsList()
                    newInstructorUi()
                )}
            </div>
        </Base>
    );
};

const mapStateToProps = (state) => {
    console.log("STATEDETAILS",state.app)
    return {
        mentors: state.app.mentors,
        courses:state.app.course,
        stateLoaded: (state.app.course && state.app.course.length > 0) || (state.app.mentors && state.app.mentors.length > 0)
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateMCourse: (course, dailyUpdates, mentors) => dispatch(updateMasterCourse(course, dailyUpdates, mentors)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MentorList);