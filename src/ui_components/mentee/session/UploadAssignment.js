import { React, useState, useEffect, useRef } from "react";
import ProfileEditModal from "../../mentor/profile/ProfileEditModal";
import { randomColor } from "randomcolor";
import { connect } from "react-redux";
import {
    httpsPOST,
    httpsDELETE,
} from "../../../backend_api/mentorAPI";

import { httpsPOST as menteePost, httpsGET as menteeGet} from "../../../backend_api/menteeAPI";

import {
    API_POST_CREATE_SESSION_ATTACHMENT,
    API_DELETE_SESSION_ATTACHMENT,
    API_POST_SESSION_REVIEW,
    API_GET_ONLY_MY_ASSIGNMENT,
} from "../../../backend";
import moment from "moment";
import update from "immutability-helper";
import { saveAs } from "file-saver";
import { FaYoutube, FaTrash} from "react-icons/fa";
import {HiCloudDownload} from "react-icons/hi";
import Base from "../../Base";
import { toast } from "react-toastify";
import { firebase, storage } from "../../../config/fbConfig";

const UploadAssignment = ({ profile, match, history, auth }) => {
    console.log("MATCH ", JSON.stringify(match));
    const [file, setFile] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [showRating, setShowRating] = useState(false);
    const [review, setReview] = useState("");
    const [star, setStar] = useState(0);
    const [commentNullError, setCommentNullError] = useState(false);
    const [ratingNullError, setRatingNullError] = useState(false);

    const [alert, setAlert] = useState({
        className: "bg-red-400",
        message: "please fill all necessary details.",
    });
    const [attachments, setAttachments] = useState([]);
    const [progress, setProgress] = useState(0);
    const [showUploadProgress, setShowUploadProgress] = useState(false);

    const [notes, setNotes] = useState({
        name: "",
        fileType: "VIDEO",
        youtubeId: "",
        typeValues: ["VIDEO", "FILE"],
    });

    useEffect(() => {
        loadUploadAssignments();
    }, []);

    const loadUploadAssignments = () => {
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                menteeGet(
                    { idToken, uid: auth.uid },
                    `${API_GET_ONLY_MY_ASSIGNMENT}${match.params.sessionId}/${profile.sfid}`
                ).then((data) => {
                    console.log("Assignments details ", data);
                    if (data && data.length > 0) {
                        console.log("Assignments details", data);
                        if (
                            data[0].Session_Attachments__r &&
                            data[0].Session_Attachments__r.records
                        ) {
                            setAttachments(
                                data[0].Session_Attachments__r.records
                            );
                        }
                    }
                });
            });
    };

    const randomString = () => {
        return "asdasdasd"; //TODO: Bhaskar
    };

    const createAttachment = (attachment) => {
        firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsPOST(
                    { idToken, uid: auth.uid },
                    `${API_POST_CREATE_SESSION_ATTACHMENT}${match.params.sessionId}`,
                    attachment
                ).then((data) => {
                    if (data && data.error) {
                        console.log(data);
                    } else {
                        attachment.Id = data.Id;
                        setAttachments([...attachments, attachment]);
                        setProgress(0);
                        setShowUploadProgress(false);
                        resetState();
                    }
                });
            });
    };

    const uploadAttachment = () => {
        if (file) {
            let fileExtension = file.name.split(".").pop();
            if (fileExtension) {
                setShowUploadProgress(true);
                const uploadTask = storage
                    .ref(`images/${randomString()}_notes_.${fileExtension}`)
                    .put(file);
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) *
                                100
                        );
                        setProgress(progress);
                    },
                    (error) => {
                        console.log(error);
                    },
                    () => {
                        storage
                            .ref("images")
                            .child(`${randomString()}_notes_.${fileExtension}`)
                            .getDownloadURL()
                            .then((url) => {
                                console.log(`File URL ${url}`);
                                createAttachment({
                                    FILE_URL__c: url,
                                    File_Type__c: notes.fileType,
                                    Name: notes.name,
                                    Attachment_Type__c: "ASSESSMENT",
                                    Uploaded_By__c: profile.sfid,
                                });
                            })
                            .catch((err) => {
                                console.log("ERROR" + err);
                            });
                    }
                );
            } else {
                console.lo("Invalid file: please select a valid file.");
            }
        } else {
            console.log("Invalid file: please select a valid file.");
        }
    };

    const downloadAttachment = (attachment) => {
        saveAs(attachment.FILE_URL__c);
    };

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    let fileInput = useRef(null);
    const triggerFileSelection = () => {
        fileInput.current.click();
    };

    const gotoPlayer = (videoId) => {
        history.push(`/session/play/${videoId}`);
    };

    const SessionAttachments = () => {
        return (
            <div className="mt-5">
                {attachments &&
                    attachments.map((attachment, index) => {
                        console.log(attachment);
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
                                        <b>Name: </b>
                                        <span>{attachment.Name}</span>
                                        <p className="text-sm">
                                            <b>Type: </b>
                                            <span>
                                                {attachment.Attachment_Type__c}
                                            </span>
                                        </p>
                                        <p className="text-sm">
                                            <b>Date Added: </b>
                                            <span>
                                                {moment(
                                                    attachment.CreatedDate
                                                ).calendar()}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        {attachment.Attachment_Type__c ===
                                            "VIDEO" && (
                                            <FaYoutube
                                                className="inline cursor-pointer ml-2 text-gray-600 hover:text-black"
                                                size={20}
                                                onClick={() =>
                                                    gotoPlayer(
                                                        attachment.Video_Id__c
                                                    )
                                                }
                                            />
                                        )}
                                        {attachment.Attachment_Type__c !==
                                            "VIDEO" && (
                                            <HiCloudDownload
                                                className="inline cursor-pointer ml-2 text-gray-600 hover:text-black"
                                                size={20}
                                                onClick={() =>
                                                    downloadAttachment(
                                                        attachment
                                                    )
                                                }
                                            />
                                        )}
                                        <FaTrash
                                            className="inline cursor-pointer ml-2 text-gray-600 hover:text-black"
                                            size={20}
                                            onClick={() =>
                                                deleteAttachment(attachment.Id)
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

    const handleFileMetaChange = (e) => {
        setNotes({ ...notes, [e.target.id]: e.target.value });
        console.log(notes);
    };

    const deleteAttachment = (attachmentId) => {
        console.log(attachmentId);
        if (window.confirm("Are you sure you want to delete")) {
            firebase
            .auth()
            .currentUser.getIdToken(false)
            .then(function (idToken) {
                httpsDELETE(
                    { idToken, uid: auth.uid},
                    API_DELETE_SESSION_ATTACHMENT + attachmentId
                ).then((data) => {
                    if (data && data.error) {
                        console.log("ERROR from SERVER");
                    } else if (data && data.success) {
                        const index = attachments.findIndex(
                            (attachment) => attachment.Id === attachmentId
                        );
                        const updatedAttachments = update(attachments, {
                            $splice: [[index, 1]],
                        });
                        setAttachments(updatedAttachments);
                    }
                });
            });
        }
    };

    const addNewAttachment = () => {
        return (
            <div>
                <div className="">
                    <main className="container mx-auto max-w-screen-lg h-full">
                        <div className="grid grid-cols-1">
                            <div className="col-span-1">
                                <div className="mb-4">
                                    <label
                                        className="block text-gray-700 text-sm font-bold mb-2"
                                        htmlFor="name"
                                    >
                                        Attachment Name
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="name"
                                        type="text"
                                        placeholder="Name"
                                        onChange={handleFileMetaChange}
                                        value={notes.name}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        className="block text-gray-700 text-sm font-bold mb-2"
                                        htmlFor="fileType"
                                    >
                                        Attachment Type
                                    </label>
                                    <select
                                        id="fileType"
                                        onChange={handleFileMetaChange}
                                        className="cursor-pointer shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="Category"
                                        value={notes.fileType}
                                    >
                                        {notes.typeValues &&
                                            notes.typeValues.map(
                                                (type, index) => (
                                                    <option
                                                        key={index}
                                                        value={type}
                                                    >
                                                        {type}
                                                    </option>
                                                )
                                            )}
                                    </select>
                                </div>
                                {notes.fileType === "VIDEO" && (
                                    <div className="mb-4">
                                        <label
                                            className="block text-gray-700 text-sm font-bold mb-2"
                                            htmlFor="youtubeId"
                                        >
                                            Youtube Video Id
                                        </label>
                                        <input
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="youtubeId"
                                            type="text"
                                            placeholder="Youtube video Id"
                                            onChange={handleFileMetaChange}
                                            value={notes.youtubeId}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        {notes.fileType !== "VIDEO" && (
                            <article
                                aria-label="File Upload Modal"
                                className="relative h-full flex flex-col"
                            >
                                <section className="h-full overflow-auto p-8 w-full flex flex-col">
                                    {!showUploadProgress && (
                                        <header className="border-dashed border-2 border-gray-400 py-12 flex flex-col justify-center items-center">
                                            <p className="mb-3 font-semibold text-gray-900 flex flex-wrap justify-center">
                                                <span>Drag and drop your</span>
                                                &nbsp;
                                                <span>files anywhere or</span>
                                            </p>
                                            <input
                                                id="hidden-input"
                                                type="file"
                                                multiple
                                                onChange={handleChange}
                                                className="hidden"
                                                ref={fileInput}
                                            />

                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="h-10 w-10 inline text-purple-500 capture z-100 cursor-pointer"
                                                onClick={() => {
                                                    triggerFileSelection();
                                                }}
                                            >
                                                <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                                                <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                                            </svg>
                                        </header>
                                    )}

                                    {showUploadProgress && (
                                        <div className="mt-5">
                                            <h5>Uploading please wait..</h5>
                                            <div
                                                className="bg-gray-300 rounded h-6"
                                                role="progressbar"
                                                aria-valuenow="1"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            >
                                                <div
                                                    className="bg-blue-800 rounded h-6 text-center text-white text-sm transition"
                                                    style={{
                                                        width: `${progress}%`,
                                                        transition: "width 2s",
                                                    }}
                                                >
                                                    {progress}%
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            </article>
                        )}
                    </main>
                </div>
            </div>
        );
    };

    const resetState = () => {
        setIsEdit(false);
        setShowModal(false);
        setNotes({ ...notes, name: "", fileType: "VIDEO", youtubeId: "" });
    };

    const handleEvent = (type) => {
        console.log("Type choosed ", type);
        if (type === "CLOSE") {
            resetState();
        } else if (type === "SHOW_MODAL") {
            setShowModal(true);
        } else if (type === "SHOW_RATING_MODAL") {
            setShowRating(true);
        } else if (type === "SAVE") {
            if (notes.fileType === "FILE") uploadAttachment();
            else if (notes.fileType === "VIDEO") {
                createAttachment({
                    File_Type__c: notes.fileType,
                    Name: notes.name,
                    Video_Id__c: notes.youtubeId,
                    Attachment_Type__c: "ASSESSMENT",
                    Uploaded_By__c: profile.sfid,
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

    const handleRatingEvent = (type) => {
        if (type === "CLOSE") {
            setShowRating(false);
        } else if (type === "SAVE" && review.length < 1) {
            setCommentNullError(true);
        } else if (type === "SAVE" && star < 0.5) {
            setRatingNullError(true);
        } else {
            const commentBody = {
                Description__c: review,
                Mentor_Course_Schedule__c: match.params.sessionId,
                Student_Course_Enrollment__c: match.params.enrolId,
                Student_Rating__c: star,
            };
            firebase
                .auth()
                .currentUser.getIdToken(false)
                .then(function (idToken) {
                    menteePost(
                        { idToken, uid: auth.uid },
                        `${API_POST_SESSION_REVIEW}`,
                        commentBody
                    ).then((response) => {
                        if (response && response.error) {
                            toast.error("Couldn't add Comment");
                            console.log(response.techMsg);
                        } else if (response) {
                            debugger;
                            console.log(response);
                            toast.success("Comment created");
                        }
                        setShowRating(false);
                    });
                });
        }
    };

    /* const ratingReviewsContent = ()=>{
        return (
            <div>
                <div className="p-2 mt-1">

                    <textarea
                        type="text"
                        id="rating"
                        rows='8'
                        onChange={e => setReview(e.target.value)}
                        placeholder="Tell others What you think about this course. Would you recommended it, and why?"
                        className="shadow appearance-none border bg-gray-100 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                    />
                    {commentNullError?<p className="text-red-500">Write review</p>:null}
                </div>
                <div className="p-2 mt-1">
                    <div className="flex gap-1 items-center" >
                    <Rating name="half-rating" 
                    value={star}
                    defaultValue={star}
                    precision={0.5} 
                    onChange={(event, newValue) => {
                        setStar(newValue);
                      }}/>
                       
                    </div>
                    {ratingNullError?<p className="text-red-500">give star</p>:null}
                </div>
            </div>
        );
    } */

    return (
        <Base history={history}>
            <div className="container mx-auto py-4 px-12">
                <center className="mb-4">
                    <h1>Assignments</h1>
                </center>
                <div className="block max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-2 p-5">
                    <div className="md:flex md:justify-between border-b border-gray-300 p-3">
                        <h3>Assignment submitted</h3>
                        {/* <FaStar/> */}
                        <ProfileEditModal
                            title={
                                isEdit ? "Edit Attachment" : "Add Attachment"
                            }
                            handleEvent={handleEvent}
                            showModal={showModal}
                            saveBtnName="Upload"
                            disableSave={
                                (notes.fileType === "VIDEO" &&
                                    (notes.youtubeId.length !== 11 ||
                                        notes.name.length < 5)) ||
                                (notes.fileType === "FILE" &&
                                    notes.name.length < 5) ||
                                notes.fileType === ""
                            }
                        >
                            {addNewAttachment()}
                        </ProfileEditModal>
                    </div>
                    {SessionAttachments()}
                </div>
            </div>
        </Base>
    );
};

const mapStateToProps = (state) => {
    // console.log(state);
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile,
    };
};

export default connect(mapStateToProps)(UploadAssignment);

