import React from 'react'
import { AiFillWarning } from 'react-icons/ai';

export default function SubmitExam({handleEvent, showModal,testType}) {
    
    return (
        <>
            {showModal ? (
            <div className="md:min-w-screen h-screen animated fadeIn faster  fixed  left-0 top-0 flex justify-center items-center inset-0 z-50 outline-none focus:outline-none bg-no-repeat bg-center bg-cover"  id="modal-id">
                 <div className="absolute bg-black opacity-90 inset-0 z-0"></div>
                <div className="md:w-full  md:max-w-lg md:p-5 relative md:mx-auto md:my-auto rounded-xl shadow-lg  bg-white m-12">
                    <div className="">
                        
                        <div className="flex flex-col text-center p-5 items-center">
                                <AiFillWarning size={80} className="text-red-500 text-center self-auto"/>
                                <h2 className="md:text-xl text-base font-bold py-4 ">Are you sure?</h2>
                                <p className="text-sm text-gray-500 md:px-8 text-center">Do you want to {testType} Test</p>    
                        </div>
                        <div className="p-3  mt-2 text-center space-x-4 md:block">
                            <button className="mb-2 md:mb-0 bg-white px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-gray-600 rounded-full hover:shadow-lg hover:bg-gray-100"   onClick={() => handleEvent("CLOSE")}>
                                Cancel
                            </button>
                            <button className="mb-2 md:mb-0 bg-red-500 border border-red-500 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-red-600" onClick={() => handleEvent("SUBMIT")}>{testType}</button>
                        </div>
                    </div>
                </div>
            </div>
            ) : null}
        </>
    );
}

