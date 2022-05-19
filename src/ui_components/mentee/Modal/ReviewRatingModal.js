import React from 'react'

export default function ReviewRatingModal({ title, children, handleEvent, showModal }) {
    return (
        <>
            {showModal ? (
                <>
                          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none rounded-xl ">
                        <div className="relative md:w-auto my-6 mx-auto md:max-w-6xl p-12">
                        <div class="md::max-w-xl md::mx-auto">
                     <div class="bg-white min-w-1xl flex flex-col rounded-xl shadow-lg">
                            <div class="md:px-12 md:py-4 py-4">
                                <h2 class="text-gray-800 md:text-3xl text-base font-semibold text-center"> {title} </h2>
                            </div>
                                {children}
                        <div class="md:h-20 h-16 flex items-center justify-center" onClick={()=>handleEvent("CLOSE")}>
                            <a href="#" class="text-gray-600">Maybe later</a>
                        </div>
                    </div>
                </div>
                </div>
                </div>
                </>
            ) : null}
        </>
    );
}
