import React from 'react'

export default function CommonDetailModal({handleEvent, showModal, children}) {
    return (
        <>
            {showModal ? (
            <div className="min-w-screen h-screen animated fadeIn faster  fixed  left-0 top-0 flex justify-center items-center inset-0 z-50 outline-none focus:outline-none bg-no-repeat bg-center bg-cover"  id="modal-id">
                 <div className="absolute bg-black opacity-90 inset-0 z-0"></div>
                <div className="md:w-full md:max-w-lg p-5 relative md:mx-auto md:my-auto rounded-xl shadow-lg  bg-white m-12">
                    {children}
                    <div class="md:mt-5 mt-2 text-right space-x-3 flex flex-row justify-center md:block">
                        <button class="md:mb-0 bg-white px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-gray-600 rounded-full hover:shadow-lg hover:bg-gray-100" onClick={() => handleEvent("CLOSE")}> Cancel </button>
                        <button class=" md:mb-0 bg-purple-500 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-purple-700" onClick={() => handleEvent("SAVE")}>Save</button>
                    </div>
                </div>
            </div>
            ) : null}
        </>
    );
}

