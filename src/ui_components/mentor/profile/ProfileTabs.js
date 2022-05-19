import React, { useEffect } from "react";
import { FaUserEdit, FaAward, FaBriefcase } from "react-icons/fa";
import {BiCommentDetail} from 'react-icons/all';
import { Link } from "react-router-dom";
import OrganizationDetails from "./OrganizationDetails";
import Skills from "./Skills";
import AdditionalDetails from './AdditionalDetails';
import PersonalInformation from "./PersonalInformation";
import { connect } from "react-redux";
import { httpsGET } from "../../../backend_api/mentorAPI";
import { API_GET_PROFILE } from "../../../backend";
import update from "immutability-helper";
import Base from "../../Base";
import {firebase} from "../../../config/fbConfig";

const EditProfileTabs = ({ profile, auth, history }) => {
    
    const [openTab, setOpenTab] = React.useState(1);
    const [skills, setSkills] = React.useState([]);
    const [experiences, setExperiences] = React.useState([]);
    const [bankDetails,setbankDetails] = React.useState([])

    const color = "rose";
    const bgColor = "red"
    const textColor = "white"

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

    
    const addSkillHandler = (skill, isEdit) => { 
        if(isEdit) {
            const index = skills.findIndex((skl) => skl.Id === skill.Id);
            const updatedSkills = update(skills, {
                $splice: [[index, 1, skill]],
            }); // array.splice(start, deleteCount, item1)
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

    const deleteSkillHandler = (skillId) => {
        // Delete at a specific index, no matter what value is in it
        const index = skills.findIndex((skill) => skill.Id === skillId);
        const updatedSkills = update(skills, {
            $splice: [[index, 1]],
        });
        setSkills(updatedSkills);
    };

    return (
        <Base history={history}>
            <div className="container mx-auto py-4 px-12">
                <div className="flex flex-wrap">
                    <div className="w-full">
                        <ul
                            className="flex justify-center mb-0 list-none flex-wrap pt-3 pb-4 md:flex-row sm:flex-col bg-red"
                            role="tablist"
                            ref={(node) => {
                                if (node) {
                                    node.style.setProperty(
                                        "list-style-type",
                                        "none",
                                        "important"
                                    );
                                }
                            }}
                        >
                            <li className="-mb-px mr-2 last:mr-0 text-center">
                                <Link
                                    className={
                                        "text-xs font-bold uppercase px-3 py-2 shadow-lg rounded block leading-normal " 
                                        +
                                        (openTab === 1
                                            ? "text-white "+ "bg-"+bgColor+"-500"  
                                            : " text-" + color + "-600 bg-white")
                                    }
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setOpenTab(1);
                                    }}
                                    data-toggle="tab"
                                    to="#link1"
                                    role="tablist"
                                >
                                    <FaUserEdit
                                        className={
                                            openTab === 1
                                                ? "text-white mr-2 text-lg inline"
                                                : "text-rose-600 mr-2 text-lg inline"
                                        }
                                    />
                                    Profile
                                </Link>
                            </li>
                            <li className="-mb-px mr-2 last:mr-0 text-center">
                                <Link
                                    className={
                                        "text-xs font-bold uppercase px-3 py-2 shadow-lg rounded block leading-normal " +
                                        (openTab === 2
                                            ? "text-white bg-"+bgColor+"-500"  
                                            : "text-" + color + "-600 bg-white")
                                    }
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setOpenTab(2);
                                    }}
                                    data-toggle="tab"
                                    to="#link2"
                                    role="tablist"
                                >
                                    <FaAward
                                        className={
                                            openTab === 2
                                                ? "text-white mr-2 text-lg inline"
                                                : "text-rose-600 mr-2 text-lg inline"
                                        }
                                    />{" "}
                                    Skills
                                </Link>
                            </li>
                            {profile.userType==="instructor"?
                                 <li className="-mb-px mr-2 last:mr-0 text-center">
                                 {/* flex-auto */}
                                 <Link
                                     className={
                                         "text-xs font-bold uppercase px-3 py-2 shadow-lg rounded block leading-normal " +
                                         (openTab === 3
                                             ? "text-white bg-"+bgColor+"-500"
                                             : "text-" + color + "-600 bg-white")
                                     }
                                     onClick={(e) => {
                                         e.preventDefault();
                                         setOpenTab(3);
                                     }}
                                     data-toggle="tab"
                                     to="#link3"
                                     role="tablist"
                                 >
                                     <FaBriefcase
                                         className={
                                             openTab === 3
                                                 ? "text-white mr-2 text-lg inline"
                                                 : "text-red-600 mr-2 text-lg inline"
                                         }
                                     />{" "}
                                     Organization
                                 </Link>
                             </li>:null
                            }
                           {profile.userType==="instructor"?
                           <li className="-mb-px mr-2 last:mr-0 text-center">
                                <Link
                                    className={
                                        "text-xs font-bold uppercase px-3 py-2 shadow-lg rounded block leading-normal " +
                                        (openTab === 4
                                            ? "text-white bg-"+bgColor+"-500"  
                                            : "text-" + color + "-600 bg-white")
                                    }
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setOpenTab(4);
                                    }}
                                    data-toggle="tab"
                                    to="#link2"
                                    role="tablist"
                                >
                                    <BiCommentDetail
                                        className={
                                            openTab === 4
                                                ? "text-white mr-2 text-lg inline"
                                                : "text-rose-600 mr-2 text-lg inline"
                                        }
                                    />{" "}
                                    Additional Details
                                </Link>
                            </li>:null}
                        </ul>
                        <div className="flex flex-col min-w-0 break-words w-full mb-6 p-3 my-8">
                            {/*shadow-lg rounded */}
                            <div className="px-4 py-5">
                                <div className="tab-content tab-space">
                                    <div
                                        className={
                                            openTab === 1
                                                ? "block max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-2 p-5"
                                                : "hidden"
                                        }
                                        id="link1"
                                    >
                                        <PersonalInformation
                                            profile={profile}
                                            auth={auth}
                                        />
                                    </div>
                                    <div
                                        className={
                                            openTab === 2
                                                ? "block max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-2 p-5"
                                                : "hidden"
                                        }
                                        id="link2"
                                    >
                                        <Skills
                                            skills={skills}
                                            addSkillHandler={addSkillHandler}
                                            sfid={profile.sfid}
                                            deleteSkillHandler={deleteSkillHandler}
                                        />
                                    </div>
                                    <div
                                        className={
                                            openTab === 3
                                                ? "block max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-2 p-5"
                                                : "hidden"
                                        }
                                        id="link3"
                                    >
                                        <OrganizationDetails
                                            experiences={experiences}
                                            addExpHandler={addExpHandler}
                                            sfid={profile.sfid}
                                            deleteExpHandler={deleteExpHandler}
                                        />
                                    </div>

                                    <div
                                        className={
                                            openTab === 4
                                                ? "block max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-2 p-5"
                                                : "hidden"
                                        }
                                        id="link3"
                                    >
                                       
                                        <AdditionalDetails
                                            bankDetails={bankDetails}
                                            addBankDetailsHandler={addBankDetailHandler}
                                            sfid={profile.sfid}
                                            deleteBankDetailsHandler={deleteBankDetailsHandler}
                                        >
                                            </AdditionalDetails>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Base>
    );
};

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile
    };
};

export default connect(mapStateToProps)(EditProfileTabs);