
import React from 'react'
import { connect } from "react-redux";
import Base from '../../Base';
import logo from '../../../assets/favicon.png'
import { httpsGET, httpsPOST as menteePost} from '../../../backend_api/menteeAPI';
import {API_GET_GENERIC_TEST, API_POST_SUBMIT_GENERIC_TEST,API_ENROLL_STUDENT_TO_START_TEST} from '../../../backend';
import { LoaderLarge } from '../../ui_utilities/Loaders';
import { toast } from 'react-toastify';
import { ProgressBar} from "react-step-progress-bar";
import "react-step-progress-bar/styles.css";
import Doughnut from "../../mentee/dashboard/charts/Doughnut";
import Pie from "../../mentee/dashboard/charts/Pie";

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import Countdown from "react-countdown";
import { Redirect } from 'react-router-dom';
import {firebase} from '../../../config/fbConfig'
import CommonAlert from '../../settings/CommonAlert';
import WebReloader from "./WebReloader";
import { BsStopwatch } from 'react-icons/bs';
import SubmitExam from '../../settings/SubmitExam';
import TestResponse from '../../settings/TestResponse';
import shuffle from "shuffle-array"

class GenericTest extends React.Component {

    submittionMsg = ["You have successfully submitted your test, please wait while we fetch your test results.",
        "Exam time has finished, please wait while we fetch your test results." ,
        "Your test have been submitted automatically due to  engaging in dishonest practice or breaching the rules during or in relation to examinations, please wait while we fetch your test results."                       
    ]

    progressBarList = ["linear-gradient(to right, #25F100, #158A00)","linear-gradient(to right, #FE8B00, #DC7900)","linear-gradient(to right, #FF0000, #C50000)"]

