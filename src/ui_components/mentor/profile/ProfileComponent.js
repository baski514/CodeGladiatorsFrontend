import { React, useState, useEffect } from "react";
import { connect } from "react-redux";
import Base from '../../Base'
import {RiBankLine} from 'react-icons/all'
import moment from "moment";
import update from "immutability-helper";
import { randomColor } from "randomcolor";
import DeleteAlert from '../../settings/DeleteAlert'
import { FaAward, FaBriefcase, FaPencilAlt, FaTrash} from "react-icons/fa";
import ifsc from "ifsc";
import {
    httpsGET,
    httpsPOST,
    httpsDELETE,
} from "../../../backend_api/mentorAPI";
import {
    API_POST_EDIT_SKILL,
    API_POST_SKILL,
    API_GET_PROFILE,
    API_POST_EDIT_EXPERIENCE,
    API_POST_EXPERIENCE,
    API_POST_EDIT_BANK_DETAILS,
    API_POST_CREATE_BANK_DETAILS,
    API_DELETE_BANK_DETAILS,
    API_DELETE_EXPERIENCE,
    API_DELETE_SKILL,

} from "../../../backend";

import PersonalInformation from "./PersonalInformation";
import CommonDetailModal from "../../settings/CommonDetailModal";
import { toast } from "react-toastify";
import { firebase } from "../../../config/fbConfig";



