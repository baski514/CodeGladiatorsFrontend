import React, {useEffect,useState} from "react";
import { Redirect } from "react-router-dom";
import { createNewBasicAccount } from '../../store/actions/authActions';
import {API_ENROLL_STUDENT_TO_START_TEST,API_GET_COLLEGES_NAME} from "../../backend"
import {httpsGET, httpsPOST} from '../../backend_api/menteeAPI'
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Base from "../Base";
import Alert from "../ui_utilities/Alert";
import validator from "validator";
import { toast } from "react-toastify";
import { LoaderLarge } from "../ui_utilities/Loaders";
import { SiEmberDotJs } from "react-icons/si";
import Select from 'react-select'
import logo from '../../assets/favicon.png'

// https://jsfiddle.net/nsjd2487/1/



const GenericSignup = ({auth, authError, history, createNewBasicAccount}) => {

    const collegeList = ["ABC College","XYZ college","PQR college"];
    const semeseters = ["3rd","4th","5th","6th","7th","8th"];
    const passingYearVal = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025,2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034];

    const qualificationsList = [{name:"BTech",branch:["CSE","ECE","CIVIL","ME"]},{name:"MTech",branch:["CSE","ECE","CIVIL","ME"]},
                        {name:"MBA",branch:[]},{name:"BCA",branch:[]},{name:"MCA",branch:[]}];

    const options = [
        { value: 'C', label: 'C' },
        { value: 'C++', label: 'C++' },
        { value: 'Python', label: 'Python'},
        { value: 'Java', label: 'Java'},
        { value: 'Kotlin', label: 'Kotlin'},
        { value: 'Unity', label: 'Unity'},
        { value: 'Salesforce', label: 'Salesforce'},
        { value: 'Android', label: 'Android'},

        ]




    const [showLoader,setShowLoader] = useState(false);

    const [state,setState] = useState({
        nickName:'',
        email: null,
        firstName: '',
        lastName: '',
        courseChoosed: 'C',
        qualification:qualificationsList[0].name,
        branch:qualificationsList[0].branch[0],
        phone:'',
        passingYear:passingYearVal[0],
        reappear:0,
        hasCompanyOffer:false,
        college:collegeList[0],
        semester:semeseters[0],
        errorMsg:'',
        hasError:false,
        authErrorAlert:true,
        isOtherShowing:true,
        addExtraInterestShowing:true,
        certifications:[],
        areaOfInterest:[],
        otherInput:'',
        otherInterest:'',
        ctcOffered:"",
        companyName:""
    })

    const [collegesList,setCollegesList] = useState([])

    const [courseList,setCourseList] = useState([{"name":".NET",checked:false},{"name":"C Language",checked:false},
    {"name":"C++",checked:false},{"name":"JAVA",checked:false},{"name":"JavaScript",checked:false},{"name":"PYTHON",checked:false}]);

    const [companyOffer,setCompanyOffer] = useState([{name:"Yes",checked:false},{name:"No",checked:true}])

    

   

    useEffect(()=>{
        setState({...state,authErrorAlert:authError?true:false})
    },[authError])


    useEffect(()=>{
        console.log("")
        fetchCollegesName();
    },[])

    const [errors,setErrors] = useState({
        email:false,
        firstName: false,
        lastName: false,
        phone: false,
        nickName:false,
        ctcOffered: false,
        companyName:false
    })

    // function handleVisibilityChange(event) {
    //     setState({...state})
    //     if(document[hidden]){
    //         let dummmy = courseList;
    //         dummmy.push("myAPPPP");
    //         setCourseList(dummmy);
    //         console.log("HIDE",state.branch);
    //     }else{
    //         console.log("SHOW")
    //     }
    //}

    if (auth.uid && !auth.emailVerified) {
        debugger;
        return <Redirect to='/generictest'/> 
    }

  const handleChange = (e) => {
    setState({
        ...state,
      [e.target.id]: e.target.value
    })
    console.log(e.target.value);
  }

  const fetchCollegesName =()=>{
    httpsGET(null,API_GET_COLLEGES_NAME)
    .then((data)=>{
        debugger;
        setCollegesList(data);
        console.log("DATAAAA",data);
    })
    .catch((error)=>{
        debugger;
        console.log("Error",error);
    })
    .finally(()=>setShowLoader(false));
  }

  const createAccount =()=>{
      let selectedCourse = courseList.filter((course)=>course.checked).length
      if(selectedCourse<2){
          toast("Choose 2 course at least")
      }else{
      
        let choosenCourseList = courseList.filter((course)=>course.checked);
        let intrestedCourse = `[${choosenCourseList[0].name},${choosenCourseList[1].name}]`
        
        let areaInterest =[]
        let certifications=[]
        let strArea="";
        
        state.areaOfInterest.forEach((area,i)=>{
            areaInterest.push(area.value)
            if(i<state.areaOfInterest.length-1){
                strArea = `${strArea}${area.value},`
            }else{
                strArea = `${strArea}${area.value}`
            }
        })
        
        let strCertificate="";  
        state.certifications.forEach((cert,i)=>{
            if(i<state.certifications.length-1){
                strCertificate = `${strCertificate}${cert.value},`
            }else{
                strCertificate = `${strCertificate}${cert.value}`
            }
        })
      
        // let certifications = `"[`;
        console.log("json",JSON.stringify(areaInterest))
        console.log("certification",strCertificate)
    


        const body={
            IntrestedTestCourse:intrestedCourse,
            certification:strCertificate,
            contactInfo:{
                nickName:state.nickName,
                FirstName:state.firstName,
                LastName:state.lastName,
                Branch:state.branch,
                Email:state.email,
                Phone:state.phone,
                CollegeName:state.college,
                semester:state.semester,
                reappear:state.reappear,
                hasCompanyOffered:state.hasCompanyOffer,
                qualification:state.qualification,
                areaOfInterest:strArea,
                companyName:state.companyName,
                currentCTC:state.ctcOffered,
                passingYear:state.passingYear
            }
        }
        setShowLoader(true)
    
          console.log("BODYYY",body);
          httpsPOST(null,API_ENROLL_STUDENT_TO_START_TEST,body).then((data)=>{
            debugger;
            console.log("DATAAAA",data);
            if(data.contactId===null){
                toast.warning(data.status)
            }else{
                history.push({
                    pathname:"/generictest",
                    state:{response:data,profile:body},
                })
            }
          }).catch((error)=>{
              debugger;
              console.log("Error",error);
          }).finally(()=>setShowLoader(false));
      }
  }

    const submitData = (e) => {
        e.preventDefault();
        console.log("DATATOPOST",state)
        debugger;
        if(state.nickName.length<1){
            setErrors({
                email:false,
                firstName: false,
                lastName: false,
                phone: false,
                nickName   :true,
                companyName:false,
                ctcOffered:false
            })
        }else if(!state.email || !validator.isEmail(state.email)){
            setErrors({
                email:true,
                firstName: false,
                lastName: false,
                phone: false, 
                nickName   :false,
                companyName:false,
                ctcOffered:false
            })   
        }else if(!state.firstName||state.firstName<1){
            setErrors({
                email:false,
                firstName: true,
                lastName: false,
                phone: false,
                nickName   :false,
                companyName:false,
                ctcOffered:false
            })
        }else if(!state.lastName||state.lastName<1){
            setErrors({
                email:false,
                firstName: false,
                lastName: true,
                phone: false,
                nickName   :false,
                companyName:false,
                ctcOffered:false
            })
        }else if(!state.phone||!validator.isMobilePhone(state.phone)){
            setErrors({
                email:false,
                firstName: false,
                lastName: false,
                phone: true,
                nickName   :false,
                companyName:false,
                ctcOffered:false
            })
        }else if(state.hasCompanyOffer){
            if(!state.ctcOffered){
                setErrors({
                    email:false,
                    firstName: false,
                    lastName: false,
                    phone: false,
                    nickName   :false,
                    companyName:false,
                    ctcOffered:true
                })  
            }else if(!state.companyName){
                setErrors({
                    email:false,
                    firstName: false,
                    lastName: false,
                    phone: false,
                    nickName   :false,
                    companyName:true,
                    ctcOffered:false
                })  
            }else{
                createAccount();    
            }
        }
        else{
            createAccount();
        }
    }

    const handleAlerts = (alertType) => (event) => {
        
        if (alertType === "CLOSE"){
            setState({...state,hasError:false,authErrorAlert:false})
            console.log("close alert");
        }
    }

    const handleIntrestCourse=(i)=>{

        let copyCourseList = [...courseList];
        let selectedCourse = copyCourseList.filter((course)=>course.checked===true).length;
        
        if(selectedCourse===2 && !copyCourseList[i].checked){
            let selectedIndex = copyCourseList.findIndex((course)=>course.checked)
            copyCourseList[selectedIndex].checked = false;
        }
        copyCourseList[i].checked = !copyCourseList[i].checked; 

        setCourseList(copyCourseList)
    }

    const companyOfferHandler=(i)=>{
        let copyList = [...companyOffer];
        let selectedIndex = copyList.findIndex((op)=>op.checked)
        copyList[selectedIndex].checked = false;

        copyList[i].checked = !copyList[i].checked;

        if(copyList[i].checked && copyList[i].name==="Yes"){
            setState({...state,hasCompanyOffer:true});
        }else{
            setState({...state,hasCompanyOffer:false});
        }

        setCompanyOffer(copyList);
    }

    const handleMultipleChange=(e)=>{
        setState({...state,certifications:e})
    }

    const handleAreaOfInterest=(e)=>{
        setState({...state,areaOfInterest:e})
    }




    return (
        <Base history={history}>
            {showLoader ? (
                <div className="container mx-auto py-4 md:px-12">
                    <div className="flex items-center justify-center h-3/6">
                        <LoaderLarge type="ThreeDots" />
                    </div>
                    <h1 className="text-center">Wait a while, Do not refresh this page <br/>We're creating some tough Question for you. 😋</h1>
                </div>
            ) :(
                <div className="grid md:grid-cols-2 h-screen">
                    <div className="hidden md:block bg-white rounded-lg ">

                   

                        <div className="flex flex-col items-center justify-center h-screen">
                        <div className="flex flex-col w-full px-5 justify-center">
                        <div className="flex justify-center">
                            <div className="flex-shrink-0 flex items-center">
                                <img
                                    className="lg:block h-8 w-auto cursor-pointer"
                                    src={logo}
                                    alt="Workflow"
                                />
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <h1 className="text-md items-center p-5 text-gray-700 font-bold md:text-xl">CodeGladiators</h1>
                        </div>
                    </div>
                            <h1 className="mb-10 text-4xl text-gray-700 mt-12">LET'S START GENERIC TEST</h1>
                            <img src="https://image.freepik.com/free-vector/programming-concept-illustration_114360-1351.jpg" alt="Exam Picture"/>
                            
                        </div>
                     
                      
                    </div>
                    <div className="md:p-4 flex flex-col items-center justify-center bg-gray-100 p-2">
                        <form
                            className="bg-white shadow-lg rounded-lg md:px-8  px-3 md:pt-6 pb-8 md:mb-4 md:w-9/12 md:mt-5 w-full"
                            onSubmit={submitData}
                        >
                          
                            <center>
                                <h3 className="text-gray-700 p-2">Please fill the following details</h3>
                            </center>

                            <hr />
                            {state.hasError? (
                                    <Alert
                                        alert={{
                                            header: state.errorMsg.header,
                                            message: state.errorMsg.msg,
                                            className: state.errorMsg.color,
                                        }}
                                        clickHandler={handleAlerts}
                                    />
                                ) : (
                                    <></>
                                )}
                                {authError && state.authErrorAlert? (
                                    <Alert
                                        alert={{
                                            header: authError.header,
                                            message: authError.msg,
                                            className: authError.color,
                                        }}
                                        clickHandler={handleAlerts}
                                    />
                                ) : (
                                    <></>
                                )}
                            
                            <div className="grid md:grid-cols-2 md:gap-4">


                            <div className="mb-4 mt-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="email"
                                >
                                    Choose username
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="nickName"
                                    type="text"
                                    placeholder="username"
                                    value={state.nickName}
                                    onChange={handleChange}
                                />
                                <p className="text-red-700">{errors.nickName?"Enter username":""}</p>
                            </div>
                            <div className="mb-4 mt-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="email"
                                >
                                    Email
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="email"
                                    type="text"
                                    placeholder="email"
                                    value={state.email}
                                    onChange={handleChange}
                                />
                                <p className="text-red-700">{errors.email?"Enter valid email":""}</p>
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="firstName"
                                >
                                    First Name
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="firstName"
                                    type="text"
                                    placeholder="First Name"
                                    value={state.firstName}
                                    onChange={handleChange}
                                />
                                <p className="text-red-700">{errors.firstName?"Enter First name":""}</p>
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="lastName"
                                >
                                    Last Name
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="lastName"
                                    type="text"
                                    placeholder="Last Name"
                                    onChange={handleChange}
                                    value={state.lastName}
                                />
                                <p className="text-red-700">{errors.lastName?"Enter Last name":""}</p>
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="firstName"
                                >
                                    Phone
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="phone"
                                    type="tel"
                                    maxLength={10}
                                    placeholder="e.g. 9999-999-99"
                                    value={state.phone}
                                    onChange={handleChange}
                                />
                                <p className="text-red-700">{errors.phone?"Please Enter valid Phone Number":""}</p>
                            </div>

                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                >
                                    Choose college?
                                </label>
                                <select
                                    id="college"
                                    onChange={handleChange}
                                    value={state.college}
                                    className="cursor-pointer shadow appearance-none border rounded w-full py-2 pl-3 pr-7 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    {collegesList.map((colleges)=>{
                                        return <option value={colleges.Name}>{colleges.Name}</option>
                                    })}
                                
                                </select>
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                >
                                    Choose Qualification?
                                </label>
                                <select
                                    id="qualification"
                                    onChange={(e)=>setState({...state,qualification:e.target.value})}
                                    value={state.qualification}
                                    className="cursor-pointer shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    {qualificationsList.map((qualification) =>{
                                        return(
                                            <option value={qualification.name}>{qualification.name}</option>
                                        )
                                    })}
                                    
                                </select>
                            </div>
                            {qualificationsList.filter((qualification) =>qualification.name===state.qualification).length>0 && 
                                    qualificationsList.filter((qualification) =>qualification.name===state.qualification)[0].branch.length>0 &&
                                 <div className="mb-4">
                                 <label
                                     className="block text-gray-700 text-sm font-bold mb-2"
                                 >
                                     Select Branch?
                                 </label>
                                 <select
                                     id="branch"
                                     onChange={handleChange}
                                     value={state.branch}
                                     className="cursor-pointer shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                 >
                                     {qualificationsList.filter((qualification) =>qualification.name===state.qualification)[0].branch.map((branch)=>{
                                         return(<option value={branch}>{branch}</option>);
                                     })}
                                 </select>
                             </div> 
                            }
                           

                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                >
                                    Choose semester?
                                </label>
                                <select
                                    id="semester"
                                    onChange={handleChange}
                                    value={state.semester}
                                    className="cursor-pointer shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    {semeseters.map((sem)=>{
                                        return <option value={sem}>{sem}</option>
                                    })}
                                
                                </select>
                            </div>

                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                >
                                    Passing Year?
                                </label>
                                <select
                                    id="passingYear"
                                    onChange={handleChange}
                                    value={state.passingYear}
                                    className="cursor-pointer shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    {passingYearVal.map((year)=>{
                                        return(
                                            <option value={year}>{year}</option>
                                        )
                                    })}
                                </select>
                            </div>

                          
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                >
                                    Certification if any?
                                </label>

                                <Select
                                    id="certification"
                                    options={options}
                                    isMulti={true}
                                    onChange={handleMultipleChange}
                                    value={state.certifications}
                                />

                                

                                <div className="mt-2">

                                {!state.isOtherShowing &&
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="otherInput"
                                        type="text"
                                        placeholder="Add Other.."
                                        value={state.otherInput}
                                        onChange={handleChange}
                                />
                                }

                                    <h1 className="text-xs p-1 text-gray-600 items-end cursor-pointer hover:underline float-right" onClick={()=>{
                                        if(state.isOtherShowing){
                                            setState({...state,isOtherShowing:false});
                                        }else{
                                            let val = state.otherInput;
                                            let body = { value: val, label: val};
                                            setState({...state,certifications:[...state.certifications,body],otherInput:"",isOtherShowing:true});
                                        }
                                    }}>{state.isOtherShowing?"Other":"Add"}</h1>
                                </div>


                            </div>


                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                >
                                    Area of interest?
                                </label>

                                <Select
                                    id="areaOfInterest"
                                    options={options}
                                    isMulti={true}
                                    onChange={handleAreaOfInterest}
                                    value={state.areaOfInterest}
                                />

                                

                                <div className="mt-2">

                                {!state.addExtraInterestShowing &&
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="otherInterest"
                                        type="text"
                                        placeholder="Add Other.."
                                        value={state.otherInterest}
                                        onChange={handleChange}
                                />
                                }

                                    <h1 className="text-xs p-1 text-gray-600 items-end cursor-pointer hover:underline float-right" onClick={()=>{
                                        if(state.addExtraInterestShowing){
                                            setState({...state,addExtraInterestShowing:false});
                                        }else{
                                            let val = state.otherInterest;
                                            let body = { value: val, label: val};
                                            setState({...state,areaOfInterest:[...state.areaOfInterest,body],otherInterest:"",addExtraInterestShowing:true});
                                        }
                                    }}>{state.addExtraInterestShowing?"Other":"Add"}</h1>
                                </div>


                            </div>


                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                >
                                    Number of Reappear?
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="reappear"
                                    type="number"
                                    placeholder="reappear"
                                    value={state.reappear}
                                    onChange={handleChange}
                                />
                            </div>

                            
                            
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                >
                                    Current Company Offer?
                                </label>
                                <div className="grid grid-col-3 grid-flow-col gap-4  mt-3">
                                    {companyOffer.map((val,i)=>{
                                        return(
                                            <div className="cursor-pointer flex flex-row py-1 items-center">
                                                <input type="checkbox" className="p-2 border-gray-300 my-1 rounded-sm focus:ring-0" checked={val.checked} onClick={()=>{companyOfferHandler(i)}}/>
                                                <h1 className="text-base mx-2 text-gray-600">{val.name}</h1>
                                            </div>
                                        )
                                    })}
                                  
                                </div>        
                            </div>

                            </div>
                        

                           <div className="grid md:grid-cols-2 md:gap-4">
                            {state.hasCompanyOffer &&
                                <div className="mb-4">
                                 <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                 >
                                    Current CTC Offered?
                                 </label>
                                 <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="ctcOffered"
                                    type="number"
                                    maxLength={10}
                                    placeholder="current CTC"
                                    value={state.ctcOffered}
                                    onChange={handleChange}
                                 />
                                 <p className="text-red-700">{errors.ctcOffered?"Please Enter current CTC":""}</p>
                             </div>    
                             
                            }

                            {state.hasCompanyOffer &&
                                 <div className="mb-4">
                                 <label
                                     className="block text-gray-700 text-sm font-bold mb-2"
                                 >
                                    Company Name?
                                 </label>
                                 <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="companyName"
                                    type="text"
                                    placeholder="Name of the company"
                                    value={state.companyName}
                                    onChange={handleChange}
                                 />
                                 <p className="text-red-700">{errors.companyName?"Please Enter current company name":""}</p>
                             </div>    
                            }

                        </div>         

                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="courseChoosed"
                                >
                                    Choose any 2 course?
                                </label>
                                <div className="grid grid-rows-3 grid-flow-col gap-2   mt-3">
                                {courseList && courseList.length > 0 &&
                                    courseList.map((course,i)=>{
                                        return(
                                            <div className="cursor-pointer flex flex-row py-1 items-center">
                                                <input type="checkbox" className="p-2 border-gray-300 my-1 rounded-sm focus:ring-0" checked={course.checked} onClick={()=>handleIntrestCourse(i)}/>
                                                <h1 className="text-base mx-2 text-gray-600">{course.name}</h1>
                                            </div>
                                        )
                                    })     
                                }
                            </div>        
                            </div>

                        


                        
                    
                            <div className="flex items-center w-full mt-5">
                                <button
                                    className="w-full bg-gray-900 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="submit"
                                >
                                    Submit
                                </button>
                                {/* <Link
                                    className="text-gray-700 p-2 inline-block align-baseline  hover:text-purple-800"
                                    to="/signin"
                                >
                                    Account already exist? signin
                                </Link> */}
                            </div>
                        </form>
                        <p className="text-center text-gray-500 text-xs">
                            &copy;2021 Acme Corp. All rights reserved.
                        </p>
                    </div>
                    {/* <NEWFILE handler={run}/> */}
            </div>
            )}
            
        </Base>
    );

}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
    authError: state.auth.authError
  }
}

const mapDispatchToProps = (dispatch)=> {
  return {
    createNewBasicAccount: (creds) => dispatch(createNewBasicAccount(creds))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GenericSignup)
