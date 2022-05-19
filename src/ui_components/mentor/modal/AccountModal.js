import React from "react";
import { FiPlus,FiStar} from "react-icons/fi";
export default function AccountModal({
    title,
    children,
    handleEvent,
    showModal,
    saveBtnName,
    disableSave,
}) {
    //const [showModal, setShowModal] = React.useState(false);
    return (
        <>  
            <div>
               
                <FiPlus
                    size={23}
                    className="inline cursor-pointer hover:bg-gray-200 rounded-full"
                    onClick={() => handleEvent("SHOW_MODAL")}
                />
            </div>
            {" "}
            {showModal ? (
                <>
                    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                        <div className="relative w-auto my-6 mx-auto max-w-6xl">
                            {/*content*/}
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                {/*header*/}
                                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                                    <h3 className="text-2xl font-semibold">
                                        {title}
                                    </h3>
                                    <button
                                        className="bg-transparent border-0 text-black opacity-6 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                        onClick={() => handleEvent("CLOSE")}
                                    >
                                        <span className="bg-transparent opacity-1 text-black h-6 w-6 text-2xl block outline-none focus:outline-none">
                                            ×
                                        </span>
                                    </button>
                                </div>
                                {/*body*/}
                                <div className="relative p-6 flex-auto">
                                    {children}
                                </div>
                                {/*footer*/}
                                <div className="flex items-center justify-between p-6 border-t border-solid border-blueGray-200 rounded-b">
                                    <button
                                        className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => handleEvent("CLOSE")}
                                    >
                                        Close
                                    </button>
                                    <button
                                        className={`bg-emerald-500 active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 ${
                                            disableSave
                                                ? "bg-gray-500 text-white cursor-not-allowed"
                                                : "bg-purple-500 text-white shadow hover:shadow-lg cursor-pointer"
                                        }`}
                                        type="button"
                                        onClick={() => handleEvent("SAVE")}
                                        disabled={
                                            disableSave !== undefined
                                                ? disableSave
                                                : false
                                        }
                                    >
                                        {saveBtnName
                                            ? saveBtnName
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            ) : null}
        </>
    );
}
