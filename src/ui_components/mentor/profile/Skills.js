import { React, useState } from "react";
import { randomColor } from "randomcolor";
import ProfileEditModal from "./ProfileEditModal";
import Alert from "../../ui_utilities/Alert";
import { httpsPOST, httpsDELETE } from "../../../backend_api/mentorAPI";
import {
    API_POST_SKILL,
    API_POST_EDIT_SKILL,
    API_DELETE_SKILL,
} from "../../../backend";
import moment from "moment";
import { FaPencilAlt, FaTrash } from "react-icons/fa";

export default function Skills({ skills, sfid, addSkillHandler, deleteSkillHandler }) {
    //console.log(skills);
    const [alert, setAlert] = useState({
        className: "bg-red-400",
        message: "please fill all necessary details.",
    });
    const [showAlert, setShowAlert] = useState(false);
    const [skill, setSkill] = useState({
        Name: "",
        Description__c:""
    });
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const handleChange = (e) => {
        setSkill({ ...skill, [e.target.id]: e.target.value });
    };

    const handleAlerts = (alertType) => (event) => {        
        if (alertType === "CLOSE") setShowAlert(false);
    };

    const editSkillHandler = (skill) => {
        delete skill["attributes"];
        setSkill(skill);
        setIsEdit(true);
        setShowModal(true);
    };

    const resetState = () => {
        setSkill({ Name: "" });
        setIsEdit(false);
        setShowModal(false);
    };

    const handleEvent = (type) => {
        if (type === "CLOSE") {
            resetState();
        } else if (type === "SHOW_MODAL") {
            setShowModal(true);
        } else if (type === "SAVE") {
            //console.log(skill);
            //add validations
            if (skill.Name !== "") {
                httpsPOST(
                    null,
                    isEdit ? API_POST_EDIT_SKILL + sfid : API_POST_SKILL + sfid,
                    skill
                ).then((data) => {
                    if (data.error) {
                        setAlert({ ...alert, message: data.error });
                        setShowAlert(true);
                    } else if (data && data.id) {
                        //console.log(data);
                        const newSkill = skill;
                        newSkill.Id = data.id;
                        addSkillHandler(newSkill, isEdit);
                        resetState();
                    }
                });
            } else {
                setAlert({
                    ...alert,
                    message: "Please fill all necessary details",
                });
                setShowAlert(true);
            }
        }
    };

    const deleteSkill = (skillId) => {
        console.log(skillId);
        if (window.confirm("Are you sure you want to delete")) {
            httpsDELETE(null, API_DELETE_SKILL + skillId).then((data) => {
                if (data && data.error) {
                    console.log('ERROR from SERVER');
                } else if (data && data.success) {
                    deleteSkillHandler(skillId);
                }
            });
        }
        
    };

    const SkillCard = () => {
        return (
            <>
                {skills &&
                    skills.map((skill, index) => {
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
                                        <b>{skill.Name}</b>
                                        <p className="text-sm">
                                            <b>Added: </b>
                                            {moment(
                                                skill.CreatedDate
                                            ).calendar()}
                                        </p>
                                    </div>
                                    <div div className="flex items-center">
                                        <FaTrash
                                            className="inline cursor-pointer text-gray-600 hover:text-black"
                                            size={20}
                                            onClick={() =>
                                                deleteSkill(skill.Id)
                                            }
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

    const addNewSkill = () => {
        return (
            <form className="">
                {showAlert && (
                    <Alert alert={alert} clickHandler={handleAlerts} />
                )}
                <div className="mb-4">
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="username"
                    >
                        Skill Name
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="Name"
                        type="text"
                        placeholder="Name"
                        onChange={handleChange}
                        value={skill.Name}
                    />
                </div>

                <div className="mb-4">
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="username"
                    >
                        Description
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="Description__c"
                        type="text"
                        placeholder="Description"
                        onChange={handleChange}
                        value={skill.Description__c}
                    />
                </div>
            </form>
        );
    };

    return (
        <div className="flex flex-col">
            <div className="md:flex md:justify-between border-b border-gray-300 p-3">
                <h3>Skills</h3>
                <ProfileEditModal
                    title={isEdit ? "Edit Skill" : "Add Skill"}
                    handleEvent={handleEvent}
                    showModal={showModal}
                >
                    {addNewSkill()}
                </ProfileEditModal>
            </div>
            <div className="mt-5">{SkillCard()}</div>
        </div>
    );
}