const ProfileComponent = ({ auth, profile, match, history, location }) => {


    const [showDeleteAlert,setShowDeleteAlert] = useState(false)
    const [isEdit, setIsEdit] = useState(false);
    const [showModal,setShowModal] = useState(false);
    const [selectedTab,setSelectedtab] = useState(1)

    const [skills, setSkills] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [bankDetails,setbankDetails] = useState([])

    const [experience, setExperience] = useState({Name:"",Start_Date__c:"",End_Date__c:"",Description__c:"",Occupation__c:""});
    const [skill, setSkill] = useState({Name: "",Description__c:""});
    const [bankDetail, setBankDetail] = useState({Bank_Name__c:"",Bank_Account_Number__c:"",Bank_Holder_Name__c:"",Bank_Address__c:"",Bank_IFSC_Code__c:"",Contact__c:"",Primary__c:false});

    const [bankError, setBankError] = useState({Bank_Name__c:false,Bank_Account_Number__c:false,Bank_Holder_Name__c:false,Bank_Address__c:false,Bank_IFSC_Code__c:false});
    const [skillError, setSkillError] = useState({Name: false,Description__c:false});
    const [experienceError, setExperienceError] = useState({Name:false,Start_Date__c:false,End_Date__c:false,Description__c:false,Occupation__c:false});

    const [action,setAction] = useState("")
    const [selectedEvent,setSelectedEvent] = useState({})

    useEffect(() => {
        profileLoader();
    }, []);



    const profileLoader = () => {
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsGET({idToken , uid: auth.uid}, `${API_GET_PROFILE}${profile.sfid}`).then((data) => {
                    console.log("Datat Resp ",data)
                    if (data && data.length > 0) {
                        const profileDetail = data[0];
                        if (profileDetail.Key_Skill__r)
                            setSkills(profileDetail.Key_Skill__r.records);
                        if (profileDetail.Employment_detail__r)
                            setExperiences(profileDetail.Employment_detail__r.records);
                        if(profileDetail.Bank_Accounts__r){
                            setbankDetails(profileDetail.Bank_Accounts__r.records)
                        }
                    }
                });
            });
    };


    let primaryAccontId;
  
    if(bankDetails){
        for(let i=0; i<bankDetails.length;i++){
            if(bankDetails[i].Primary__c){
                primaryAccontId = bankDetails[i]
                break;
            }
        }
    }
  
    
    const handleChange = (e) => {
        if(selectedTab===2){
            setSkill({ ...skill,[e.target.id]: e.target.value });
        }else if(selectedTab===3){
            setExperience({ ...experience,[e.target.id]: e.target.value });
        }else if(selectedTab===4){
            setBankDetail({ ...bankDetail,[e.target.id]: e.target.value });
        }
        
    };

    //Handler

    const deleteModalEvent =(type,action)=>{
        if(type==="CLOSE"){
            setShowDeleteAlert(false)
        }else{
            if(action==="SKILLS"){
                deleteSkill(selectedEvent)
            }else if(action==="ORG"){
                deleteExperience(selectedEvent)
            }else if(action==="ACCOUNT"){
                deleteAccount(selectedEvent)
            }
        }
    }

    
    const addSkillHandler = (skill, isEdit) => { 
        if(isEdit) {
            const index = skills.findIndex((skl) => skl.Id === skill.Id);
            const updatedSkills = update(skills, {
                $splice: [[index, 1, skill]],
            }); 
            setSkills(updatedSkills);
        }else {
            setSkills([...skills, skill]);
        }

    }

    const addExpHandler = (experience, isEdit) => {
        if (isEdit) {
            const index = experiences.findIndex(
                (exp) => exp.Id === experience.Id
            );
            const updatedExpirences = update(experiences, {
                $splice: [[index, 1, experience]],
            }); // array.splice(start, deleteCount, item1)
            setExperiences(updatedExpirences);
        } else {
            const allExperiences = experiences;
            allExperiences.push(experience);
            setExperiences(allExperiences);
        }
    };

    const addBankDetailHandler = (bankDetail, isEdit) => {
        if (isEdit) {
            console.log("BankDetailId",bankDetail)
            for(let i=0;i<bankDetails.length;i++){

                if(bankDetails[i].Primary__c===true){
                    bankDetails[i].Primary__c = false
                }

                if(bankDetails[i].Id===bankDetail.Id){
                    console.log("Index",bankDetail)
                    const updateBankDetails = update(bankDetails, {
                        $splice: [[i, 1, bankDetail]],
                    }); // array.splice(start, deleteCount, item1)
        
                    setbankDetails(updateBankDetails)
                }
            }

        } else {
            for(let i=0;i<bankDetails.length;i++){
                if(bankDetails[i].Primary__c===true && bankDetail.Primary__c){
                    bankDetails[i].Primary__c = false
                }
            }
            const allBankAccountDetails = bankDetails;
            allBankAccountDetails.push(bankDetail);
            setbankDetails(allBankAccountDetails);
        }
    };


    const editSkillHandler = (skill) => {
        delete skill["attributes"];
        setSkill(skill);
        setIsEdit(true);
        setShowModal(true);
    };

    const editExpHandler = (experience) => {
        delete experience["attributes"];
        setExperience(experience);
        setIsEdit(true);
        setShowModal(true);
    }

    const editBankDetailHandler = (details) => {
        delete details["attributes"];
        setBankDetail(details);
        setIsEdit(true);
        setShowModal(true);
    }
    
    const deleteAccount = (expId) => {
        console.log(expId);
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsDELETE({idToken , uid: auth.uid}, API_DELETE_BANK_DETAILS + expId).then((data) => {
                    if (data && data.error) {
                        console.log("ERROR from SERVER");
                        toast.error(data.error)
                    } else if (data && data.success) {
                        toast.success("Account removed")
                        deleteBankDetailsHandler(expId);
                    }
                }).finally(()=>setShowDeleteAlert(false));
            });
    }
   
    const deleteExperience = (expId) => {
        console.log(expId);
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsDELETE({idToken , uid: auth.uid}, API_DELETE_EXPERIENCE + expId).then((data) => {
                    if (data && data.error) {
                        console.log("ERROR from SERVER");
                    } else if (data && data.success) {
                        toast.success("Experience Deleted")
                        deleteExpHandler(expId);
                    }
                }).finally(()=>setShowDeleteAlert(false));
            });
    }
    const deleteExpHandler = (expId) => {
        // Delete at a specific index, no matter what value is in it
        const index = experiences.findIndex((exp) => exp.Id === expId);
        const updatedExpirences = update(experiences, { $splice: [[index, 1]] });
        setExperiences(updatedExpirences);
    }

    const deleteBankDetailsHandler = (accId) => {
        // Delete at a specific index, no matter what value is in it
        const index = bankDetails.findIndex((exp) => exp.Id === accId);
        const updatedBankDetails = update(bankDetails, { $splice: [[index, 1]] });
        setbankDetails(updatedBankDetails);
    }

    const deleteSkill = (skillId) => {
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsDELETE({idToken , uid: auth.uid}, API_DELETE_SKILL + skillId).then((data) => {
                    if (data && data.error) {
                        console.log('ERROR from SERVER');
                        toast.error(data.error)
                    } else if (data && data.success) {
                        toast.success("Skill removed")
                        deleteSkillHandler(skillId);
                    }
                }).finally(()=>{
                    setShowDeleteAlert(false)
                });
            });
    };

    const deleteSkillHandler = (skillId) => {
        // Delete at a specific index, no matter what value is in it
        const index = skills.findIndex((skill) => skill.Id === skillId);
        const updatedSkills = update(skills, {
            $splice: [[index, 1]],
        });
        setSkills(updatedSkills);
    };

    // handlerEvents 

    const handleEvent=(type)=>{
        if(type==="CLOSE"){
            setShowModal(false)
        }else{
            if(selectedTab===2){
                createSkill()
                console.log("Skill Details",skill)
            }else if(selectedTab===3){
                createOrganization()
                console.log("Exp Details",experience)
            }else if(selectedTab===4){
                console.log("Bank Details",bankDetail)
                createAdditionalDetail()
            }
        }
    }

    const resetState = () => {
        if(selectedTab===2){
            setSkill({ Name: "" });
        }else if(selectedTab===3){
            setExperience({ Name: "", Start_Date__c: "", End_Date__c: "" ,Description__c:"",Experience_in_Months__c:"",Occupation__c:""});
        }else if(selectedTab===4){
            setBankDetail({Bank_Name__c:"",Bank_Account_Number__c:"",Bank_Holder_Name__c:"",Bank_Address__c:"",Bank_IFSC_Code__c:"",Contact__c:"",Primary__c:false});
        }
        setIsEdit(false);
        setShowModal(false);
    };

    const createSkill=()=>{
        if(skill.Name.length===0){
            setSkillError({
                Name:true,
                Description__c:false
            })
        }else if(skill.Description__c.length===0){
            setSkillError({
                Name:false,
                Description__c:true
            })
        }else{
            firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsPOST(
                    { idToken, uid: auth.uid},
                    isEdit ? API_POST_EDIT_SKILL + profile.sfid : API_POST_SKILL + profile.sfid,
                    skill
                ).then((data) => {
                    if (data.error) {
                        toast.error(data.error)
                    } else if (data && data.id) {
                        //console.log(data);
                        const newSkill = skill;
                        newSkill.Id = data.id;
                        addSkillHandler(newSkill, isEdit);
                        resetState();
                        
                        toast.success("Skills Created")
                    }
                }).finally(()=>{
                    setShowModal(false)
                });

            });
        }
    }
    
    const createOrganization=()=>{
        if(experience.Name.length===0){
            setExperienceError({
                Name:true,Start_Date__c:false,End_Date__c:false,Description__c:false,Occupation__c:false
            })
        }else if(experience.Start_Date__c.length===0){
            setExperienceError({
                Name:false,Start_Date__c:true,End_Date__c:false,Description__c:false,Occupation__c:false
            })
        }else if(experience.End_Date__c.length===0){
            setExperienceError({
                Name:false,Start_Date__c:false,End_Date__c:true,Description__c:false,Occupation__c:false
            })
        }else if(experience.Description__c.length===0){
            setExperienceError({
                Name:false,Start_Date__c:false,End_Date__c:false,Description__c:true,Occupation__c:false
            })
        }else if(experience.Occupation__c.length===0){
            setExperienceError({
                Name:false,Start_Date__c:false,End_Date__c:false,Description__c:false,Occupation__c:true
            })
        }else{
            let exp = experience
            exp.Experience_in_Months__c =   moment(experience.End_Date__c).diff(moment(experience.Start_Date__c),'months')
            firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsPOST({idToken , uid: auth.uid}, isEdit ? API_POST_EDIT_EXPERIENCE + profile.sfid : API_POST_EXPERIENCE + profile.sfid, exp).then(
                    (data) => {
                        //console.log(data);
                        if (data && data.error) {
                            toast.error(data.error)
                        } else if (data && data.id) {
                            const newExperience = experience;
                            newExperience.Id = data.id;
                            addExpHandler(newExperience, isEdit);
                            resetState();
                            toast.success("Experience Added")
                        }
                    }
                ).finally(()=>setShowModal(false));
            });
        }
    }

    const createAdditionalDetail=()=>{
        
        if(bankDetail.Bank_Name__c.length===0){
            setBankError({
                Bank_Name__c:true,
                Bank_Account_Number__c:false,
                Bank_IFSC_Code__c:false,
                Bank_Holder_Name__c:false,
                Bank_Address__c:false
            })
        }else if(bankDetail.Bank_Account_Number__c.length===0){
            setBankError({
                Bank_Name__c:false,
                Bank_Account_Number__c:true,
                Bank_IFSC_Code__c:false,
                Bank_Holder_Name__c:false,
                Bank_Address__c:false
            })
        }
        else if(bankDetail.Bank_IFSC_Code__c.length===0 || !ifsc.validate(bankDetail.Bank_IFSC_Code__c)){
            setBankError({
                Bank_Name__c:false,
                Bank_Account_Number__c:false,
                Bank_IFSC_Code__c:true,
                Bank_Holder_Name__c:false,
                Bank_Address__c:false
            })
        }
        else if(bankDetail.Bank_Holder_Name__c.length===0){
            setBankError({
                Bank_Name__c:false,
                Bank_Account_Number__c:false,
                Bank_IFSC_Code__c:false,
                Bank_Holder_Name__c:true,
                Bank_Address__c:false
            })
        }
        else if(bankDetail.Bank_Address__c.length===0){
            setBankError({
                Bank_Name__c:false,
                Bank_Account_Number__c:false,
                Bank_IFSC_Code__c:false,
                Bank_Holder_Name__c:false,
                Bank_Address__c:true
            })
        }else{
            if (bankDetail.Name !== "") {

                bankDetail.Contact__c = profile.sfid

                let body;

                if(primaryAccontId && bankDetail.Primary__c ){
                    bankDetail.Primary__c = true
                    body={
                        current:bankDetail, 
                        prev:primaryAccontId
                    }
                }else{
                    bankDetail.Primary__c = bankDetails.length===0 || (bankDetails.length>0 && !bankDetails[0].Primary__c)?true:false
                    body={
                        current:bankDetail,
                        prev:null
                    }
                }
                firebase
                .auth()
                .currentUser.getIdToken(false)
                .then(function (idToken) {
                    httpsPOST({idToken , uid: auth.uid}, isEdit ? API_POST_EDIT_BANK_DETAILS + profile.sfid : API_POST_CREATE_BANK_DETAILS, body).then(
                        (data) => {
                            if (data && data.error) {
                                toast.error(data.error)
                            } else if (data && data.id) {
                                const newExperience = bankDetail;
                                newExperience.Id = data.id;
                                addBankDetailHandler(newExperience, isEdit);
                                resetState();
                                toast.success("Bank Details created")
                            }
                        }
                    ).finally(()=>setShowModal(false));
                });
            }
            else {
                toast.error("Please fill all details")
            }
        }
    }

    const modalUi=()=>{
        if(selectedTab===2){
            return skillModalUi()
        }else if(selectedTab===3){
            return orgModalUi()
        }else if(selectedTab===4){
            return additionalModalUi()
        }
    }

    //modalUi
    const skillModalUi=()=>{
        return(
            <div class="grid gap-8 grid-cols-1">
            <div class="flex flex-col ">
                    <div class="flex flex-col sm:flex-row items-center">
                        <h2 class="font-semibold text-lg mr-auto">Add Skill</h2>
                    </div>
                    <div class="mt-2">
                        <div class="form">
                            <div class="md:space-y-2 mb-3">
                                <div class="mb-3 space-y-2 w-full text-xs">
                                    <label class=" font-semibold text-gray-600 py-2">Skill Name</label>
                                    <div class="flex flex-wrap items-stretch w-full mb-4 relative">
                                        <input className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4" 
                                          id="Name"
                                          type="text"
                                          placeholder="Name"
                                          onChange={handleChange}
                                          value={skill.Name}
                                        />
                                        {skillError.Name?<p className="text-red-500">Enter skill</p>:null}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex-auto w-full mb-1 text-xs space-y-2">
                                <label class="font-semibold text-gray-600 py-2">Description</label>
                                    <textarea className="min-h-[100px] max-h-[300px] h-28 appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg  py-4 px-4" placeholder="Some description about your role" 
                                      id="Description__c"
                                      type="text"
                                      onChange={handleChange}
                                      value={skill.Description__c}></textarea>
                                      {skillError.Description__c?<p className="text-red-500">Description...</p>:null}
							</div>

                            </div>
                                </div>
                            </div>
                        </div>
        )
    }

    const orgModalUi=()=>{
        return(
            <div class="grid gap-8 grid-cols-1">
            <div class="flex flex-col ">
                    <div class="flex flex-col sm:flex-row items-center">
                        <h2 class="font-semibold text-lg mr-auto">Add Experience</h2>
                    </div>
                    <div class="mt-2">
                        <div class="form">
                            <div class="md:space-y-2 mb-3">
                                <div class="mb-3 space-y-2 w-full text-xs">
                                    <label class=" font-semibold text-gray-600 py-2">Company Name</label>
                                    <div class="flex flex-wrap items-stretch w-full mb-4 relative">
                                        <input className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4" 
                                          id="Name"
                                          type="text"
                                          placeholder="Name"
                                          onChange={handleChange}
                                          value={experience.Name}
                                        />
                                        {experienceError.Name?<p className="text-red-500">Enter company name</p>:null}
                                    </div>
                                </div>

                                <div class="mb-3 space-y-2 w-full text-xs">
                                    <label class=" font-semibold text-gray-600 py-2">Role</label>
                                    <div class="flex flex-wrap items-stretch w-full mb-4 relative">
                                        <input className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4" 
                                           id="Occupation__c"
                                           type="text"
                                           placeholder="Role"
                                           onChange={handleChange}
                                           value={experience.Occupation__c}
                                        />
                                        {experienceError.Occupation__c?<p className="text-red-500">Enter Role</p>:null}
                                    </div>
                                </div>
                            </div>


                            <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 py-2">Start From</label>
                                        <input
                                            className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                                            id="Start_Date__c"
                                            type="date"
                                            placeholder="Started From"
                                            onChange={handleChange}
                                            value={experience.Start_Date__c}
                                        />
                                        {experienceError.Start_Date__c?<p className="text-red-500">Choose Start Date</p>:null}
                                </div>
                                <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 py-2">End Date</label>
                                        <input
                                            className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                                            id="End_Date__c"
                                            type="date"
                                            placeholder="End Date"
                                            onChange={handleChange}
                                            value={experience.End_Date__c}
                                        />
                                        {experienceError.End_Date__c?<p className="text-red-500">Enter End Date</p>:null}
                                </div>
                            </div>
                            
                            <div class="flex-auto w-full mb-1 text-xs space-y-2">
                                <label class="font-semibold text-gray-600 py-2">Description</label>
                                    <textarea className="w-full min-h-[100px] max-h-[300px] h-28 appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg  py-4 px-4" placeholder="Some description about your role" 
                                      id="Description__c"
                                      type="text"
                                      onChange={handleChange}
                                      value={experience.Description__c}></textarea>
                                      {experienceError.Description__c?<p className="text-red-500">Write Some description</p>:null}
							</div>

                            </div>
                                </div>
                            </div>
                        </div>
        )
    }

    const additionalModalUi=()=>{
        return(
            <div class="grid gap-8 grid-cols-1">
            <div class="flex flex-col ">
                    <div class="flex flex-col sm:flex-row items-center">
                        <h2 class="font-semibold text-lg mr-auto">Add Bank Account</h2>
                    </div>
                    <div class="mt-2">
                        <div class="form">
                            <div class="md:space-y-2 mb-3">
                                <div class="mb-3 space-y-2 w-full text-xs">
                                    <label class=" font-semibold text-gray-600 py-2">Bank Name</label>
                                    <div class="flex flex-wrap items-stretch w-full mb-4 relative">
                                        <input className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4" 
                                          id="Bank_Name__c"
                                          type="text"
                                          placeholder="Name"
                                          onChange={handleChange}
                                          value={bankDetail.Bank_Name__c}
                                        />
                                        <p className="text-red-700">{bankError.Bank_Name__c?"Enter Bank name":""}</p>
                                    </div>
                                </div>

                                <div class="mb-3 space-y-2 w-full text-xs">
                                    <label class=" font-semibold text-gray-600 py-2">Account No</label>
                                    <div class="flex flex-wrap items-stretch w-full mb-4 relative">
                                        <input className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4" 
                                           id="Bank_Account_Number__c"
                                           type="number"
                                           placeholder="Account No"
                                           onChange={handleChange}
                                           value={bankDetail.Bank_Account_Number__c}
                                        />
                                        <p className="text-red-700">{bankError.Bank_Account_Number__c?"Enter Account Number":""}</p>
                                    </div>
                                </div>
                            </div>


                            <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 py-2">IFSC Code</label>
                                        <input
                                            className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                                            id="Bank_IFSC_Code__c"
                                            type="text"
                                            placeholder="IFSC Code"
                                            onChange={handleChange}
                                            value={bankDetail.Bank_IFSC_Code__c}
                                        />
                                        <p className="text-red-700">{bankError.Bank_IFSC_Code__c?"Invalid Ifsc code":""}</p>
                                </div>
                                <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 py-2">Account Holder Name</label>
                                        <input
                                            className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                                            id="Bank_Holder_Name__c"
                                            type="text"
                                            placeholder="Account Holder Name"
                                            onChange={handleChange}
                                            value={bankDetail.Bank_Holder_Name__c}
                                        />
                                        <p className="text-red-700">{bankError.Bank_Holder_Name__c?"Enter Holder Number":""}</p>
                                </div>
                            </div>
                            
                            <div class="flex-auto w-full mb-1 text-xs space-y-2">
                                <label class="font-semibold text-gray-600 py-2">Bank Address</label>
                                    <textarea className="w-full min-h-[100px] max-h-[300px] h-28 appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg  py-4 px-4" placeholder="Bank Address" 
                                      id="Bank_Address__c"
                                      type="text"
                                      onChange={handleChange}
                                      value={bankDetail.Bank_Address__c}></textarea>
                                      <p className="text-red-700">{bankError.Bank_Address__c?"Enter Bank Address":""}</p>
							</div>

                            {
                            bankDetails.length>0?
                            <div className="flex-auto w-full mb-1 text-xs space-y-2">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="account number"
                            >
                                Primary Account
                            </label>
                            <input
                                className=""
                                id="Primary__c"
                                type="checkbox"
                                onChange={handleChange}
                                checked={bankDetail.Primary__c}
                            />
                        </div>:null
                        }

                            </div>
                                </div>
                            </div>
                        </div>
        )
    }

    const ExperienceCard = () => {
        return (
            <div className="mt-5">
                {experiences &&
                    experiences.map((experience, index) => {
                        return (
                            <div
                                className="no-underline border-b bg-white border-l-8 border-blue-500 rounded-lg shadow-sm overflow-hidden  mt-2 p-5 text-gray-700"
                                key={index}
                                
                            >
                                <div className="md:flex md:justify-between">
                                    <div>
                                        <b>{experience.Name}</b>
                                        <p className="text-sm">
                                            <b>Start Date: </b>
                                            {moment(
                                                experience.Start_Date__c
                                            ).calendar()}
                                        </p>
                                        <p className="text-sm">
                                            <b>End Date: </b>
                                            {moment(
                                                experience.End_Date__c
                                            ).calendar()}
                                        </p>
                                        <p className="text-sm">
                                            <b>Added: </b>
                                            {moment(
                                                experience.CreatedDate
                                            ).calendar()}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <FaTrash
                                            className="inline cursor-pointer text-gray-600 hover:text-black"
                                            size={20}
                                            onClick={() =>{
                                                setAction("ORG");
                                                setShowDeleteAlert(true)
                                                setSelectedEvent(experience.Id)
                                                }
                                            }
                                        />
                                        <FaPencilAlt
                                            className="inline cursor-pointer ml-4 text-gray-600 hover:text-black"
                                            size={20}
                                            onClick={() =>
                                                editExpHandler(experience)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>
        );
    };

    const SkillCard = () => {
        return (
            <>
                {skills &&
                    skills.map((skill, index) => {
                        console.log("Skillss",skill)
                        return (
                            <div
                                className="no-underline border-b bg-white border-l-8 border-blue-500 rounded-lg shadow-sm overflow-hidden  mt-2 p-5 text-gray-700"
                                key={index}

                            >
                                <div className="md:flex md:justify-between">
                                    <div>
                                        <b>{skill.Name}</b>
                                        
                                        <p className="text-sm">
                                            <b>Added: </b>
                                            {moment(
                                                skill.CreatedDate
                                            ).calendar()}
                                        </p>
                                        
                                        {skill.Description__c}
                                    </div>
                                    <div div className="flex items-center">
                                        <FaTrash
                                            className="inline cursor-pointer text-gray-600 hover:text-black"
                                            size={20}
                                            onClick={() =>{
                                                setAction("SKILLS");
                                                setShowDeleteAlert(true)
                                                setSelectedEvent(skill.Id)
                                            }}
                                        />
                                        <FaPencilAlt
                                            className="inline cursor-pointer ml-4 text-gray-600 hover:text-black"
                                            size={20}
                                            onClick={() =>
                                                editSkillHandler(skill)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </>
        );
    };


    const bankDetailCard = () => {
        
        return (
            <div className="mt-5">
                {bankDetails &&
                    bankDetails.map((detail, index) => {
                        console.log("Detail ",detail)
                        return (
                            <div
                                className="no-underline border-b bg-white border-l-8 border-blue-500 rounded-lg shadow-sm overflow-hidden  mt-2 p-5 text-gray-700"
                                key={index}
                            >
                                <div className="md:flex md:justify-between">
                                    
                                    <div>
                                    
                                        <b>{detail.Bank_Name__c}</b>
                                        <p className="text-sm">
                                            <b>Account no: </b>
                                            {detail.Bank_Account_Number__c}
                                        </p>
                                        <p className="text-sm">
                                            <b>IFSC Code: </b>
                                            {detail.Bank_IFSC_Code__c}
                                        </p>
                                    </div>
                                    

                                    <div className="flex items-center">
                                        {console.log("IsPrimary ",detail.Primary__c)}

                                        {detail.Primary__c?<h1 className="mr-5 text-xs">Primary</h1>:null}
                                  
                                        <FaTrash
                                            className="inline cursor-pointer text-gray-600 hover:text-black"
                                            size={20}
                                            onClick={() =>
                                                {
                                                    setAction("ACCOUNT");
                                                    setShowDeleteAlert(true)
                                                    setSelectedEvent(detail.Id)
                                                }
                                            }
                                        />
                                        <FaPencilAlt
                                            className="inline cursor-pointer ml-4 text-gray-600 hover:text-black"
                                            size={20}
                                            onClick={() =>
                                                editBankDetailHandler(detail)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>
        );
    };
    
    const setScreen = () => {
        if(selectedTab===1){
            return (
                <div className="col-span-2 md:px-8 pb-3">
                    <div className="flex rounded-lg">
                        <div className="w-full rounded-lg border bg-white p-5 shadow-sm">
                            <PersonalInformation
                                profile={profile}
                                auth={auth}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        else if(selectedTab===2){
            return (
                <div className="col-span-2 md:px-8 pb-3">
                    <div className="flex">
                        <div
                            className="w-full bg-white rounded-lg border shadow-sm p-3"
                            onClick={() => setShowModal(true)}
                        >
                            <div className="cursor-pointer border-dotted border-4  rounded-xl py-8 max-w-sm mx-auto justy-items-center my-8">
                                <FaAward
                                    size={72}
                                    className="mx-auto fill-current text-black"
                                />
                                <h2 className="text-base text-center mt-2">
                                    Add Skill
                                </h2>
                            </div>
                            <div
                                className="cursor-pointer rounded-xl py-2 max-w-sm mx-auto justy-items-center my-8 text-lg bg-purple-500 text-white hover:bg-purple-600"
                                onClick={() => setShowModal(true)}
                            >
                                <h2 className="text-base text-center mt-2">
                                    {" "}
                                    Add Skill{" "}
                                </h2>
                            </div>
                        </div>
                    </div>
                    {SkillCard()}
                </div>
            );
        }
        else if(selectedTab===3){
            return (
                <div className="col-span-2 md:px-8 pb-3">
                    <div className="flex">
                        <div
                            className="w-full rounded-lg border bg-white shadow-sm p-3"
                            onClick={() => setShowModal(true)}
                        >
                            <div className="cursor-pointer border-dotted border-4  rounded-xl py-8 max-w-sm mx-auto justy-items-center my-8">
                                <FaBriefcase
                                    size={72}
                                    className="mx-auto fill-current text-black"
                                />
                                <h2 className="text-base text-center mt-2">
                                    Add Experiences
                                </h2>
                            </div>
                            <div
                                className="cursor-pointer rounded-xl py-2 max-w-sm mx-auto justy-items-center my-8 text-lg bg-purple-500 hover:bg-purple-600 text-white"
                                onClick={() => setShowModal(true)}
                            >
                                <h2 className="text-base text-center mt-2">
                                    {" "}
                                    Add Experience{" "}
                                </h2>
                            </div>
                        </div>
                    </div>
                    {ExperienceCard()}
                </div>
            );
        }
        else if(selectedTab===4){
            return (
                <div className="col-span-2 md:px-8 pb-3">
                    <div className="flex">
                        <div
                            className="w-full rounded-lg border bg-white shadow-sm p-3"
                            onClick={() => setShowModal(true)}
                        >
                            <div className="cursor-pointer border-dotted border-4  rounded-xl py-8 max-w-sm mx-auto justy-items-center my-8">
                                <RiBankLine
                                    size={72}
                                    className="mx-auto fill-current text-black"
                                />
                                <h2 className="text-base text-center mt-2">
                                    Bank Details
                                </h2>
                            </div>
                            <div
                                className="cursor-pointer rounded-xl py-2 max-w-sm mx-auto justy-items-center my-8 text-lg bg-purple-500 hover:bg-purple-600 text-white"
                                onClick={() => setShowModal(true)}
                            >
                                <h2 className="text-base text-center mt-2">
                                    {" "}
                                    Add Bank Details{" "}
                                </h2>
                            </div>
                        </div>
                    </div>
                    {bankDetailCard()}
                </div>
            );   
        }
    }    
    
    return(
        <Base history={history} pathList={[{to:"/",name:"Home"},{to:"#",name:"EditProfile"}]}>
            <div className="container mx-auto md:py-6 md:px-4 px-2 max-full">
                <div className="md:grid md:grid-cols-3 flex flex-col">
                    
                    <div 
                        className="col-span-1 rounded-lg border py-5 md:px-5 md:mr-5 px-2 bg-white shadow-sm my-2"
                        style={{ height: "fit-content" }}
                    >
                        <div 
                            className={
                                selectedTab===1
                                ? "bg-gray-700 py-2 px-3 rounded-lg text-white text-center"
                                : "text-center cursor-pointer bg-gray-300 py-2 px-3 rounded-lg text-black"
                            } 
                            onClick={()=>setSelectedtab(1)}>
                            Profile
                        </div>
                        
                        <div 
                            className={
                                selectedTab===2
                                ? "bg-gray-700 py-2 px-3 rounded-lg mt-3 text-white text-center"
                                : "text-center cursor-pointer bg-gray-300 py-2 px-3 mt-3 rounded-lg text-black"
                            } 
                            onClick={()=>setSelectedtab(2)}>
                            Skills
                        </div>
                        {profile.userType==="instructor" && 
                            <>
                                  <div className={
                                        selectedTab===3
                                        ? "bg-gray-700 py-2 px-3 rounded-lg mt-3 text-white text-center"
                                        : "text-center cursor-pointer bg-gray-300 py-2 px-3 mt-3 rounded-lg text-black"
                                        } 
                                        onClick={()=>setSelectedtab(3)}>
                            Organization
                        </div>
                        <div className={
                                selectedTab===4
                                    ? "bg-gray-700 py-2 px-3 rounded-lg mt-3 text-white text-center"
                                    : "text-center cursor-pointer bg-gray-300 py-2 px-3 mt-3 rounded-lg text-black"
                                } onClick={()=>setSelectedtab(4)}>
                            Additional Details
                        </div>
                            </>
                        }
                      
                    </div>

                    {setScreen()}
                    {/* {showDeleteAlert &&   <DeleteAlert showModal={showDeleteAlert} handleEvent={handleModalEvent} action={action}/>} */}
                    {
                        showModal && 
                        <CommonDetailModal
                        handleEvent={handleEvent}
                        showModal = {showModal}>
                            {modalUi()}
                        </CommonDetailModal>
                    }
                </div>
                {showDeleteAlert && <DeleteAlert showModal={showDeleteAlert} handleEvent={deleteModalEvent} action={action} />}
            </div>       
        </Base>
    )
}

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile
    };
};

export default connect(mapStateToProps)(ProfileComponent);