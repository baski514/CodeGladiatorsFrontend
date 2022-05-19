
import {React, useState,useEffect} from 'react'
import { connect } from "react-redux";
import Base from '../../Base';

import { httpsGET, httpsPOST as menteePost} from '../../../backend_api/menteeAPI';
import { httpsGET as mentorHtpsGet, httpsPOST as mentorHttpsPost,httpsDELETE } from '../../../backend_api/mentorAPI';
import { API_GET_DETAILED_MY_ENROLLMENTS,API_POST_SUBMIT_TEST,API_GET_DETAILED_MENTOR_ENROLLMENTS,API_CREATE_TEST, API_DELETE_TEST,API_POST_CREATE_PREDEFINE_TEST } from '../../../backend';
import { LoaderLarge } from '../../ui_utilities/Loaders';
import { toast } from 'react-toastify';
import { BsTrash } from 'react-icons/bs';
import DeleteAlert from '../../settings/DeleteAlert';
import {firebase} from '../../../config/fbConfig';
import { ProgressBar} from "react-step-progress-bar";
import "react-step-progress-bar/styles.css";
import Doughnut from "../../mentee/dashboard/charts/Doughnut";
import Pie from "../../mentee/dashboard/charts/Pie";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import {BsFileText} from "react-icons/bs"
import { ImFileEmpty } from 'react-icons/im';
import { Link } from 'react-router-dom';
import { GrDrag } from 'react-icons/gr';
import { MdShortText } from 'react-icons/md';
import { IoCloseOutline } from 'react-icons/io5';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { PATH_ASSESSMENT } from '../../path_constants';
import Slider from 'react-slick';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const TestMaster=({auth,profile,match,history})=>{

    const [showLoader, setShowLoader] = useState(true);
    const [showDeleteModalAlert,setShowDeleteModalAlert] = useState(false);
    const [dbResponse,setDbResponse] = useState([])
    const [selectedModule,setSelectedModule] = useState({})
    const [dbMentorResponse,setDbMentorResponse] = useState({})
    const [mentorSelectedEvent,setMentorSelectedEvent] = useState({});
    const [questions,setQuestions] =useState([]); 
    const [option,setOption] = useState([]);
    const [selectedTab,setSelectedTab] = useState(1);
    const [questionIndex,setQuestionIndex] = useState(0);

    useEffect(()=>{
        if(profile.userType==="student"  && match.params.stId==="questions"){
            fetchData(profile.sfid)
        }else if(profile.userType==="instructor"  && match.params.stId==="questions"){
            debugger;
            var newQuestion = {questionText: "Question",answer:false,answerKey:"",questionType:"radio", options : [{optionText: "Option 1"}], open: true, required:false,categoryText:""}
            setQuestions([...questions, newQuestion])
            fetchMentorData()
        }else if(profile.userType==="instructor" && match.params.stId){
            debugger;
            fetchData(match.params.stId)
        }
      },[])
  
    function fetchMentorData(){
          console.log("Called Mentor")
            firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                mentorHtpsGet({idToken,uid:auth.uid}, `${API_GET_DETAILED_MENTOR_ENROLLMENTS}${profile.sfid}`).then((data) => {
                    debugger;
                    if (data && data.error) {
                        console.log(data.techMsg);
                        toast.error(data.error)
                    } else if (data && data.Result) {
                        debugger;
                        console.log("MENTORResult",data.Result)

                        if(!mentorSelectedEvent.type){
                            if(data.Result[0].CourseMaster[0].Pre){
                                console.log("MENTORPREEE",data.Result[0].CourseMaster)
                                setMentorSelectedEvent({type:"Pre",event:[data.Result[0].CourseMaster[0]]});
                            }else if(data.Result[0].CEModules){
                                console.log("MENTORMODULE",data.Result[0].CEModules[0])
                                setMentorSelectedEvent({type:"Module",event:[data.Result[0].CEModules[0]]});
                            }
                        }

                        data.Result.forEach((res,i)=>{
                            debugger;
                            res.record.open = i===0? true:false
                        })
                        setDbMentorResponse(data.Result)
                    }else if(!data || !data.Result){
                        console.log("Response Data",data)
                        // toast("API ERROR")
                    }
                    setShowLoader(false)
                    });
            })  
    }

    function fetchData(sfid){
        firebase
        .auth()
        .currentUser.getIdToken(false)
        .then(function (idToken) {
            httpsGET({idToken,uid:auth.uid}, `${API_GET_DETAILED_MY_ENROLLMENTS}${sfid}`).then((data) => {
            if (data && data.error) {
                console.log(data.techMsg);
            } else if (data) {
                debugger;
                console.log("Result",data.Result)
                data.Result.forEach((res,index) => {
                    res.sta.forEach((modules,i)=>{
                        if(match.params.stId==="questions" && index===0 && !selectedModule.record && ((modules.record.Test_Type__c==="Post" && res.record.Status__c==="Course Completed")|| (modules.record.Test_Type__c==="Pre") || modules.record.Test_Type__c==="Module")){
                            setSelectedModule(data.Result[index].sta[i]);
                            res.record.open=index===0?true:false
                        }
                        
                        if(modules.record.Template__c && modules.record.Status__c==="Completed" && modules.starc && modules.starc.length>0){
                            
                            let totalQuestion = 0;
                            let rightAns = 0;
                            let wrongAnswer = 0;
                            let categories = [];
                            let rightAnswers = [];
                    
                            modules.starc.forEach((category,i)=>{
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
                            modules.doughnutCharts = chartPoints
                            modules.piechat = {labels:categories,data:rightAnswers}

                            if(match.params.stId!=="questions" && !selectedModule.record){
                                res.record.open = true
                                setSelectedModule(data.Result[index].sta[i])
                            }
                        }
                    })
                })
                console.log("DATA_CREATED",data.Result)

                setDbResponse(data.Result)

            }
            setShowLoader(false)
            });
        })
      }

    //setting  
    function handleExpand(i){
        if(profile.userType==="student" || (profile.userType==="instructor" && match.params.stId!=="questions")){
            let qs = [...dbResponse]; 
            for (let j = 0; j < qs.length; j++) {
                if(i ===j ){
                    qs[i].record.open = true;
                } else{
                    qs[j].record.open = false;
                }
            }
            setDbResponse(qs);
        }else{
            let qs = [...dbMentorResponse]; 
            for (let j = 0; j < qs.length; j++) {
                if(i ===j ){
                    qs[i].record.open = true;
                } else{
                    qs[j].record.open = false;
                }
            }
            setDbMentorResponse(qs);
        }
    }

    function addMoreQuestionField(){
        console.log("CALLING")
        expandCloseAll(); 
        setQuestions(questions=> [...questions, {questionText: "Question", questionType:"radio", options : [{optionText: "Option 1"}], open: true, required:false, categoryText:""}]);
    }

    function addQuestionType(i,type){
      let qs = [...questions];  
      console.log(type)
      qs[i].questionType = type;
      setQuestions(qs);
    }

    function onDragEnd(result) {
        if (!result.destination) {
          return;
        }
        var itemgg = [...questions];
        const itemF = reorder(
          itemgg,
          result.source.index,
          result.destination.index
        );
        setQuestions(itemF);
    }

    function deleteQuestion(i){
        let qs = [...questions]; 
        if(questions.length > 1){
          qs.splice(i, 1);
        }
        setQuestions(qs)
      }
      
      function handleOptionValue(text,i, j){
        var optionsOfQuestion = [...questions];
        optionsOfQuestion[i].options[j].optionText = text;
        //newMembersEmail[i]= email;
        setQuestions(optionsOfQuestion);
        console.log(optionsOfQuestion)
      }
    
      function handleQuestionValue(text, i){
        var optionsOfQuestion = [...questions];
        optionsOfQuestion[i].questionText = text;
        setQuestions(optionsOfQuestion);
      }

      function handleCategoryValue(text, i){
        var optionsOfQuestion = [...questions];
        optionsOfQuestion[i].categoryText = text;
        setQuestions(optionsOfQuestion);
      }

      function onDragEnd(result) {
          if (!result.destination) {
            return;
          }
          var itemgg = [...questions];
          const itemF = reorder(
            itemgg,
            result.source.index,
            result.destination.index
          );
          setQuestions(itemF);
      }
    
      const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
      };

      function addOption(i){
        var optionsOfQuestion = [...questions];
        if(optionsOfQuestion[i].options.length < 5){
          optionsOfQuestion[i].options.push({optionText: "Option " + (optionsOfQuestion[i].options.length + 1)})
        } else{
          console.log("Max  5 options ");  
        }
        //console.log(optionsOfQuestion);
        setQuestions(optionsOfQuestion)
      }
    
      function setOptionAnswer(ans,qno){
        var Questions = [...questions];
        Questions[qno].answerKey = ans;
        Questions[qno].points = Questions[qno].options.indexOf(Questions[qno].options.find(o=>o.optionText===ans))+1
        setQuestions(Questions)
        console.log("Answer choosed",questions[qno])
      }



      function setOptionPoints(points,qno){
        var Questions = [...questions];
        Questions[qno].points = points;
        setQuestions(Questions)
        console.log(qno+" "+points)
      }

      function addAnswer(i){
        var answerOfQuestion = [...questions];
        answerOfQuestion[i].answer= !answerOfQuestion[i].answer;
        setQuestions(answerOfQuestion)
      }

      function setOptionOfQuestion(ques,i,optionChoosed){
        var Questions = selectedModule.staq;
        if(!Questions[i].optionChoosed){
            setOption([...option,optionChoosed])
        }
        Questions[i].optionChoosed = optionChoosed;        
        setSelectedModule({...selectedModule,staq:Questions})
      }
    
      function doneAnswer(i){
        var answerOfQuestion = [...questions];
        answerOfQuestion[i].answer= !answerOfQuestion[i].answer;
        setQuestions(answerOfQuestion)
        console.log("Answer of ques",answerOfQuestion)
      }

      function requiredQuestion(i){
        var requiredQuestion = [...questions];
        requiredQuestion[i].required =  ! requiredQuestion[i].required
        console.log( requiredQuestion[i].required+" "+i);
        setQuestions(requiredQuestion)
      }
    

      function removeOption(i, j){
        var optionsOfQuestion = [...questions];
        if(optionsOfQuestion[i].options.length > 1){
          optionsOfQuestion[i].options.splice(j, 1);
          setQuestions(optionsOfQuestion)
          console.log(i + "__" + j);
        }   
      }
    
      function expandCloseAll(){
        let qs = [...questions]; 
        for (let j = 0; j < qs.length; j++) {  
          qs[j].open = false;
        }
        setQuestions(qs);
      }

      function mentorHandleExpand(i){
          console.log("Caling")
        let qs = [...questions]; 
        for (let j = 0; j < qs.length; j++) {
          if(i ===j){
            qs[i].open = true;
          }else{
            qs[j].open = false;
          }
        }
         setQuestions(qs);
      }

      function questionsUI(){
        return  questions.map((ques, i)=> (
          <Draggable key={i} draggableId={i + 'id'} index={i}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div>
              <div className="m-0">
                <div className="w-full flex justify-center">
                    
                  <GrDrag className="mt-3 mb-0" style={{transform: "rotate(-90deg)", color:'#97989A',position:"relative"}} fontSize="small"/>
                </div>
              {/* accordionOpen */}
                <div onChange={()=>{mentorHandleExpand(i)}} expanded={questions[i].open} 
                    className={questions[i].open ? 'border-l-8 border-orange-600' : ""}>
                 {/* accordianSummaryOpen*/}
                  <div            
                    className="cursor-pointer w-full pt-4 pb-4"
                    onClick={()=>{mentorHandleExpand(i)}}
                  >
                    { !questions[i].open && (

                  <div className="bg-white px-10 py-3 flex flex-col rounded-lg border-2">
                    
                    <div className="text-base pb-3" style={{fontWeight:"400",letterSpacing: '.1px',lineHeight:'24px'}} >{i+1}.  {ques.questionText}</div>
                    
                    {ques.options.map((op, j)=>(
                     
                     <div className="flex flex-row items-center" key={j}>
                        <input className="mr-3" type={ques.questionType} color="primary" required={ques.type} checked={ques.answerKey===ques.options[j].optionText?true:false}/>
                        {ques.options[j].optionText}
                     </div>
                    //  <div className="flex items-center"  >
                      
                    //   <div className="mb-3 flex flex-col bg-red-500 items-center key={j}">
                               
                    //        </div>
                    //  </div>
                    ))}  
                  </div>            
                  )}   
                  </div>
                      <div className="flex flex-row justify-center">
                      {!ques.answer ? (
                      questions[i].open &&    
                      <div className="bg-white w-full flex flex-col border-white border-8 capitalize -mt-12 ml-5" >   
                        <div >
                            <div className="flex flex-row items-center justify-between">
                                <input type="text" className="w-4/5 box-border mt-5 text-base flex text-black h-14 mb-3 mr-5 border-0 p-0" placeholder="Question"    value={ques.questionText} onChange={(e)=>{handleQuestionValue(e.target.value, i)}}></input>
                                
                                {/* <Select className="h-14 w-1/4 border-2 px-3 py-7 text-black mx-3 rounded-lg text-base" 
                                  defaultValue="radio">
                                    <MenuItem id="text" value="Text" onClick= {()=>{addQuestionType(i,"text")}}> <SubjectIcon className="mr-5"/>  Paragraph</MenuItem>
                                    <MenuItem id="checkbox"  value="Checkbox" onClick= {()=>{addQuestionType(i,"checkbox")}}><CheckBoxIcon className="mr-5 text-gray-700" checked /> Checkboxes</MenuItem>
                                    <MenuItem id="radio" value="Radio" onClick= {()=>{addQuestionType(i,"radio")}}> <Radio className="mr-5 text-gray-700"  checked/> Multiple Choice</MenuItem>
                                </Select>                     */}
                            </div>
                  
                            {ques.options.map((op, j)=>(
                                <>
                                <div className="flex items-center mb-2" key={j}> 
                                     <label style={{fontSize:"13px"}} onClick={()=>{setOptionAnswer(ques.options[j].optionText, i)}}>
                                        {(ques.questionType!=="text") ? 
                                              <input
                                              type={ques.questionType}
                                              className="mr-3 form-check-input"
                                              name={ques.questionText}
                                              value="option3"
                                            />:
                                            <MdShortText style={{marginRight:"10px"}} />
                                        }  
                                        </label>
                                        <div className="w-full">
                                        <input type="text" className="outline-none border-0 h-9 w-4/5 text-base text-black p-0" placeholder="option"  value={ques.options[j].optionText}onChange={(e)=>{handleOptionValue(e.target.value, i, j)}}></input>
                                    </div>     
                                    <IoCloseOutline className="cursor-pointer" size={25} onClick={()=>{removeOption(i, j)}}/>
                                </div>   
                                </>
                            ))}  
                          
                                {ques.options.length < 5 ? (
                                <div className="flex items-center">
                                   
                                   <div className="flex flex-row items-center">
                                        <input type={ques.questionType}  color="primary" inputProps={{ 'aria-label': 'secondary checkbox' }} disabled/> 
                                        <input type="text" className="outline-none border-0 text-base text-black pl-0 ml-2"  placeholder="Add other"></input>
                                        <button size="small" onClick={()=>{addOption(i)}} style={{textTransform: 'none',color:"#4285f4",fontSize:"13px",fontWeight:"600"}}>Add Option</button>
                                    </div>

                                {/* <FormControlLabel disabled control={ 
                                
                                (ques.questionType!="text") ? 
                                    <input type={ques.questionType}  color="primary" inputProps={{ 'aria-label': 'secondary checkbox' }} classNam="mx-5"  disabled/> :
                                    <MdShortText className="mr-5" />

                                    } label={
                                    <div className="ml-3">
                                        <input type="text" className="outline-none border-0 h-9 text-base text-black pl-0"  placeholder="Add other"></input>
                                        <button size="small" onClick={()=>{addOption(i)}} style={{textTransform: 'none',color:"#4285f4",fontSize:"13px",fontWeight:"600"}}>Add Option</button>
                                    </div>
                                    } />  */}
                                    </div>

                                ): ""}

                               <div className="flex justify-between">
                               <div className="flex mt-5 b-t-1 border-gray-700">
                               {mentorSelectedEvent.type!=="Module" && <input type="text" className="outline-none border h-9 text-base text-black pl-0" required placeholder="Enter Category" value={ques.categoryText} onChange={(e)=>{handleCategoryValue(e.target.value,i)}} />}
                                    
                              </div>
                                <div className="flex justify-end items-center mt-5 border-t-1 border-gray-700">

                                    <BsTrash size={19} onClick={()=>{deleteQuestion(i)}} className="text-fill text-gray-600 mr-3"/>
                                       
                                    {!ques.answer ? <button className="bg-purple-600 text-white px-5 py-2 rounded-sm hover:bg-purple-800" onClick={addMoreQuestionField}>Add Question</button>:""}
                                    {/* {!ques.answer ? <AiOutlinePlusCircle size={19} onClick={addMoreQuestionField} className="text-fill text-gray-600"/>: "" } */}

                                </div>
                              </div>
                            </div>
                            
                    </div>):(

                <div className="w-full flex flex-col border-white border-8 capitalize p-12 pt-0 ml-5" >
                         <div className="text-base text-gray-700 mb-3">
                              Choose Correct Answer
                         </div>
                        <div >
    <div className="flex flex-row items-center justify-between">
        <input type="text" className="question " placeholder="Question" value={ques.questionText} onChange={(e)=>{handleQuestionValue(e.target.value, i)}} disabled/>
        <input type="number" className="box-border" min="0" step="1" placeholder="0" onChange={(e)=>{setOptionPoints(e.target.value, i)}} />
    </div>

    {ques.options.map((op, j)=>(
        <div className="flex items-center" key={j} style={{marginLeft:"8px",marginBottom:"10px",marginTop:"5px"}}>

            <div key={j}>
                <div style={{display: 'flex'}} className="">
                <div className="form-check">
                  <label style={{fontSize:"13px"}} onClick={()=>{setOptionAnswer(ques.options[j].optionText, i)}}>

                  {(ques.questionType!=="text") ? 
                        <input
                        type={ques.questionType}
                        name={ques.questionText}
                        value="option3"
                        className="form-check-input"
                        required={ques.required}
                        style={{marginRight:"10px",marginBottom:"10px",marginTop:"5px"}}
                      />:
                      <MdShortText style={{marginRight:"10px"}} />
                  }  
                {ques.options[j].optionText}
                  </label>
                </div>
                </div>
              </div>
            
        </div>   
    ))}  
        <div className="flex items-center">
            <button size="small"  style={{textTransform: 'none',color:"#4285f4",fontSize:"13px",fontWeight:"600"}}> <BsFileText style={{fontSize:"20px",marginRight:"8px"}}/>Add Answer Feedback</button>
        </div>
        <div className="flex mt-5 justify-end border-t-1 border-gray-700 items-center">
          <button variant="outlined" color="primary"  style={{textTransform: 'none',color:"#4285f4",fontSize:"12px",marginTop:"12px",fontWeight:"600"}} onClick={()=>{doneAnswer(i)}}>
                        Done
                      </button>
        </div>
    </div>
    
</div>    
                    )}
                    </div>
                            
                </div>

              </div>
          </div>
          
                        </div>
                        
                      )}
          </Draggable>
          
         )
        )
      }

      const submitTest=()=>{
        var listOfQuestions=[]
        var listOfStacResp = []
        var catMap = new Map()

        var totalMarks = 0;

        selectedModule.staq.forEach((question,index)=>{
          console.log("question",question)
          if(!question.optionChoosed){
            toast.error(`Answer ${index+1} questions`)
            return false
          }else{
            let marks = question.Expected_Answer__c === question.optionChoosed?1:0
            totalMarks+=marks

            let body = {
              Question__c:question.Question__c,
              Answer__c:question.optionChoosed,
              Student_Test_Association__c:selectedModule.record.Id,
              Que_Category__c:question.Category__c,
              Assessment_Question__c:question.Id
            }

            if(selectedModule.record.Test_Type__c==="Pre" || selectedModule.record.Test_Type__c==="Post"){
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
            }

            listOfQuestions.push(body)
          }

          console.log("BODY - ",listOfQuestions)
        })

        if(listOfQuestions.length===selectedModule.staq.length){
          setShowLoader(true)
          firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
          menteePost({ idToken, uid: auth.uid},API_POST_SUBMIT_TEST,{listOfQuestions}).then((data)=>{
            debugger;
            if(data){
                let selectedModuleCopy = selectedModule
                selectedModuleCopy.record.Status__c = "Completed"
                
                console.log(selectedModuleCopy)

                if(selectedModuleCopy.record.Test_Type__c ==="Module"){    
                    listOfStacResp.push({Name:selectedModuleCopy.record.Template__c,Right_Answered_Ques__c:totalMarks,Total_Questions__c:listOfQuestions.length})
                    selectedModuleCopy.starc = listOfStacResp   
                }else{
                    const exResArr = [];
                    catMap.forEach(function(value, key) {
                        console.log(key + ' = ' + value)
                        exResArr.push(value);
                      })
                    selectedModuleCopy.starc = exResArr;//catMap.values()

                    debugger;
                    console.log("PRERESULT",selectedModuleCopy.starc)
                }

                if(selectedModuleCopy.record.Template__c && selectedModuleCopy.record.Status__c==="Completed" && selectedModuleCopy.starc && selectedModuleCopy.starc.length>0){
                            
                    let totalQuestion = 0;
                    let rightAns = 0;
                    let wrongAnswer = 0;
                    let categories = [];
                    let rightAnswers = [];
            
                    selectedModuleCopy.starc.forEach((category,i)=>{

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
                    selectedModuleCopy.doughnutCharts = chartPoints
                    selectedModuleCopy.piechat = {labels:categories,data:rightAnswers}
                }
                setSelectedModule(selectedModuleCopy);
                
                let dbResponseCopy = dbResponse;

                dbResponseCopy.forEach((response) => {
                    if(response.sta){
                        response.sta.forEach((data,i)=>{
                            if(data.record.Id===selectedModuleCopy.record.Id){
                                response.sta[i] = selectedModuleCopy
                            }
                        })
                    }
                })

                setDbResponse(dbResponseCopy)
                setShowLoader(false)
                toast.success("Test submitted") 
            }
          })
        })
        }
      }

      const sideLeftUi=()=>{
        if(match.params.stId==="questions"){
            if(profile.userType==="student"){
                return dbResponse.length>0 && dbResponse.map((enrolledCourse,i)=>{
                    return(
                      <div id="enrollment" className="bg-purple-600 flex flex-col rounded-lg text-white text-2xl mt-3">
                      <div onClick={()=>handleExpand(i)} expanded={enrolledCourse.record.open} 
                          className={enrolledCourse.record ? 'bg-gray-900' : ""} style={{backgroundColor:"transparent",color:"white",fontWeight:"400",fontSize:"6px",paddingLeft:0,borderRadius:"10px"}} >
                          <div            
                            className="cursor-pointer w-full pt-4 pb-4"
                          >
                               <div className="flex flex-col rounded-lg">
                                   <div ><h1 className="px-5 text-xl">{enrolledCourse.record.Course_Master_Name__c}</h1></div>
                                  </div>  
                          </div>   
                           {enrolledCourse.record.open &&
                                 <div className="w-full flex flex-col" style={{padding:'0px'}}>
                                 <div style={{marginTop:'-10px', padding:"0px"}}>
                                         <hr/>
                                         <div className="bg-gray-100 text-gray-800 flex flex-col m-5 rounded-lg p-3">
                                             {enrolledCourse.sta && enrolledCourse.sta.map((op, j)=>(   
                                               (op.record.Template__c  && ((op.record.Test_Type__c==="Module") || (op.record.Test_Type__c==="Pre") || (op.record.Test_Type__c==="Post" && enrolledCourse.record.Status__c==="Course Completed"))) && 
                                                   <h1 
                                                       className={(selectedModule.record.Test_Type__c!=="Module" && selectedModule.record.Test_Type__c===op.record.Test_Type__c)||(selectedModule.record.Test_Type__c==="Module" && selectedModule.record.Template__c===op.record.Template__c)?"rounded-lg py-2 bg-gray-700 cursor-pointer hover:bg-gray-900 hover:text-white my-2 px-5 text-base text-white":"rounded-lg cursor-pointer hover:bg-gray-700 hover:text-white my-2 py-2 px-5 text-base"} onClick={()=>setSelectedModule(op)}>
                                                       {op.record.Test_Type__c==="Module" ?op.record.Template__c
                                                       :op.record.Test_Type__c+" Test"}
                                                   </h1>
                                         ))}  
                                         </div>
                                 </div>
                             </div>
                        }
                           
                      </div>
                      </div>
                    )
                  
                })
            }else {
                
                return dbMentorResponse.length>0 && dbMentorResponse.map((enrolledCourse,i)=>{
                    return(
                        <div id="enrollment" className="bg-purple-600 flex flex-col rounded-lg text-white text-2xl mt-3">
                        
                        <div onClick={()=>handleExpand(i)} expanded={enrolledCourse.record.open} 
                            className={enrolledCourse.record ? 'bg-gray-900' : ""} style={{backgroundColor:"transparent",color:"white",fontWeight:"400",fontSize:"6px",paddingLeft:0,borderRadius:"10px"}} >
                            <div            
                                className="cursor-pointer w-full pt-4 pb-4"
                            >
                                 <div className="flex flex-col rounded-lg">
                                     <div ><h1 className="px-5 text-xl">{enrolledCourse.record.Course_Master_Name__c}</h1></div>
                                    </div>  
                                 
                            </div>    
                            {enrolledCourse.record.open &&
                              <div className="w-full flex flex-col" style={{padding:'0px'}}>
                                <div style={{marginTop:'-10px', padding:"0px"}}>
                                        <hr/>
                                        <div className="bg-gray-100 text-gray-800 flex flex-col m-5 rounded-lg p-3">
                                            {enrolledCourse.CourseMaster && enrolledCourse.CourseMaster[0].Pre && <h1 className="rounded-lg cursor-pointer hover:bg-gray-700 hover:text-white py-2 px-5 text-base" onClick={()=>setMentorSelectedEvent({type:"Pre",event:enrolledCourse.CourseMaster})}>Pre Test</h1>}
                                            {enrolledCourse.CEModules && enrolledCourse.CEModules.map((op, j)=>(
                                                <h1 className= {(mentorSelectedEvent.type==="Module" && mentorSelectedEvent.event.record.Name===op.record.Name)|| (mentorSelectedEvent.type==="Pre" && mentorSelectedEvent.event[0].record.Name===op.record.Name)?"rounded-lg py-2 bg-gray-700 cursor-pointer hover:bg-gray-900 hover:text-white my-2 px-5 text-base text-white":"rounded-lg cursor-pointer hover:bg-gray-700 hover:text-white my-2 py-2 px-5 text-base"} onClick={()=>{
                                                    setMentorSelectedEvent({type:"Module",event:op})
                                                    console.log("MentorSelectedEvent",mentorSelectedEvent)
                                                }}>{op.record.Name && op.record.Name}</h1>
                                            ))}
                                            {enrolledCourse.CourseMaster && enrolledCourse.CourseMaster[0].Post && <h1 className="rounded-lg cursor-pointer hover:bg-gray-700 hover:text-white py-2 px-5 text-base" onClick={()=>setMentorSelectedEvent({type:"Post",event:enrolledCourse.CourseMaster})}>Post Test</h1>}  
                                        </div>
                                </div>
                            </div>
                            }
                        </div>
                        </div>
                      )
                })
            }
        }else{
            //assesmentResult view by mentor
            return dbResponse.length>0 && dbResponse.map((enrolledCourse,i)=>{
                return showStudentResponseForMentor(enrolledCourse,i)
              
            })
        }  
      }
    const showStudentResponseForMentor=(enrolledCourse,i)=>{
        if(enrolledCourse.sta){
            let res = enrolledCourse.sta.filter((op)=>{
                return op.record.Template__c && op.record.Status__c==="Completed"
            })

            if(res.length>0){
                return(
                    <div id="enrollment" className="bg-purple-600 flex flex-col rounded-lg text-white text-2xl mt-3">
                    <div onClick={()=>handleExpand(i)} expanded={enrolledCourse.record.open} 
                        className={enrolledCourse.record ? 'bg-gray-900' : ""} style={{backgroundColor:"transparent",color:"white",fontWeight:"400",fontSize:"6px",paddingLeft:0,borderRadius:"10px"}} >
                        <div            
                          className="cursor-pointer w-full pt-4 pb-4"
                        >
                             <div className="flex flex-col rounded-lg">
                                 <div >
                                     <h1 className="px-5 text-xl">{enrolledCourse.record.Course_Master_Name__c}</h1>
                                 </div>
                              </div>  
                        </div> 
                        {enrolledCourse.record.open && 
                           <div className="w-full flex flex-col" style={{padding:'0px'}}>
                           <div style={{marginTop:'-10px', padding:"0px"}}>
                                   <hr/>
                                   <div className="bg-gray-100 text-gray-800 flex flex-col m-5 rounded-lg p-3">
                                       {enrolledCourse.sta && enrolledCourse.sta.map((op, j)=>(
                                          op.record.Template__c && op.record.Status__c==="Completed" && <h1 className={(selectedModule.record.Test_Type__c!=="Module" && selectedModule.record.Test_Type__c===op.record.Test_Type__c)||(selectedModule.record.Test_Type__c==="Module" && selectedModule.record.Template__c===op.record.Template__c)?"rounded-lg py-2 bg-gray-700 cursor-pointer hover:bg-gray-900 hover:text-white my-2 px-5 text-base text-white":"rounded-lg cursor-pointer hover:bg-gray-700 hover:text-white my-2 py-2 px-5 text-base"} onClick={()=>setSelectedModule(op)}>{op.record.Test_Type__c==="Module"?op.record.Template__c:op.record.Test_Type__c+" Test"}</h1>
                                   ))}  
                                   </div>
                           </div>
                       </div>
                        }   
                    </div>
                    </div>
                )
            }else{
                return null
            }
        }

        
    }

    const leftRightHandler=(type)=>{

        let index = questionIndex;
        index = type==="left"?index-1:index+1;

        debugger;
        if(selectedModule.staq && selectedModule.staq[index]){
            setQuestionIndex(index);
            console.log("CURRENTQUEST",selectedModule.staq[index])
        }else{
            console.log("CURRENTQUEST","QUEST NOT FOUND")
        }
    }

    const newStudentQuesUi=()=>{
        let optionVal = ['A','B','C','D','E','F','G','H','i','J','K','L','M','N','O','P','Q']
        
        if(selectedModule.staq[questionIndex]){
            let ques = selectedModule.staq[questionIndex];
            let i = questionIndex;
            return(
                <div className="flex flex-col justify-center mt-5">              
                    <div className="flex flex-row items-center rounded-lg p-2">
                        <div className="rounded-full h-10 w-10 flex items-center justify-center p-1">
                            <h1 className="text-2xl text-gray-700 font-bold">{i+1}</h1>
                        </div>
                        <h1 className="text-gray-700 ml-5 text-xl font-bold">{ques.Question__c}</h1>
                    </div>  

                    {ques.Answer_Picklist__c && ques.Answer_Picklist__c.split(",").map((op, j)=>(
                        <div onClick={()=>{
                            setOptionOfQuestion(ques,i,op)
                        }}
                            className={selectedModule.staq[i].optionChoosed === op?"cursor-pointer flex flex-row items-center  rounded-lg p-2 bg-blue-100" :"cursor-pointer flex flex-row items-center hover:bg-blue-50 rounded-lg p-2" }
                        >
                            <div className={selectedModule.staq[i].optionChoosed === op?"bg-blue-500 rounded-full h-10 text-white w-10 flex items-center justify-center  p-1":"rounded-full h-10 w-10 text-gray-500 flex items-center justify-center border-2 border-gray-400 p-1"}>
                                <h1 className="text-xl font-bold">{optionVal[j]}</h1>
                            </div>
                            <h1 className={selectedModule.staq[i].optionChoosed === op?"text-gray-700 ml-5 text-xl":"text-gray-500 ml-5 text-xl"}>{op}</h1>
                        </div>  

                    
                    ))}
                <hr className="mt-5"/>
                <div className="flex flex-row justify-center mt-5">
                        <div className={questionIndex!==0?"cursor-pointer rounded-full p-3 bg-blue-500 mr-3 transform hover:bg-blue-700 hover:scale-110 motion-reduce:transform-none":"cursor-pointer rounded-full p-3 bg-gray-800 mr-3 transform hover:scale-110 motion-reduce:transform-none"}  onClick={() => {
                                            // if(pageNumber!==1){
                                            //     showPrevSet();
                                            // }
                                            leftRightHandler("left")
                                        }}
                                        
                                        >
                                        <IoIosArrowBack size={23} className="text-white"/>
                                    </div>

                                    <div className="cursor-pointer rounded-full p-3 bg-blue-500 hover:bg-blue-700 ml-3 transform hover:scale-110 motion-reduce:transform-none"  onClick={() => {
                                            leftRightHandler("right")
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
    
    const studentQuesUi2 =()=>{
        let optionVal = ['A','B','C','D','E','F','G','H','i','J','K','L','M','N','O','P','Q']
        
        return(
            <div className="mb-5 p-3">
                <div className="flex flex-col">
                  
                    {
                        selectedModule.staq && selectedModule.staq.map((ques,i)=>(
                                
                            <div className="flex flex-col justify-center mt-5">
                                    
                                <div className="flex flex-row items-center rounded-lg p-2">
                                    <div className="rounded-full h-10 w-10 flex items-center justify-center p-1">
                                        <h1 className="text-2xl text-gray-700 font-bold">{i+1}</h1>
                                    </div>
                                    <h1 className="text-gray-700 ml-5 text-xl font-bold">{ques.Question__c}</h1>
                                </div>  

                                {ques.Answer_Picklist__c && ques.Answer_Picklist__c.split(",").map((op, j)=>(
                                    
                                    <div onClick={()=>{
                                        setOptionOfQuestion(ques,i,op)
                                    }}
                                    className={selectedModule.staq[i].optionChoosed === op?"cursor-pointer flex flex-row items-center  rounded-lg p-2 bg-blue-100" :"cursor-pointer flex flex-row items-center hover:bg-blue-50 rounded-lg p-2" }
                                    >
                                        <div className={selectedModule.staq[i].optionChoosed === op?"bg-blue-500 rounded-full h-10 text-white w-10 flex items-center justify-center  p-1":"rounded-full h-10 w-10 text-gray-500 flex items-center justify-center border-2 border-gray-400 p-1"}>
                                            <h1 className="text-xl font-bold">{optionVal[j]}</h1>
                                        </div>
                                        <h1 className={selectedModule.staq[i].optionChoosed === op?"text-gray-700 ml-5 text-xl":"text-gray-500 ml-5 text-xl"}>{op}</h1>
                                    </div>  

                                  
                                ))}
                                <hr className="mt-5"/>
                            </div>       
                            
                        ))
                    }
                </div>
            </div>
        )
    }


    const mentorQuesUI =()=>{
        let model=null;
        let optionVal = ['A','B','C','D','E','F','G','H','i','J','K','L','M','N','O','P','Q']


        if(mentorSelectedEvent && (mentorSelectedEvent.type==="Pre"|| mentorSelectedEvent.type==="Post")){
            console.log("MentorSelectedEventPree",mentorSelectedEvent)
            let list = [];
            if(mentorSelectedEvent.event[0] && mentorSelectedEvent.type==="Pre"){
                list = mentorSelectedEvent.event[0].Pre
            }else if(mentorSelectedEvent.event[0] && mentorSelectedEvent.type==="Post"){
                list = list = mentorSelectedEvent.event[0].Post
            }
            console.log("LIST CHOOSEN",list)
            return(
                <div>
                     <div className="flex flex-row rounded-lg justify-center mt-3">
                        <div className="rounded-lg bg-white flex flex-row border-2">
                            <div className={selectedTab===1?"bg-purple-500 text-white rounded-tl-lg rounded-bl-lg  py-2 px-12":"cursor-pointer bg-white text-gray-700 px-12 py-2 rounded-tl-lg rounded-bl-lg"} onClick={()=>setSelectedTab(1)}>Test</div>
                            <div className={selectedTab===2?"bg-purple-500 text-white rounded-tr-lg rounded-br-lg py-2 px-5":"cursor-pointer bg-white text-gray-700 rounded-tr-lg rounded-br-lg py-2 px-5"} onClick={()=>setSelectedTab(2)}>Add Question</div>
                        </div>
                    </div>
                    {selectedTab===1?
                         <div className="flex flex-col">
                         {list.map((ques,i)=>{
                             return(
                                 <div className="flex flex-col justify-center mt-5 p-3">
                                 <div className="flex flex-row items-center rounded-lg p-2">
                                     <div className="rounded-full h-10 w-10 flex items-center justify-center p-1">
                                         <h1 className="text-2xl text-gray-700 font-bold">{i+1}</h1>
                                     </div>
                                     <h1 className="text-gray-600 ml-5 text-xl font-semibold">{ques.Question__c}</h1>
                                 </div>  
         
                                 {ques.Answer_Picklist__c && ques.Answer_Picklist__c.split(",").map((op, j)=>(
                                       <div
                                             className={ques.Expected_Answer__c=== op?"cursor-pointer flex flex-row items-center hover:bg-blue-100 rounded-lg p-2 bg-blue-200" :"cursor-pointer flex flex-row items-center hover:bg-blue-100 rounded-lg p-2" }
                                             >
                                         <div className={ques.Expected_Answer__c=== op?"rounded-full h-10 w-10 flex items-center justify-center bg-blue-500 p-1 text-white":"rounded-full h-10 w-10 flex items-center justify-center border-2 border-gray-200 p-1 text-gray-500"}>
                                             <h1 className="text-xl font-bold">{optionVal[j]}</h1>
                                         </div>
                                       <h1 className="text-gray-600 ml-5 text-xl">{op}</h1>
                                       </div>  
                                   
                                 ))}
                                 <hr className="mt-5"/>
                             </div>     
                             )
                         })}
                     </div>:
                     <>
                     {/* <h1>Add Question</h1> */}
                        {createQuesUi()}    
                     </>
                    }
                </div>  
            )
           
        }else if(mentorSelectedEvent && mentorSelectedEvent.type === "Module"){
            if(mentorSelectedEvent.event.ModuleAssessmentQuestions!==null){
                return(
                    <div>
                     <div className="flex flex-row rounded-lg justify-center mt-3">
                        <div className="rounded-lg bg-white flex flex-row border-2">
                            <div className={selectedTab===1?"bg-purple-500 text-white rounded-tl-lg rounded-bl-lg  py-2 px-12":"cursor-pointer bg-white text-gray-700 px-12 py-2 rounded-tl-lg rounded-bl-lg"} onClick={()=>setSelectedTab(1)}>Test</div>
                            <div className={selectedTab===2?"bg-purple-500 text-white rounded-tr-lg rounded-br-lg py-2 px-5":"cursor-pointer bg-white text-gray-700 rounded-tr-lg rounded-br-lg py-2 px-5"} onClick={()=>setSelectedTab(2)}>Add Question</div>
                        </div>
                    </div>
                    {selectedTab===1?
                         <div className="flex flex-col">
                         {mentorSelectedEvent.event.ModuleAssessmentQuestions.map((ques,i)=>{
                             return(
                                 <div className="flex flex-col justify-center mt-5 p-3">
                                 <div className="flex flex-row items-center rounded-lg p-2">
                                     <div className="rounded-full h-10 w-10 flex items-center justify-center p-1">
                                         <h1 className="text-2xl text-gray-700 font-bold">{i+1}</h1>
                                     </div>
                                     <h1 className="text-gray-600 ml-5 text-xl font-semibold">{ques.Question__c}</h1>
                                 </div>  
         
                                 {ques.Answer_Picklist__c && ques.Answer_Picklist__c.split(",").map((op, j)=>(
                                       <div
                                             className={ques.Expected_Answer__c=== op?"cursor-pointer flex flex-row items-center hover:bg-blue-100 rounded-lg p-2 bg-blue-200" :"cursor-pointer flex flex-row items-center hover:bg-blue-100 rounded-lg p-2" }
                                             >
                                         <div className={ques.Expected_Answer__c=== op?"rounded-full h-10 w-10 flex items-center justify-center bg-blue-500 p-1 text-white":"rounded-full h-10 w-10 flex items-center justify-center border-2 border-gray-200 p-1 text-gray-500"}>
                                             <h1 className="text-xl font-bold">{optionVal[j]}</h1>
                                         </div>
                                       <h1 className="text-gray-600 ml-5 text-xl">{op}</h1>
                                       </div>  
                                   
                                 ))}
                                 <hr className="mt-5"/>
                             </div>     
                             )
                         })}
                     </div>:
                     <>
                     {/* <h1>Add Question</h1> */}
                        {createQuesUi()}    
                     </>
                    }
                </div>
                )
                //showQuesUi
                // return(
                // <div className="flex flex-col">
                //         {mentorSelectedEvent.event.ModuleAssessmentQuestions.map((ques,i)=>{
        
                //         // createQuesLayoutUi(ques,i)
                //         return(
                //         <div className="flex flex-col justify-center mt-5">
                                    
                //         <div className="flex flex-row items-center rounded-lg p-2">
                //             <div className="rounded-full h-10 w-10 flex items-center justify-center p-1">
                //                 <h1 className="text-2xl text-gray-700 font-bold">{i+1}</h1>
                //             </div>
                //             <h1 className="text-gray-600 ml-5 text-xl font-semibold">{ques.Question__c}</h1>
                //         </div>  

                //         {ques.Answer_Picklist__c && ques.Answer_Picklist__c.split(",").map((op, j)=>(
                //               <div
                //                     className={ques.Expected_Answer__c=== op?"cursor-pointer flex flex-row items-center rounded-lg p-2 bg-blue-100" :"cursor-pointer flex flex-row items-center hover:bg-blue-50 rounded-lg p-2" }
                //                     >
                //                 <div className={ques.Expected_Answer__c=== op?"rounded-full h-10 w-10 flex items-center justify-center p-1 text-white bg-blue-500":"rounded-full h-10 w-10 flex items-center justify-center border-2 border-gray-400 p-1 text-gray-500"}>
                //                     <h1 className="text-xl  font-bold">{optionVal[j]}</h1>
                //                 </div>
                //               <h1 className="text-gray-600 ml-5 text-xl">{op}</h1>
                //               </div>  
                          
                //         ))}
                //         <hr className="mt-5"/>
                //     </div>     
                //     )  
                
                // })}
                //     </div>
                //     )
               
            }else{
                //create QuesUi
                return(
                    <div>
                        <div className="flex flex-row rounded-lg justify-center mt-3">
                            <div className="rounded-lg bg-white flex flex-row border-2">
                                <div className={selectedTab===1?"bg-purple-500 text-white rounded-tl-lg rounded-bl-lg  py-2 px-12":"cursor-pointer bg-white text-gray-700 px-12 py-2 rounded-tl-lg rounded-bl-lg"} onClick={()=>setSelectedTab(1)}>Test</div>
                                <div className={selectedTab===2?"bg-purple-500 text-white rounded-tr-lg rounded-br-lg py-2 px-5":"cursor-pointer bg-white text-gray-700 rounded-tr-lg rounded-br-lg py-2 px-5"} onClick={()=>setSelectedTab(2)}>Add Question</div>
                            </div>
                        </div>
                        {selectedTab===1?
                              <div className="cursor-pointer border-dotted border-4  rounded-xl py-8 max-w-sm mx-auto justy-items-center my-8" onClick={()=>setSelectedTab(2)}>
                                <ImFileEmpty size={72} className="mx-auto fill-current text-black"/>
                                <h2 className="text-base text-center mt-2"> Test not found </h2>
                                <h2 className="text-sm text-center"> Create new </h2>
                              </div>
                            :<>{createQuesUi()}</>
                        }
                        
                    </div>
                )
                
            }
        }
        return model;
    }

    const createQuesUi=()=>{
        return(
            <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable"
            >
            {(provided, snapshot) => (
            <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="max-w-5xl"
            >

                {questionsUI()}
                {mentorSelectedEvent.event[0] && (mentorSelectedEvent.event[0].Pre || mentorSelectedEvent.event[0].Post) && <div className="flex justify-center mt-12">
                    <button className={questions.length===questions.filter((q)=>q.answerKey).length?"px-12 py-2 rounded-lg bg-purple-600 text-white":"px-12 py-2 rounded-lg bg-gray-300 text-white"} onClick={()=>{
                        if(questions.length===questions.filter((q)=>q.answerKey).length){
                            createPredefineTest()
                        }else{
                            toast("Select options of all questions");
                        }
                    }}>Create Test</button>
                </div> }

                {mentorSelectedEvent.type==="Module" &&
                     <div className="flex justify-center mt-12">
                     <button className={questions.length===questions.filter((q)=>q.answerKey).length?"px-12 py-2 rounded-lg bg-purple-600 text-white":"px-12 py-2 rounded-lg bg-gray-300 text-white"} onClick={()=>{
                          if(questions.length===questions.filter((q)=>q.answerKey).length){
                              if(mentorSelectedEvent.event.ModuleAssessmentQuestions===null){
                                  //creating New Test for module
                                  createTest()
                              }else{
                                  //Test has created already adding more question 
                                createPredefineTest()
                              }
                         }else{
                             toast("Select options of all questions");
                         }
                     }}>Create Test</button>
                 </div>
                }
                {/* {mentorSelectedEvent.event.ModuleAssessmentQuestions===null && 
                    <div className="flex justify-center mt-12">
                    <button className={questions.length===questions.filter((q)=>q.answerKey).length?"px-12 py-2 rounded-lg bg-purple-600 text-white":"px-12 py-2 rounded-lg bg-gray-300 text-white"} onClick={()=>{
                         if(questions.length===questions.filter((q)=>q.answerKey).length){
                            createTest()
                        }else{
                            toast("Select options of all questions");
                        }
                    }}>Create Test</button>
                </div>
                } */}
                {provided.placeholder}
            </div>
            )} 
          </Droppable>
        </DragDropContext>
        )
    }

    const noCourseEnrollUi=(msg)=>{
        if(msg){
            return(
                <div className="max-w-4xl mx-auto bg-white rounded-lg  py-7 m-5 px-12 ">
                    <div className="flex flex-col justify-center w-full">
                        <img src="https://imgproxy.epicpxls.com/UuwJaK46rwY9p05lYVnY0_PyKy8GP2VMPn6u9LndL1c/rs:fill:800:600:0/g:no/aHR0cHM6Ly9pdGVt/cy5lcGljcHhscy5j/b20vdXBsb2Fkcy9w/aG90by9jMzM4Y2Vl/NGQ2NmI4ZGI2MTQ2/MTMxYjAzN2RlNDc4/MA.jpg" alt="no course enrolled" />
                        <h1 className="text-center text-gray-500">{msg}</h1>
                    </div>
                </div>
            )
        }else{
            return(
                <div className="max-w-4xl mx-auto bg-white rounded-lg  py-7 m-5 px-12 ">
                    <div className="flex flex-col justify-center w-full">
                        <img src="https://imgproxy.epicpxls.com/UuwJaK46rwY9p05lYVnY0_PyKy8GP2VMPn6u9LndL1c/rs:fill:800:600:0/g:no/aHR0cHM6Ly9pdGVt/cy5lcGljcHhscy5j/b20vdXBsb2Fkcy9w/aG90by9jMzM4Y2Vl/NGQ2NmI4ZGI2MTQ2/MTMxYjAzN2RlNDc4/MA.jpg" alt="no course enrolled" />
                        <h1 className="text-center text-gray-500">No Course Enrolled yet, <br/>   <Link
                    to={`/`}
                    className="hover:overflow-hidden"
                >Enroll new course!</Link></h1>
                    </div>
                    
                </div>
            )
        }
    }

    const createTest =()=>{
        setShowLoader(true)
        firebase
        .auth()
        .currentUser.getIdToken(false)
        .then(function (idToken) {
            mentorHttpsPost({idToken, uid: auth.uid}, API_CREATE_TEST+mentorSelectedEvent.event.record.Id, {questions,moduleName:mentorSelectedEvent.event.record.Name}).then((data) => {
            debugger;
            if (data) { 
                console.log("Created Test",data)
                let copyResp = mentorSelectedEvent
                copyResp.event.ModuleAssessmentQuestions = data
                setShowLoader(false)
                setMentorSelectedEvent(copyResp)
                toast.success("Test created")
                console.log("Test Response ",data)
                setSelectedTab(1)
                var newQuestion = {questionText: "Question",answer:false,answerKey:"",questionType:"radio", options : [{optionText: "Option 1"}], open: true, required:false,categoryText:""}
                setQuestions([newQuestion])
            }
        });
        })
      }


      const createPredefineTest=()=>{
        const listOfQuestions = []

        let Assessment_Question_Master__c;
        if(mentorSelectedEvent.type==="Pre" && mentorSelectedEvent.event[0].Pre){
            Assessment_Question_Master__c = mentorSelectedEvent.event[0].Pre[0].Assessment_Question_Master__c
        }else if(mentorSelectedEvent.type==="Post" && mentorSelectedEvent.event[0].Post){
            Assessment_Question_Master__c = mentorSelectedEvent.event[0].Post[0].Assessment_Question_Master__c
        }else if(mentorSelectedEvent.type === "Module" && mentorSelectedEvent.event.ModuleAssessmentQuestions[0].Assessment_Question_Master__c){
            Assessment_Question_Master__c = mentorSelectedEvent.event.ModuleAssessmentQuestions[0].Assessment_Question_Master__c
        }


        if(questions && questions.length>0){
            questions.forEach((question)=>{
                let options="";
                question.options.forEach((option,index)=>{
                    if(index===question.options.length-1){
                        options+=option.optionText
                    }else{
                        options+=option.optionText+","
                    }
                })

                let body = {
                    Assessment_Question_Master__c:Assessment_Question_Master__c,
                    Question__c:question.questionText,
                    Answer_Type__c: "Picklist",
                    Answer_Picklist__c:options,
                    Expected_Answer__c:question.answerKey,
                    Category__c:question.categoryText
                }
                listOfQuestions.push(body)
            })
        }


          console.log("Question you created",listOfQuestions);
          debugger;
          setShowLoader(true)

          firebase
          .auth()
          .currentUser.getIdToken(false)
          .then(function (idToken) {
              mentorHttpsPost({idToken, uid: auth.uid}, API_POST_CREATE_PREDEFINE_TEST,{listOfQuestions}).then((data) => {
              debugger;
              if (!data.error) { 
                  let copyResp = mentorSelectedEvent
                if(copyResp.type==="Pre" && copyResp.event[0].Pre){
                    data.forEach((ques,i)=>{
                        copyResp.event[0].Pre.push(ques)
                    })
                }else if(copyResp.type==="Post" && copyResp.event[0].Post){
                    data.forEach((ques,i)=>{
                        copyResp.event[0].Post.push(ques)
                    })
                }else if(copyResp.type==="Module"){
                    data.forEach((ques,i)=>{
                        copyResp.event.ModuleAssessmentQuestions.push(ques)
                    })
                }
                var newQuestion = {questionText: "Question",answer:false,answerKey:"",questionType:"radio", options : [{optionText: "Option 1"}], open: true, required:false,categoryText:""}
                setQuestions([newQuestion])
                  setShowLoader(false)
                  setMentorSelectedEvent(copyResp)
                  toast.success("Question Added")
                  setSelectedTab(1)
                  console.log("Test Response ",data)
              }else{
                  toast(data.error)
                  setShowLoader(true)
              }
          });
          })
      }
    
    

    const studentTestResponse=()=>{
        console.log("SelectedModule",selectedModule);
        return(
            <div className="w-full flex justify-center ">
                <div className="flex md:max-w-5xl justify-center">
                    <div className="w-full rounded-lg p-12 flex flex-col items-center ">
                    <h1>{selectedModule.record.Test_Type__c==="Module"?selectedModule.record.Template__c:`${selectedModule.record.Test_Type__c} Test`}</h1>
                        <h1 className="mt-5">Test Response</h1>
                        <div className="md:mt-20 mt-5">

                            {selectedModule.doughnutCharts && selectedModule.doughnutCharts.length>0 && (
                                    <div className="flex md:flex-row flex-col justify-center md:px-4 mx-auto w-full">
                                    <div className="md:mb-12 mb-2 md:px-4 px-5 mx-2">
                                        <Doughnut
                                            data={selectedModule.doughnutCharts}
                                            labels={["Total Questions", "Right Answers", "Wrong Answers"]}
                                        />
                                    </div>
                                    <div className="md:mb-12 mb-2 md:px-4 px-5 mx-2">
                                        <Pie
                                            data={selectedModule.piechat.data}
                                            labels={selectedModule.piechat.labels}
                                        />
                                    </div>
                                </div>
                                )}
                        </div>

                        <div className="bg-white justify-center flex flex-row md:mt-20">
                    
                    <div className={selectedModule.record.Test_Type__c!=="Pre" && selectedModule.record.Test_Type__c!=="Post"?" sm:grid sm:grid-cols-1":" sm:grid sm:grid-cols-3"}>
                    {selectedModule.starc && selectedModule.starc.map((categoryResult,i)=>{
                        return(
                            <>
                                <div id="particularSTA" className="bg-purple-600 rounded-lg flex flex-col py-5 px-5 mx-2 my-2">
                                <h1 className="text-3xl text-white text-center">{categoryResult.Name}</h1>
                                <div className="flex flex-col justify-center">
                                
                                <div className="flex flex-row justify-center">
                                    <div id="markobtained" className="flex flex-col items-center pt-3 pr-3 text-white">
                                        <h1 className="mt-3 text-xl">Marks</h1>
                                        <h1 className="mt-3 text-xl">{selectedModule.starc[i].Right_Answered_Ques__c}</h1>
                                    </div>
                                    <div id="totalQues" className="flex flex-col items-center pt-3 pr-3 text-white">
                                        <h1 className="mt-3 text-xl">Questions</h1>
                                        <h1 className="mt-3 text-xl">{selectedModule.starc[i].Total_Questions__c}</h1>
                                    </div>
                                </div>

                                <div className="flex flex-row mb-5 justify-center">
                                    <div id="markobtained" className="flex flex-col items-center pt-3 pr-3 text-white">
                                        <h1 className="text-xl">Correct Answer</h1>
                                        <h1 className="text-xl">{selectedModule.starc[i].Right_Answered_Ques__c}</h1>
                                    </div>
                                    <div id="totalQues" className="flex flex-col items-center pt-3 pr-3 text-white">
                                        <h1 className="text-xl">Wrong Answer</h1>
                                        <h1 className="text-xl">{selectedModule.starc[i].Total_Questions__c-selectedModule.starc[i].Right_Answered_Ques__c}</h1>
                                    </div>
                                </div>
                                <ProgressBar
                                    percent={(selectedModule.starc[i].Right_Answered_Ques__c/selectedModule.starc[i].Total_Questions__c)*100}
                                    text={`${Math.round((selectedModule.starc[i].Right_Answered_Ques__c/selectedModule.starc[i].Total_Questions__c)*100)} %`} 
                                    filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
                                />
                                </div>
                            </div>

                          
                        </>
                        )})}

                    </div>
                </div>
                    </div>
                </div>
            </div>
          )
    }

    const SampleNextArrow=(props)=> {
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
                    backgroundColor: "rgba(168, 85, 247, 1)",
                    boxShadow:
                        "0 0 1px 1px rgba(20,23,28,.1), 0 3px 1px 0 rgba(20,23,28,.1)",
                    zIndex: "1",
                    // top: "calc( 50% - 25px)",
                }}
                onClick={onClick}
            />
        );
    }

    const SamplePrevArrow=(props)=>{
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
                    backgroundColor: "rgba(168, 85, 247, 1)",
                    boxShadow:
                        "0 0 1px 1px rgba(20,23,28,.1), 0 3px 1px 0 rgba(20,23,28,.1)",
                    zIndex: "1",
                    // top: "calc( 50% - 25px)",
                }}
                onClick={onClick}
            />
        );
    }

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        initialSlide: 0,
        prevArrow: <SamplePrevArrow />,
        nextArrow: <SampleNextArrow />,
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



    const showModulesQuestion =()=>{
        //have to make changes from 
        if(profile.userType==="student" && selectedModule.record){
            return (
                <>
                    {selectedModule && selectedModule.record.Status__c==="Pending"?
                    <>
                       
                        <div className="w-full flex md:bg-white rounded-lg justify-center md:px-5 bg-white">
                            <div className="w-full">
                                <h1 className="text-center mt-5 text-4xl">{selectedModule.record.Test_Type__c==="Module"?selectedModule.record.Template__c:`${selectedModule.record.Test_Type__c} Test`}</h1>
                                {/* {selectedModule.record.Test_type__c==="Pre"?studentQuesUi():studentQuesUi()} */}
                                {selectedModule.record.Test_type__c==="Pre"?newStudentQuesUi():newStudentQuesUi()}

                                <div className="flex justify-center mt-5 mb-5">
                                    <button className={selectedModule.staq.length===selectedModule.staq.filter((question)=>question.optionChoosed).length?"px-12 py-2 rounded-lg bg-blue-600 text-white":"disabled px-12 py-2 rounded-lg bg-gray-200 text-gray-500"} onClick={()=>{
                                        if(selectedModule.staq.length===selectedModule.staq.filter((question)=>question.optionChoosed).length){submitTest()}
                                    }}>Submit Test</button>
                                </div>
                                <div className="flex-wrap flex flex-row bg-white rounded-md px-5 py-3 mb-5 justify-center">
                                        {selectedModule.staq && selectedModule.staq.map((ques,i)=>{
                                            return(
                                                <h1 className={ques.optionChoosed?"cursor-pointer rounded-full p-2 bg-green-500 text-white ml-1 mr-1 text-base h-10 w-10 mb-2 text-center hover:bg-yellow-300":" text-center cursor-pointer rounded-full p-2 bg-red-500 text-white mr-1 ml-1 text-base h-10 w-10 mb-2 hover:bg-yellow-300"} onClick={()=>setQuestionIndex(i)}>{i+1}</h1>
                                            )
                                        })}
                                    </div>
                               
                            </div>
                        </div> 
                    </>
                    :
                    <div className="w-full flex md:bg-white rounded-lg justify-center py-2 md:px-5 bg-white">
                        <div className="w-full">
                            {studentTestResponse()}
                        </div>
                    </div>
                    }                
            
            </>
            )
        }else if(profile.userType==="instructor" && mentorSelectedEvent.type){
            return(
                <div className="w-full flex md:bg-white rounded-lg justify-center  py-2 md:px-5 bg-white">
              <div className="max-w-4xl w-full">
                  {console.log("MentorSelectedEvent",mentorSelectedEvent)}
             <h1 className="text-center mt-5 text-4xl mb-5">{mentorSelectedEvent.type==="Module"?mentorSelectedEvent.event.record.Name:`${mentorSelectedEvent.type} Test`}</h1>
             <hr/>
                   
                {mentorQuesUI()}
                {/* {mentorSelectedEvent.type==="Module" && mentorSelectedEvent.event.ModuleAssessmentQuestions!==null && 
                    <div className="flex flex-col mt-12 items-center" >
                        <BsTrash size={72} className="text-fill text-red-500" onClick={()=>setShowDeleteModalAlert(true)}/>
                        <h1 className="text-3xl text-gray-900 mt-3">Remove Test</h1>
                    </div>
                } */}
              </div>
              </div>
            )
        }
    }

    

    const deleteTestEvent =(type,action)=>{
        if(type==="CLOSE"){
            setShowDeleteModalAlert(false)
        }else{
            setShowLoader(true)

        firebase
        .auth()
        .currentUser.getIdToken(false)
        .then(function (idToken) {
            httpsDELETE({idToken, uid: auth.uid}, API_DELETE_TEST + mentorSelectedEvent.event.ModuleAssessmentQuestions[0].Assessment_Question_Master__c).then((data) => {
                if (data && data.error) {
                    console.log("ERROR from SERVER",data.error);
                    toast.error(data.error)
                    
                } else if (data && data.success) {
                    setShowDeleteModalAlert(false)
                    toast("Test Removed")

                    let mentorSelectedEventCopy = mentorSelectedEvent
                    mentorSelectedEventCopy.event.ModuleAssessmentQuestions = null
                    setMentorSelectedEvent(mentorSelectedEventCopy)
                    console.log("DeleteEvent",mentorSelectedEventCopy)
                }
                setShowLoader(false)
              });
        })
            
        }
        // if(type==="CLOSE"){
        //   setShowDeleteModalAlert(false)
        // }else{
        //   setShowLoader(true)
        //   let courseId = dbQuestions.length===0 && courseMasterId!=null?courseMasterId:dbQuestions[0].Assessment_Question_Master__c
        //   console.log("MasterId",courseId)
        //   httpsDELETE(null, API_DELETE_TEST + courseId).then((data) => {
        //     if (data && data.error) {
        //         console.log("ERROR from SERVER",data.error);
        //         toast.error(data.error)
                
        //     } else if (data && data.success) {
        //         setShowDeleteModalAlert(false)
        //         toast("Test Removed")
        //         setDbQuestions([]);
        //     }
        //     setShowLoader(false)
        // });
        // }
      }

      //settings

    return(
        <Base history={history} activeTabName={match.params.stId==="questions"?"Assesment":""} pathList={match.params.stId==="questions"?PATH_ASSESSMENT:""}>
              {showLoader ? (
                <div className="container mx-auto py-4 px-12">
                    <div className="flex items-center justify-center h-3/6">
                        <LoaderLarge type="ThreeDots" />
                    </div>
                </div>
            ) :(
            <>
            <div className="w-full bg-white h-16 flex flex-row items-center justify-between">
                <h1 className="text-lg items-center p-5">Assessment Questions</h1>
                {/* <h1 className="text-lg items-center p-5">Assessment Questions</h1> */}
                
                {profile.userType==="student" && 
                    <div className="flex flex-row mr-5 justify-between">
                        <div className="flex flex-row items-center mr-5">
                            <div className="h-4 w-4 bg-red-500 rounded-full mr-3"></div>
                            <h1 className="text-xl">Not attempted</h1>
                        </div>
                        <div className="flex flex-row items-center">
                            <div className="h-4 w-4 bg-green-600 rounded-full mr-3"></div>
                            <h1 className="text-xl">Attemped</h1>
                        </div>
                    </div>
                }
            </div>    
            <div className="px-5 bg-gray-100 h-screen py-5">
                <div className="w-full flex flex-row">
                    {dbResponse.length>0 || dbMentorResponse.length>0?
                        <>
                            {match.params.stId==="questions"?  
                                <div className="w-full flex md:flex-row flex-col">
                                    <div className="w-full max-w-md bg-white rounded-md flex flex-col p-5 mr-5" style={{ height: "fit-content" }}>
                                        {sideLeftUi()}
                                    </div>
                                    <div className="rounded-lg w-full flex flex-col">
                                        {profile.userType==="student" && dbResponse.length>0 && showModulesQuestion()}
                                        {profile.userType==="instructor" && dbMentorResponse.length>0 && mentorSelectedEvent && showModulesQuestion()} 
                                    </div>
                                </div>
                                :<>
                                {/* //studentResponseViewByMentor */}
                                    {selectedModule.record && selectedModule.record.Status__c==="Completed"?
                                        <div className="md:grid md:grid-cols-3 flex flex-col">
                                            <div className="md:col-span-1 rounded-lg p-5 md:my-16" style={{ height: "fit-content" }}>
                                                    {sideLeftUi()}
                                                </div>
                                                <div className="md:col-span-2 rounded-lg md:m-5 md:py-7">
                                                    <div className="w-full flex md:bg-white rounded-lg justify-center md:m-10 py-2 md:px-5 bg-white">
                                                        <div className="w-full">
                                                            {studentTestResponse()}
                                                        </div>
                                                    </div>
                                                </div>
                                        </div>
                                        :
                                        <>
                                            {noCourseEnrollUi("Exam not submitted yet!")}
                                        </>
                                    }
                                </>
                            }
                        </>
                        :<>
                            {noCourseEnrollUi()}
                        </>
                    }
                </div>
                
            {showDeleteModalAlert && <DeleteAlert showModal={showDeleteModalAlert} handleEvent={deleteTestEvent} action="TEST" />}
            </div>
            </>
            )
            }
        </Base>
    )
}


const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile
    };
};

export default connect(mapStateToProps)(TestMaster);