import React from 'react'

export default function SessionModal({ title, children, handleEvent, showModal }) {
    return (
        <>
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
                                <div className="flex items-center justify-end p-4 border-t border-solid border-blueGray-200 rounded-b">
                                    <button
                                        className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => handleEvent("CLOSE")}
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="bg-emerald-500 bg-purple-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-3 py-3 ml-4 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => handleEvent("SAVE")}
                                    >
                                        Save Changes
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