    constructor(props) {
        super(props);
        console.log("Props",props);

        this.state = {
            showLoader: true,
            option:[],
            questionIndex:0,
            response:[],
            timer:0,
            showTimer: false,
            showSecurityAlert:false,
            nakalCount: 0,
            testSubmittionType:'Submit',
            showSubmitTest:false,
            submitExamMsg:this.submittionMsg[0],
            submittionInProgress:false,
            showTestResponse:false,
            selected:false
        }

        this.hasSubmittedTest = React.createRef(false);
        this.containerRef =  React.createRef(null);

        this.hidden = null;
        this.visibilityChange = null;
        if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support 
            this.hidden = 'hidden';
            this.visibilityChange = 'visibilitychange';
        } else if (typeof document.msHidden !== 'undefined') {
            this.hidden = 'msHidden';
            this.visibilityChange = 'msvisibilitychange';
        } else if (typeof document.webkitHidden !== 'undefined') {
            this.hidden = 'webkitHidden';
            this.visibilityChange = 'webkitvisibilitychange';
        }
    }

    

    componentDidMount() {
        if(this.props.history.location.state){
            console.log("History",this.props.history.location.state)
        }
        
        debugger;
        if(!this.props.history.location.state || !this.props.history.location.state.response){
            <Redirect to="/starttest"/>
        }else{
            // getGenericTest(history.location.state.sfid)
            
           if(localStorage.getItem("hasubmitted",false) && localStorage.getItem("email")===this.props.history.location.state.profile.contactInfo.Email){
               this.fetchResult();
            //    getGenericTest(history.location.state.sfid)
           }else{
                debugger;
                let body = {questionsList:shuffle(this.props.history.location.state.response.assementQueStionByCategory),studentTestAssociationid:this.props.history.location.state.response.studentTestAssociationid}
                this.setState({...this.state, response:body, showLoader:false, showTimer:true, timer:this.convertMillis(this.props.history.location.state.response.testDuration)});
                localStorage.removeItem("hasubmitted");
           }
        }
        //register event
        document.addEventListener(this.visibilityChange, this.handleVisibilityChange, false);
      }

    
      handleVisibilityChange = () => {
          
        if(!localStorage.getItem("hasubmitted")){
            if(this.state.nakalCount === 2) {
                this.submitTest(2);
            }else {
                if (document[this.hidden]) {
                    console.log(`hide --- `,this.state);
                } else {
                   this.setState({...this.state, showSecurityAlert:true, nakalCount:this.state.nakalCount+1});
                   console.log(`show ---`)
               }
            }
        }
      }

      componentWillUnmount(){
            document.removeEventListener(this.visibilityChange, this.handleVisibilityChange);
      }

      fetchResult = () => {
        let body = this.props.history.location.state.profile;

        menteePost(null,API_ENROLL_STUDENT_TO_START_TEST,body).then((data)=>{
            debugger;
            console.log("DATAAAA",data);
            if(data.contactId===null){
                toast.warning(data.status)
            }else{
                this.setState({...this.state, showLoader:false, showTimer:false});
                console.log("RESP",data)
               
                if(data.categoryResultList && data.categoryResultList.length>0){
                    let totalQuestion = 0;
                    let rightAns = 0;
                    let wrongAnswer = 0;
                    let categories = [];
                    let rightAnswers = [];

                    
            
                    data.categoryResultList.forEach((category,i)=>{
                        if(category.Total_Questions__c){
                            totalQuestion+= category.Total_Questions__c;
                            rightAns+= category.Right_Answered_Ques__c
                            wrongAnswer = totalQuestion-rightAns
                            categories.push(category.Name)
                            rightAnswers.push(category.Right_Answered_Ques__c)
                        }
                    })

                    let percentage = (rightAns/totalQuestion)*100;

                    
                    
                    const chartPoints = [
                        totalQuestion,
                        rightAns,
                        wrongAnswer
                    ]
                    data.doughnutCharts = chartPoints
                    data.piechat = {labels:categories,data:rightAnswers}
                    console.log("Responseee",data)

                    this.setState({...this.state, response:data,selected:percentage>=55,showTestResponse:true});
                }
            }
          }).catch((error)=>{
              debugger;
              console.log("Error",error);
          }).finally(()=> this.setState({...this.state, showLoader:false,submittionInProgress:false,showSecurityAlert:false,showSubmitTest:false}));
      }


   


       getGenericTest(sfid){
        this.setState({...this.state, showLoader:true})
          debugger;
          console.log("SFID RECEIVED",sfid);
            debugger
            httpsGET(null,`${API_GET_GENERIC_TEST}${sfid}`).then((data)=>{
                if(data && data.error){
                    console.log(data.techMsg);
                }else{
                    
                    this.setState({...this.state, showLoader:false})
                    console.log("RESP",data)
                   
                    if(data.categoryResultList && data.categoryResultList.length>0){
                        let totalQuestion = 0;
                        let rightAns = 0;
                        let wrongAnswer = 0;
                        let categories = [];
                        let rightAnswers = [];
                
                        data.categoryResultList.forEach((category,i)=>{
                            if(category.Total_Questions__c){
                                totalQuestion+= category.Total_Questions__c;
                                rightAns+= category.Right_Answered_Ques__c
                                wrongAnswer = totalQuestion-rightAns
                                categories.push(category.Name)
                                rightAnswers.push(category.Right_Answered_Ques__c)
                            }
                        })
                        const chartPoints = [
                            totalQuestion,
                            rightAns,
                            wrongAnswer
                        ]
                        data.doughnutCharts = chartPoints
                        data.piechat = {labels:categories,data:rightAnswers}
                        console.log("Responseee",data)
                    }else{
                        this.setState({...this.state, showTimer:true})
                    }
                    
                    this.setState({...this.state, response:data})
                }
            })
      }

    //setting  

    convertMillis(time){  
        const first = new Date();
        console.log(first.toString());
        const second = new Date(first);
        second.setMinutes(second.getMinutes() + time);
        console.log("TIME",firebase.firestore.Timestamp.fromDate(second).toDate())
        return firebase.firestore.Timestamp.fromDate(second).seconds
    }

    setOptionOfQuestion(ques,i,optionChoosed){
        
        var Questions = this.state.response.questionsList;
        if(!Questions[i].optionChoosed){
            this.setState({...this.state, option:[...this.state.option,optionChoosed]})
        }
        Questions[i].optionChoosed = optionChoosed;    
        this.setState({...this.state, response:{...this.state.response,questionsList:Questions}})
        
    }
     
    submitTest=(msgIndex)=>{
        
        let listOfQuestions=[]
        debugger;
        
        let catMap = new Map()

        let totalMarks = 0;

        this.state.response.questionsList.forEach((question,index)=>{
            console.log("question",question)
            if(!question.optionChoosed){
                question.optionChoosed = "answer_not_submitted"
            }
            
            let marks = question.Expected_Answer__c === question.optionChoosed?1:0
            totalMarks+=marks

            let body = {
                Question__c:question.Question__c,
                Answer__c:question.optionChoosed,
                Student_Test_Association__c:this.state.response.studentTestAssociationid,
                Que_Category__c:question.Category__c,
                Assessment_Question__c:question.Id
            }

            if(catMap.has(question.Category__c)){
                
                let moduleStac = catMap.get(question.Category__c)
                    moduleStac.Right_Answered_Ques__c += question.Expected_Answer__c === question.optionChoosed?1:0;
                    moduleStac.Total_Questions__c +=1;

                    console.log("Inside Map",moduleStac)
                    catMap.set(question.Category__c,moduleStac)
            }else{
                catMap.set(question.Category__c,
                    {   Name:question.Category__c,
                        Right_Answered_Ques__c:question.Expected_Answer__c === question.optionChoosed?1:0,
                        Total_Questions__c:1
                    })
                
            }

            listOfQuestions.push(body)
            

            
            console.log("Result ",catMap)
        })
        console.log("BODY - ",listOfQuestions)

        //push to server
        if(listOfQuestions.length===this.state.response.questionsList.length && listOfQuestions.length>0){
            debugger;

            if(!this.state.submittionInProgress){
                this.setState({...this.state,submittionInProgress:true,submitExamMsg:this.submittionMsg[msgIndex]})

                menteePost(null,API_POST_SUBMIT_GENERIC_TEST,{questions:listOfQuestions,nakalCount:this.state.nakalCount}).then((data)=>{
            
                    if(data.success){
                        console.log("After submitting test",data);
                        toast.success("Test submitted") 
                        setTimeout(()=>{
                            this.fetchResult();
                        },7000)
                        localStorage.setItem("hasubmitted",true);
                        localStorage.setItem("email",this.props.history.location.state.profile.contactInfo.Email)
                    }
                })
            }
        }
    }

    leftRightHandler=(type)=>{

        let index = this.state.questionIndex;
        index = type==="left"?index-1:index+1;

        
        if(this.state.response.questionsList && this.state.response.questionsList[index]){
            this.setState({...this.state, questionIndex:index});
            console.log("CURRENTQUEST",this.state.response.questionsList[index])
        }else{
            console.log("CURRENTQUEST","QUEST NOT FOUND")
        }
    }

    newStudentQuesUi=()=>{
        let optionVal = ['A','B','C','D','E','F','G','H','i','J','K','L','M','N','O','P','Q']
        
        if(this.state.response && this.state.response.questionsList && this.state.response.questionsList[this.state.questionIndex]){
            let ques = this.state.response.questionsList[this.state.questionIndex];
            
            let i = this.state.questionIndex;
            return(
                <div className="flex flex-col justify-center mt-5 p-3">              
                    <div className="flex flex-row items-center rounded-lg p-2">
                        <div className="rounded-full h-10 w-10 flex items-center justify-center p-1">
                            <h1 className="md:text-2xl text-xl text-gray-700 font-bold">{i+1}</h1>
                        </div>
                        <h1 className="text-gray-600 ml-5 md:text-xl text-base font-semibold">{ques.Question__c}</h1>
                    </div>  

                    {ques && ques.Answer_Picklist__c && ques.Answer_Picklist__c.split("||").map((op, j)=>(
                        <div onClick={()=>{
                            debugger;
                            this.setOptionOfQuestion(ques,i,op)
                        }}
                            className={this.state.response.questionsList[i].optionChoosed === op?"cursor-pointer flex flex-row items-center hover:bg-blue-100 rounded-lg p-2 bg-blue-200" :"cursor-pointer flex flex-row items-center hover:bg-blue-100 rounded-lg p-2" }
                        >
                    
                            <div className={this.state.response.questionsList[i].optionChoosed === op?"rounded-full h-10 w-10 flex items-center justify-center bg-blue-500 p-1 text-white":"rounded-full h-10 w-10 flex items-center justify-center border-2 border-gray-200 p-1 text-gray-500"}>
                                <h1 className="text-xl font-bold">{optionVal[j]}</h1>
                            </div>
                            <h1 className={this.state.response.questionsList[i].optionChoosed === op?"text-gray-700 ml-5 md:text-xl items-center text-sm mt-2":" text-gray-500 ml-5 md:text-xl text-sm mt-2"}>{op}</h1>
                        </div>  

                    
                    ))}
                <hr className="mt-5"/>
                <div className="flex flex-row justify-center mt-5">
                        <div className={this.state.questionIndex!==0?"cursor-pointer rounded-full p-3 bg-blue-500 mr-3 transform hover:bg-blue-700 hover:scale-110 motion-reduce:transform-none":"cursor-pointer rounded-full p-3 bg-gray-800 mr-3 transform hover:scale-110 motion-reduce:transform-none"}  onClick={() => {
                                            // if(pageNumber!==1){
                                            //     showPrevSet();
                                            // }
                                            this.leftRightHandler("left")
                                        }}
                                        
                                        >
                                        <IoIosArrowBack size={23} className="text-white"/>
                                    </div>

                                    <div className="cursor-pointer rounded-full p-3 bg-blue-500 hover:bg-blue-700 ml-3 transform hover:scale-110 motion-reduce:transform-none"  onClick={() => {
                                            this.leftRightHandler("right")
                                        }}
                                        >
                                        <IoIosArrowForward size={23} className="text-white"/>
                                    </div>
                    </div>
            </div>       
            )
        }else{
            return(
                <h1>Question not found</h1>
            )
        }
    }
    

    studentTestResponse=()=>{
        
        return(
            <div className="w-full flex justify-center">
                <div className="flex md:max-w-5xl justify-center">
                    <div className="w-full rounded-lg p-12 flex flex-col items-center ">
                    <h1>Result</h1>

                        <div className="md:mt-20 mt-5">

                            {this.state.response.doughnutCharts && this.state.response.doughnutCharts.length>0 && (
                                    <div className="flex md:flex-row flex-col justify-center md:px-4 mx-auto w-full">
                                    <div className="md:mb-12 mb-2 md:px-4 px-5 mx-2">
                                        <Doughnut
                                            data={this.state.response.doughnutCharts}
                                            labels={["Total Questions", "Right Answers", "Wrong Answers"]}
                                        />
                                    </div>
                                    <div className="md:mb-12 mb-2 md:px-4 px-5 mx-2">
                                        <Pie
                                            data={this.state.response.piechat.data}
                                            labels={this.state.response.piechat.labels}
                                        />
                                    </div>
                                </div>
                                )}
                        </div>

                        <div className="w-full bg-white flex flex-row justify-center md:mt-3 px-5 ">
                    <div className="w-full flex md:flex-row flex-col justify-center flex-wrap">
                        {this.state.response.categoryResultList && this.state.response.categoryResultList.map((categoryResult,i)=>{
                        return(
                            <>
                                <div id="particularSTA" className="bg-white rounded-lg shadow-md flex flex-col py-5 px-5 mx-2 my-2 border">
                                <h1 className="text-3xl text-gray-700 text-center">{categoryResult.Name}</h1>
                                <div className="flex flex-col justify-center">
                                <hr className="mt-3"/>
                                <div className="flex flex-row justify-between">
                                    <div id="markobtained" className="flex flex-col items-center pt-3 pr-3 text-gray-600">
                                        <h1 className="mt-3 text-xl">Marks</h1>
                                        <h1 className="mt-3 text-xl">{this.state.response.categoryResultList[i].Right_Answered_Ques__c}</h1>
                                    </div>
                                    <div id="totalQues" className="flex flex-col items-center pt-3 pr-3 text-gray-600">
                                        <h1 className="mt-3 text-xl">Questions</h1>
                                        <h1 className="mt-3 text-xl">{this.state.response.categoryResultList[i].Total_Questions__c}</h1>
                                    </div>
                                </div>

                                <div className="flex flex-row mb-5 justify-center">
                                    <div id="markobtained" className="flex flex-col items-center pt-3 pr-3 text-gray-600">
                                        <h1 className="text-xl">Correct Answer</h1>
                                        <h1 className="text-xl">{this.state.response.categoryResultList[i].Right_Answered_Ques__c}</h1>
                                    </div>
                                    <div id="totalQues" className="flex flex-col items-center pt-3 pr-3 text-gray-600">
                                        <h1 className="text-xl">Wrong Answer</h1>
                                        <h1 className="text-xl">{this.state.response.categoryResultList[i].Total_Questions__c-this.state.response.categoryResultList[i].Right_Answered_Ques__c}</h1>
                                    </div>
                                </div>
                                <hr className="mb-5"/>
                                {this.getProgressBar(categoryResult,i)}
                               
                                </div>
                            </div>
                        </>
                        )
                     }
                    )}
                    </div>
                </div>
                    </div>
                </div>
            </div>
          )
    }

    getProgressBar(categoryResult,i){
        let percentage = (this.state.response.categoryResultList[i].Right_Answered_Ques__c/this.state.response.categoryResultList[i].Total_Questions__c)*100;
        let progressColor;

        if(percentage<=55){
            progressColor = this.progressBarList[2];
        }else if(percentage>55 && percentage<=70){
            progressColor = this.progressBarList[1]
        }else{
            progressColor = this.progressBarList[0]
        }
        return(
            <ProgressBar
                percent={(this.state.response.categoryResultList[i].Right_Answered_Ques__c/this.state.response.categoryResultList[i].Total_Questions__c)*100}
                text={`${Math.round((this.state.response.categoryResultList[i].Right_Answered_Ques__c/this.state.response.categoryResultList[i].Total_Questions__c)*100)} %`} 
                filledBackground={progressColor}
            />
        )
    }

    showModulesQuestion2 =()=>{
        console.log("ModuleQues",this.state.response);
        
        //have to make changes from 
        return (
            <>
                {this.state.response && this.state.response.questionsList && this.state.response.questionsList.length>0?
                <>
                   
                    <div className="w-full flex md:bg-white rounded-lg justify-center md:px-5 bg-white">
                        <div className="w-full">
                            <h1 className="text-center mt-5 md:text-4xl text-xl">Generic Test</h1>
                            {/* {selectedModule.record.Test_type__c==="Pre"?studentQuesUi():studentQuesUi()} */}
                            {this.newStudentQuesUi()}

                            <div className="flex justify-center mt-5 mb-5">
                                <button className={this.state.response.questionsList.length===this.state.response.questionsList.filter((question)=>question.optionChoosed).length?"px-12 py-2 rounded-lg bg-blue-600 text-white":"disabled px-12 py-2 rounded-lg bg-gray-200 text-gray-500"} onClick={()=>{
                                    if(this.state.response.questionsList.length===this.state.response.questionsList.filter((question)=>question.optionChoosed).length){  this.setState({...this.state,testSubmittionType:"Submit",showSubmitTest:true})}
                                }}>Submit Test</button>
                            </div>

                            <div className="flex justify-center mt-5 mb-5">
                                <button className="px-14 py-2 rounded-lg bg-red-600 text-white" onClick={()=>{

                                    this.setState({...this.state,testSubmittionType:"END",showSubmitTest:true})
                                   debugger;
                                    //    if(this.containerRef.current) {
                                        
                                    //         this.containerRef.current.requestFullscreen()
                                    //         .then(function() {
                                    //             // element has entered fullscreen mode successfully
                                    //         })
                                    //         .catch(function(error) {
                                    //             // element could not enter fullscreen mode
                                    //         });
                                    //    }
                                    
                                }}>End Test</button>
                            </div>
                            <div className="md:hidden flex-wrap flex flex-row bg-white rounded-md px-5 py-3 mb-5 justify-center mt-3" style={{ height: "fit-content" }}>
                                    {this.state.response && this.state.response.questionsList && this.state.response.questionsList.length > 0 && this.state.response.questionsList.map((ques,i)=>{
                                        return(
                                            <h1 className={ques.optionChoosed?"cursor-pointer rounded-full p-2 bg-green-500 text-white ml-1 mr-1 text-base h-10 w-10 mb-2 text-center hover:bg-yellow-300":" text-center cursor-pointer rounded-full p-2 bg-red-500 text-white mr-1 ml-1 text-base h-10 w-10 mb-2 hover:bg-yellow-300"} onClick={()=>this.setState({...this.state,questionIndex:i})}>{i+1}</h1>
                                        )
                                    })}
                                </div> 
                        </div>
                        
                    </div> 
                </>
                :
                <div className="w-full flex md:bg-white rounded-lg justify-center py-2 md:px-5 bg-white">
                    <div className="w-full">
                        {this.studentTestResponse()}
                    </div>
                </div>
                }                
        
        </>
        )
    }

    sideLeftUi2=()=>{
        return(
            <>
                {this.state.response && this.state.response.questionsList && this.state.response.questionsList.length > 0 && 
                    <div className="w-full bg-white rounded-md flex flex-row justify-between mr-2 px-3 py-5 mb-3">
                        <div className="flex flex-row items-center">
                            <h1 className=" text-center cursor-pointer rounded-full p-1 bg-red-500 text-white mr-1 ml-1 text-base h-8 w-8 hover:bg-yellow-300">{this.state.response.questionsList.length - this.state.response.questionsList.filter((question)=>question.optionChoosed).length}</h1>
                            <h1 className="text-base text-center">Not attempted</h1>
                        </div>
                        <div className="flex flex-row items-center">
                        <h1 className=" text-center cursor-pointer rounded-full p-1 bg-green-500 text-white mr-2  text-base h-8 w-8 hover:bg-yellow-300">{this.state.response.questionsList.filter((question)=>question.optionChoosed).length}</h1>
                            <h1 className="text-base">Attempted</h1>
                        </div>
                    </div>
                }
                <div className="hidden md:flex-wrap md:flex flex-row bg-white rounded-md px-5 py-5 mb-5 justify-start mt-3" style={{ height: "fit-content" }}>
                    {this.state.response && this.state.response.questionsList && this.state.response.questionsList.length > 0 && this.state.response.questionsList.map((ques,i)=>{
                        return(
                            <h1 className={ques.optionChoosed?"cursor-pointer rounded-full p-2 bg-green-500 text-white ml-1 mr-1 text-base h-10 w-10 mb-2 text-center hover:bg-yellow-300":" text-center cursor-pointer rounded-full p-2 bg-red-500 text-white mr-1 ml-1 text-base h-10 w-10 mb-2 hover:bg-yellow-300"} onClick={()=>this.setState({...this.state,questionIndex:i})}>{i+1}</h1>
                        )
                    })}
                </div> 
            </>
        )
    }

    newPageUi2=()=>{
        return(
            <div className="md:px-5 bg-gray-100  md:py-5">
                <div className="w-full flex flex-row">
                        <div className="w-full flex md:flex-row flex-col">
                            <div className="w-full max-w-md  flex flex-col mr-5" style={{ height: "fit-content" }}>
                                {this.state.response.questionsList && this.state.response.questionsList.length>0?
                                    <>
                                        {this.sideLeftUi2()}
                                    </>:
                                    <h1 className="hidden md:block md:w-full bg-white p-5 rounded-md">Generic Question</h1>
                                }
                                
                            </div>
                            <div className="rounded-lg w-full flex flex-col">
                                {this.showModulesQuestion2()}
                            </div>
                        </div>
                </div>
            </div>
        )
    }

    handleEvent =(type)=>{
        if(type==="CLOSE"){
            this.setState({...this.state, showSecurityAlert:false});
        }
    }

    testResponseModalHandler =(type)=>{
        if(type==="CLOSE"){
            this.setState({...this.state, showTestResponse:false});
        }
    }


    submitExamHandler =(type)=>{
        if(type==="CLOSE"){
            this.setState({...this.state, showSubmitTest:false});
        }else{
            this.setState({...this.state, showSubmitTest:false});
            this.submitTest(0);
        }
    }

    renderer = ({ hours, minutes, seconds, completed }) => {
    
        if (completed) {
            if(!this.hasSubmittedTest.current){
                this.hasSubmittedTest.current = true;
                this.submitTest(1);
            }
            
          return <span>0S</span>;
        } else {
          return <span className={`${minutes <= this.state.response.alertTime ? "text-red-500" : "text-green-700" }`}>{hours}H : {minutes}M : {seconds}S</span>;
        }
      };

    getScreen=()=>{
        if(!this.props.history.location.state || !this.props.history.location.state.response){
            return <Redirect to="/starttest"/>
        }else{
            
        return(
        <div id="mainElement" className="w-full h-screen bg-gray-100" ref={this.containerRef}>

         
            {this.state.showLoader?
                <div className="container mx-auto py-4 px-12" >
                    <div className="flex items-center justify-center h-3/6">
                        <LoaderLarge type="ThreeDots" />
                    </div>
                </div>:
                <>


            <div className="w-full bg-gray-600 h-16 flex flex-row items-center justify-center md:justify-start">
                <div className="flex-shrink-0 flex ml-5">
                    <img
                        className="lg:block h-8 w-auto cursor-pointer"
                        src={logo}
                        alt="Workflow"
                    />
                </div>
                <h1 className="text-md items-center p-5 text-white font-bold md:text-xl">CodeGladiators</h1>
                
            </div>  

            <div className="w-full bg-white h-16 flex flex-row items-center justify-between ">
            
                <h1 className="text-lg items-center p-5">Qualification Test</h1>
                {this.state.showTimer &&
                    <div className="p-5 flex flex-row justify-center items-center">
                        <BsStopwatch size={25}/>
                        <h1 className=" text-sm md:text-lg md:ml-5 ml-2">{this.state.timer > 0 ? <Countdown date={Date.now()+((this.state.timer-firebase.firestore.Timestamp.now().seconds)*1000)} renderer={this.renderer}/> : <></>}</h1>
                    </div>
                }
                
            </div>  

            {this.newPageUi2()}  
                <CommonAlert 
                    handleEvent={this.handleEvent} 
                    showModal={this.state.showSecurityAlert} 
                    alertNumber={this.state.nakalCount} />

                <SubmitExam 
                    handleEvent={this.submitExamHandler} 
                    showModal={this.state.showSubmitTest} 
                    testType={this.state.testSubmittionType} />

                <TestResponse
                    handleEvent={this.testResponseModalHandler}
                    showModal = {this.state.showTestResponse}
                    type={this.state.selected}
                />
                    
                <WebReloader/>

              
            </>
            }
        </div>
        
        )
        }
    }


    render() {
        return(
            this.state.submittionInProgress?
            <>
            <div className="w-full flex py-4 md:px-12 px-5 items-center h-screen justify-center">
                <div className="flex flex-col justify-center">
                    <div className="flex justify-center">
                        <LoaderLarge type="ThreeDots" />
                    </div>
                    <h1 className="text-center">{this.state.submitExamMsg}</h1>
                    <div className="flex flex-col w-full mt-32 px-5 justify-center">
                        <div className="flex justify-center">
                            <div className="flex-shrink-0 flex mt-20 items-center">
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
                </div>
            </div>
            </>:
            this.getScreen()
        );
    }
    
}

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile
    };
};

export default connect(mapStateToProps)(GenericTest);