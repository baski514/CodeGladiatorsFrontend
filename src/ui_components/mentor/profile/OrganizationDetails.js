import { React, useState } from "react";
import { randomColor } from "randomcolor";
import ProfileEditModal from "./ProfileEditModal";
import Alert from "../../ui_utilities/Alert";
import moment from "moment";
import { httpsPOST, httpsDELETE } from "../../../backend_api/mentorAPI";
import { API_POST_EXPERIENCE, API_POST_EDIT_EXPERIENCE, API_DELETE_EXPERIENCE } from "../../../backend";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import Datetime from "react-datetime";

const OrganizationDetails = ({experiences, sfid, addExpHandler, deleteExpHandler}) => {

    console.log("Exp ",experiences)
    const [showAlert, setShowAlert] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);   
     
    const [alert, setAlert] = useState({
        className: "bg-red-400",
        message: "please fill all necessary details.",
    });

    const [experience, setExperience] = useState({Name:"",Start_Date__c:"",End_Date__c:"",Description__c:"",Occupation__c:""});

    const handleChange = (e) => {
        setExperience({ ...experience,[e.target.id]: e.target.value });
    };

    const handleAlerts = (alertType) => (event) => {
        if (alertType === "CLOSE")
            setShowAlert(false);
    };

    const editExpHandler = (experience) => {
        delete experience["attributes"];
        setExperience(experience);
        setIsEdit(true);
        setShowModal(true);
    }
    
    const deleteExperience = (expId) => {
        console.log(expId);
        if(window.confirm('Are you sure you want to delete')) {
            httpsDELETE(null, API_DELETE_EXPERIENCE + expId).then((data) => {
                if (data && data.error) {
                    console.log("ERROR from SERVER");
                } else if (data && data.success) {
                    deleteExpHandler(expId);
                }
            });
            
        }
    }

    const resetState = () => {
        setExperience({ Name: "", Start_Date__c: "", End_Date__c: "" ,Description__c:"",Experience_in_Months__c:""});
        setIsEdit(false);
        setShowModal(false);
    }

    const handleEvent = (type) => {
        if (type === "CLOSE") {
           resetState();
        }else if (type === "SHOW_MODAL") {
            setShowModal(true);
        } else if (type === "SAVE") {
            //console.log(experience);
            //add validations
            experience.Experience_in_Months__c= parseInt(experience.Experience_in_Months__c)
            console.log("Exp in month ",typeof experience.Experience_in_Months__c,experience.Experience_in_Months__c)

            if (experience.Name !== "") {
                httpsPOST(null, isEdit ? API_POST_EDIT_EXPERIENCE + sfid : API_POST_EXPERIENCE + sfid, experience).then(
                    (data) => {
                        //console.log(data);
                        if (data && data.error) {
                            setAlert({ ...alert, message: data.error });
                            setShowAlert(true);
                        } else if (data && data.id) {
                            const newExperience = experience;
                            newExperience.Id = data.id;
                            addExpHandler(newExperience, isEdit);
                            resetState();
                        }
                    }
                );
            }else {
                setAlert({ ...alert, message: "Please fill all necessary details" });
                setShowAlert(true);
            }
        }
    };

    const ExperienceCard = () => {
        return (
            <div className="mt-5">
                {experiences &&
                    experiences.map((experience, index) => {
                        return (
                            <div
                                className="no-underline border-b hover:border-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-2 p-5 text-gray-900"
                                key={index}
                                style={{
                                    backgroundColor: randomColor({
                                        luminosity: "light",
                                        hue: "random",
                                    }),
                                }}
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
                                            onClick={() =>
                                                deleteExperience(experience.Id)
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

    const addNewExperienceContent=()=>{
        return(
            <div class="grid gap-8 grid-cols-1">
            <div class="flex flex-col ">
                    <div class="flex flex-col sm:flex-row items-center">
                        <h2 class="font-semibold text-lg mr-auto">Create Session</h2>
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
                                        {/* {this.state.errorModalEvent.errorSTittle?<p className="text-red-500">Enter title</p>:null} */}
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
                                        {/* {this.state.errorModalEvent.errorSTittle?<p className="text-red-500">Enter title</p>:null} */}
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
                                        {/* {this.state.errorModalEvent.errorStart?<p className="text-red-500">End Date</p>:null} */}
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
                                        {/* {this.state.errorModalEvent.errorEnd?<p className="text-red-500">Choose End Date</p>:null} */}
                                </div>
                            </div>
                            
                            <div class="flex-auto w-full mb-1 text-xs space-y-2">
                                <label class="font-semibold text-gray-600 py-2">Description</label>
                                    <textarea className="w-full min-h-[100px] max-h-[300px] h-28 appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg  py-4 px-4" placeholder="Some description about your role" 
                                      id="Description__c"
                                      type="text"
                                      onChange={handleChange}
                                      value={experience.Description__c}></textarea>
							</div>

                            </div>
                                </div>
                            </div>
                        </div>
        )
    }

    const addNewExperience = () => {
        return (
            <form className="">
                {showAlert && (
                    <Alert alert={alert} clickHandler={handleAlerts} />
                )}
                <div className="grid grid-cols-2 gap-16">
                    <div className="col-span-1">
                        <div className="mb-10">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="username"
                            >
                                Company Name
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="Name"
                                type="text"
                                placeholder="Name"
                                onChange={handleChange}
                                value={experience.Name}
                            />
                        </div>
                        <div className="mb-6">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="password"
                            >
                                Total Experience
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="Experience_in_Months__c"
                                type="number"
                                placeholder="In months"
                                onChange={handleChange}
                                value={experience.Experience_in_Months__c}
                            />
                        </div>
                        <div className="mb-6">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="password"
                            >
                                Description
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="Description__c"
                                type="text"
                                placeholder="Description"
                                onChange={handleChange}
                                value={experience.Description__c}
                            />
                        </div>
                    </div>
                    <div className="col-span-1">
                        <div className="mb-6">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="password"
                            >
                                Start Date
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="Start_Date__c"
                                type="date"
                                placeholder="In months"
                                onChange={handleChange}
                                value={experience.Start_Date__c}
                            />
                        </div>
                        <div className="mb-6">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="password"
                            >
                                End Date
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="End_Date__c"
                                type="date"
                                placeholder="In months"
                                onChange={handleChange}
                                value={experience.End_Date__c}
                            />
                        </div>
                    </div>
                </div>
            </form>
        );
    };
    return (
        <div className="flex flex-col">
            <div className="md:flex md:justify-between border-b border-gray-300 p-3">
                <h3>Experience</h3>
                <ProfileEditModal title={isEdit ? "Edit Experience" : "Add Experience"} handleEvent={handleEvent} showModal={showModal}>
                    {addNewExperience()}
                </ProfileEditModal>
            </div>
            {ExperienceCard()}
        </div>
    );
};

export default OrganizationDetails;