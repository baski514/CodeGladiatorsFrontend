import React, { useState, useEffect, useRef } from "react";
import { LoaderLarge } from "../ui_utilities/Loaders";
import { connect } from "react-redux";
import Base from "../Base";
import { randomColor } from "randomcolor";
import { firestoreConnect } from "react-redux-firebase";
import { compose } from "redux";
import { firebase } from "../../config/fbConfig";
import { messageRecepient, readMessage } from "../../store/actions/appActions";
import _ from "lodash";

//https://firebase.google.com/docs/firestore/query-data/order-limit-data

const Message = ({
    history,
    profile,
    unreadCount,
    auth,
    sendMessage,
    markMsgAsRead,
    readRecUser,
    unreadMessage,
}) => {
    const [showLoader, setShowLoader] = useState(false);
    const [recipients, setrecipients] = useState([]);
    const [activeRecepient, setActiveRecepient] = useState({});
    const [currentMessages, setCurrentMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const recepientProfileMap = useRef(new Map());
    const recepientUnreadMsgMap = useRef(new Map());
    const messageMap = useRef(new Map());
    const messagesEndRef = useRef(null);
    //const oldUnreadCount = useRef(unreadCount);

    useEffect(() => {
        if (profile && profile.recipients) {
            setShowLoader(true);
            firebase
                .firestore()
                .collection("users")
                .where(
                    firebase.firestore.FieldPath.documentId(),
                    "in",
                    profile.recipients
                )
                .get()
                .then((users) => {
                    const recipients = [];

                    users.docs.forEach((user) => {
                        const userP = user.data();
                        userP.id = user.id;
                        recipients.push(userP);
                        userP.bgColor = getUserBGColor();
                        recepientProfileMap.current.set(user.id, userP);
                    });
                    setrecipients(recipients);
                    loadMessages().then((messages) => {
                        if (messages && messages.length > 0) {
                            messages.forEach((messageWrp) => {
                                const message = messageWrp.data();
                                let recepientID;
                                if (message.from_fid === auth.uid) {
                                    recepientID = message.to_fid;
                                } else {
                                    recepientID = message.from_fid;
                                }

                                if (messageMap.current.has(recepientID)) {
                                    let messages =
                                        messageMap.current.get(recepientID);
                                    messages.push(message);
                                    messageMap.current.set(
                                        recepientID,
                                        messages
                                    );
                                } else {
                                    messageMap.current.set(recepientID, [
                                        message,
                                    ]);
                                }

                                //Set unread Count
                                if (
                                    message.from_fid !== auth.uid &&
                                    recepientProfileMap.current.has(
                                        recepientID
                                    ) &&
                                    message.read === false
                                ) {
                                    if (
                                        recepientUnreadMsgMap.current.has(
                                            recepientID
                                        )
                                    ) {
                                        const unreadMsgIds =
                                            recepientUnreadMsgMap.current.get(
                                                recepientID
                                            );
                                        recepientUnreadMsgMap.current.set(
                                            recepientID,
                                            [...unreadMsgIds, messageWrp.id]
                                        );
                                    } else {
                                        recepientUnreadMsgMap.current.set(
                                            recepientID,
                                            [messageWrp.id]
                                        );
                                    }
                                }
                            });
                            console.log(messageMap.current);
                            if (recepientProfileMap.current.size > 0) {
                                const firstRecUser = recepientProfileMap.current
                                    .entries()
                                    .next().value[1];
                                debugger;
                                setActiveRecepient(firstRecUser);
                                const msgToDisplay = messageMap.current.has(
                                    firstRecUser.id
                                )
                                    ? messageMap.current.get(firstRecUser.id)
                                    : [];
                                setCurrentMessages(msgToDisplay);
                                
                                if (recepientUnreadMsgMap.current.get(firstRecUser.id)) {
                                    markMsgAsRead(
                                        firstRecUser.id,
                                        recepientUnreadMsgMap.current.get(firstRecUser.id)
                                    );
                                }
                                console.log("yaay");
                            }
                        } else if (recepientProfileMap.current.size > 0) {
                            //set first user as active messager
                            setActiveRecepient(
                                recepientProfileMap.current.get(
                                    recepientProfileMap.current.keys().next()
                                        .value
                                )
                            );
                            console.log("here");
                        }
                        setShowLoader(false);
                    });
                })
                .catch((err) => {
                    console.log(err);
                    setShowLoader(false);
                })
                .finally(() => {
                    //setShowLoader(false);
                });
        }
    }, []);


    useEffect(() => {
        console.log("unread count changed");
        console.log(unreadMessage);
        debugger;
        if (unreadMessage && messageMap.current.has(unreadMessage.from_fid)) {
            let messages = messageMap.current.get(unreadMessage.from_fid);
            messages.push(unreadMessage);
            messageMap.current.set(unreadMessage.from_fid, messages);
            if (
                activeRecepient &&
                activeRecepient.id === unreadMessage.from_fid
            ) {
                setCurrentMessages([...messages]);
            }else if (recepientUnreadMsgMap.current.has(unreadMessage.from_fid)) {
                const unreadMsgIds = recepientUnreadMsgMap.current.get(
                    unreadMessage.from_fid
                );
                unreadMsgIds.push(unreadMessage.id);
                recepientUnreadMsgMap.current.set(unreadMessage.from_fid, [...unreadMsgIds]);
            }else {
                recepientUnreadMsgMap.current.set(unreadMessage.from_fid, [unreadMessage.id]);
            }
        }
    }, [unreadCount]);

    useEffect(() => {
        debugger;
        if (readRecUser && recepientUnreadMsgMap.current.has(readRecUser))
            recepientUnreadMsgMap.current.set(readRecUser, []);
    }, [readRecUser]);

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    };

    const loadMessages = async () => {
        const messagesRef = firebase.firestore().collection("messages");
        if (messagesRef) {
            try {
                const fromMessagesP = messagesRef
                    .where("from_fid", "==", auth.uid)
                    .orderBy("sent_on")
                    .get();
                const toMessagesP = messagesRef
                    .where("to_fid", "==", auth.uid)
                    .orderBy("sent_on")
                    .get();

                const [rawFromMessages, rawToMessages] = await Promise.all([
                    fromMessagesP,
                    toMessagesP,
                ]);

                const fromMessages = rawFromMessages.docs;
                const toMessages = rawToMessages.docs;
                const msgsToSort = fromMessages.concat(toMessages);
                if (!msgsToSort || msgsToSort.length === 0) {
                    return [];
                }

                msgsToSort.sort((m1, m2) => {
                    return m1.data().sent_on - m2.data().sent_on;
                });
                return _.uniqWith(msgsToSort, _.isEqual);
            } catch (err) {
                console.log(err);
                return [];
            }
        }
    };

    const changeRecepient = (recId) => {
        if (recepientProfileMap.current.has(recId)) {
            debugger;
            setActiveRecepient(recepientProfileMap.current.get(recId));
            if (messageMap.current.has(recId)) {
                setCurrentMessages(messageMap.current.get(recId));
            }
            if (
                recepientUnreadMsgMap.current.has(recId) &&
                recepientUnreadMsgMap.current.get(recId).length > 0
            ) {
                debugger;
                markMsgAsRead(recId, recepientUnreadMsgMap.current.get(recId));
            }
            scrollToBottom();
        }
    };

    const myMessageDP = (nextMsg) => {
        let userPic;
        if (nextMsg !== undefined && auth.uid !== nextMsg.from_fid) {
            userPic = profile.picURL
                ? profile.picURL
                : "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png";
        }
        return userPic ? (
            <img
                src={userPic}
                alt="My profile"
                className="w-6 h-6 rounded-full order-1"
            />
        ) : (
            <></>
        );
    };

    const recepMessageDP = (currentMsg, nextMsg) => {
        let userPic;
        if (
            nextMsg !== undefined &&
            nextMsg.from_fid === auth.uid &&
            recepientProfileMap.current.has(currentMsg.from_fid)
        ) {
            userPic = recepientProfileMap.current.get(currentMsg.from_fid)
                .picURL
                ? recepientProfileMap.current.get(currentMsg.from_fid).picURL
                : "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png";
        }
        return userPic ? (
            <img
                src={userPic}
                alt="My profile"
                className="w-6 h-6 rounded-full order-1"
            />
        ) : (
            <></>
        );
    };

    const handleKeypress = (e) => {
        if (e.key === "Enter") {
            sendMessageHelper();
        }
    };

    const sendMessageHelper = () => {
        console.log("send message");
        debugger;
        if (
            messageText &&
            messageText.length > 2 &&
            activeRecepient &&
            activeRecepient.id
        ) {
            const messageFbObj = {
                from_fid: auth.uid,
                to_fid: activeRecepient.id,
                message: messageText,
                read: false,
                sent_on: firebase.firestore.FieldValue.serverTimestamp(),
                author: profile.firstName + " " + profile.lastName,
            };
            console.log(messageFbObj);
            if (messageMap.current.has(activeRecepient.id)) {
                const recMessages = messageMap.current.get(activeRecepient.id);
                recMessages.push(messageFbObj);
                messageMap.current.set(activeRecepient.id, recMessages);
                setCurrentMessages([...currentMessages, messageFbObj]);
               
            }else {
                messageMap.current.set(activeRecepient.id, [messageFbObj]);
            }
            setMessageText("");
            scrollToBottom();
            sendMessage(messageFbObj);
        }
    };

    const handleMessage = (e) => {
        setMessageText(e.target.value);
    };

    const getUserBGColor = () => {
        return randomColor({
            luminosity: "dark",
            hue: "random",
        });
    }

    return (
        <Base
            history={history}
            pathList={[
                { to: "/", name: "Home" },
                { to: "#", name: "Messages" },
            ]}
        >
            <div className="bg-white">
                <div className="p-8">
                    <h1 className="font-semibold">Messages</h1>
                    <p>You have {unreadCount} unread messages</p>
                    <p>
                        Messages that you converse here will be cleared
                        automatically once read by the recepient.
                    </p>
                </div>
                <div className="grid grid-cols-5 mt-4">
                    <div className="col-span-1 border h-full">
                        {recipients &&
                            recipients.map((recepient, index) => {
                                return (
                                    <div key={index}>
                                        <div
                                            className={
                                                recepient.id ===
                                                activeRecepient.id
                                                    ? "flex items-center p-2 w-full cursor-pointer bg-gray-300"
                                                    : "flex items-center p-2 w-full cursor-pointer bg-gray-100"
                                            }
                                            onClick={() => {
                                                changeRecepient(recepient.id);
                                            }}
                                        >
                                            <div className="flex justify-between w-full">
                                                <div
                                                    className="flex items-center w-full"
                                                    key={index}
                                                >
                                                    {recepient.picURL ? (
                                                        <div className="flex-shrink-0 w-12 h-12">
                                                            <img
                                                                className="w-full h-full rounded-full"
                                                                src={
                                                                    recepient.picURL
                                                                }
                                                                alt="Profile"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="col-span-1 flex justify-center">
                                                            <div
                                                                className="rounded-full text-white flex items-center justify-center w-12 h-12 font-semibold"
                                                                style={{
                                                                    backgroundColor:
                                                                        recepient.bgColor,
                                                                }}
                                                            >
                                                                {
                                                                    recepient.initials
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-row justify-between w-full">
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {`${recepient.firstName} ${recepient.lastName}`}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {recepient.email
                                                                    ? recepient.email
                                                                    : `email@gmail.com`}
                                                            </div>
                                                        </div>
                                                        {recepientUnreadMsgMap.current.has(
                                                            recepient.id
                                                        ) &&
                                                            recepientUnreadMsgMap.current.get(
                                                                recepient.id
                                                            ).length > 0 && (
                                                                <div className="flex items-center">
                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold leading-4 bg-green-500 text-white">
                                                                        {
                                                                            recepientUnreadMsgMap.current.get(
                                                                                recepient.id
                                                                            )
                                                                                .length
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <hr />
                                    </div>
                                );
                            })}
                    </div>
                    {/* recipients */}
                    <div className="col-span-4 border h-full p-4">
                        <div className="flex-1 p:2 sm:p-6 justify-between flex flex-col h-screen">
                            {showLoader ? (
                                <div className="flex items-center justify-center h-3/6">
                                    <LoaderLarge type="ThreeDots" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={
                                                    activeRecepient.picURL
                                                        ? activeRecepient.picURL
                                                        : "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"
                                                }
                                                alt=""
                                                className="w-10 sm:w-16 h-10 sm:h-16 rounded-full"
                                            />
                                            <div className="flex flex-col leading-tight">
                                                <div className="text-2xl mt-1 flex items-center">
                                                    <span className="text-gray-700 mr-3">
                                                        {activeRecepient
                                                            ? activeRecepient.firstName +
                                                              " " +
                                                              activeRecepient.lastName
                                                            : ``}
                                                    </span>
                                                    <span className="text-green-500">
                                                        <svg
                                                            width="10"
                                                            height="10"
                                                        >
                                                            <circle
                                                                cx="5"
                                                                cy="5"
                                                                r="5"
                                                                fill="currentColor"
                                                            ></circle>
                                                        </svg>
                                                    </span>
                                                </div>
                                                <span className="text-lg text-gray-600">
                                                    {activeRecepient.shortDescription
                                                        ? activeRecepient.shortDescription
                                                        : ""}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        id="messages"
                                        className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
                                    >
                                        {currentMessages &&
                                            currentMessages.map(
                                                (message, index) => {
                                                    return message.from_fid !==
                                                        auth.uid ? (
                                                        <div
                                                            className="chat-message"
                                                            key={index}
                                                        >
                                                            <div className="flex items-end">
                                                                <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
                                                                    <div>
                                                                        <span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-300 text-gray-600">
                                                                            {
                                                                                message.message
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {recepMessageDP(
                                                                    message,
                                                                    currentMessages[
                                                                        index +
                                                                            1
                                                                    ]
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="chat-message"
                                                            key={index}
                                                        >
                                                            <div className="flex items-end justify-end">
                                                                <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end">
                                                                    <div>
                                                                        <span className="px-4 py-2 rounded-lg inline-block rounded-br-none bg-purple-500 text-white ">
                                                                            {
                                                                                message.message
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {myMessageDP(
                                                                    currentMessages[
                                                                        index +
                                                                            1
                                                                    ]
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        <div
                                            ref={messagesEndRef}
                                            style={{
                                                float: "left",
                                                clear: "both",
                                            }}
                                        />
                                    </div>
                                    <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
                                        <div className="relative flex">
                                            <span className="absolute inset-y-0 flex items-center">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center rounded-full h-12 w-12 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        className="h-6 w-6 text-gray-600"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                                        ></path>
                                                    </svg>
                                                </button>
                                            </span>
                                            <input
                                                type="text"
                                                placeholder="Write Something"
                                                className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-full py-3"
                                                onChange={handleMessage}
                                                onKeyPress={handleKeypress}
                                                value={messageText}
                                            />
                                            <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center justify-center rounded-full h-12 w-12 transition duration-500 ease-in-out text-white bg-purple-500 hover:bg-purple-400 focus:outline-none disabled:bg-gray-500"
                                                    onClick={() => {
                                                        sendMessageHelper();
                                                    }}
                                                    disabled={messageText.length <= 0}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        className="h-6 w-6 transform rotate-90"
                                                    >
                                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
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
        profile: state.firebase.profile,
        unreadCount: state.firestore.ordered.messages ? state.firestore.ordered.messages.length : 0,
        unreadMessage: state.firestore.ordered.messages ? state.firestore.ordered.messages[0] : undefined,
        readRecUser: state.app.readRecUser
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        sendMessage: (messageObj) => dispatch(messageRecepient(messageObj)),
        markMsgAsRead: (userId, unreadMsgIds) => dispatch(readMessage(userId, unreadMsgIds)),
    };
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    firestoreConnect((props) => {
        return [
            {
                collection: "messages",
                where: [
                    ["to_fid", "==", props.auth.uid],
                    ["read", "==", false],
                ],
                orderBy: ["sent_on", "desc"],
                limit: 100,
            },
        ];
    })
)(Message);