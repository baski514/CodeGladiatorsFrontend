import React from 'react'

export default function UpcommingSession({handleEvent, showModal,action}) {
    console.log("Delete Modal Called")

    return (
        <>
            {showModal ? (
            <div className="min-w-screen animated fadeIn faster  fixed  flex z-50 outline-none focus:outline-none bg-no-repeat justify-end absolute top-0 right-0 m-20"  id="modal-id">
                 <div className="absolute opacity-90 z-0"></div>
                <div className="w-full  max-w-lg p-5 relative mx-auto my-auto rounded-xl shadow-lg  bg-white">
                    <div className="">
                        
                        <div className="text-center p-5 flex-auto justify-center">
                        <img src="https://img.icons8.com/fluency/48/000000/alarm.png" className="mx-auto"/>
                                <h2 className="text-xl font-bold py-4 ">Upcoming session</h2>
                                <p className="text-sm text-gray-500 px-8">Next session</p>    
                        </div>
                        <div className="p-3  mt-2 text-center space-x-4 md:block">
                            <button className="mb-2 md:mb-0 bg-white px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-gray-600 rounded-full hover:shadow-lg hover:bg-gray-100"   onClick={() => handleEvent("CLOSE",action)}>
                                Close
                            </button>
                            <button className="mb-2 md:mb-0 bg-blue-600 border border-blue-500 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-blue-700" onClick={() => handleEvent("DELETE",action)}>Session</button>
                        </div>
                    </div>
                </div>
            </div>
            ) : null}
        </>
    );
}

