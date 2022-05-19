import React from 'react'

export default function DeleteAlert({handleEvent, showModal,action}) {
    console.log("Delete Modal Called")

    let requestFrom;
    if(action==="DISCUSSIONDELETE"){
        requestFrom = "comment"
    }else if(action==="ASSIGNMENTDELETE"){
        requestFrom = "Assignment"
    }else if(action==="SESSION"){
        requestFrom = "Session"
    }else if(action==="SKILLS"){
        requestFrom = "Skill"
    }else if(action==="ORG"){
        requestFrom = "Expereince"
    }else if(action==="ACCOUNT"){
        requestFrom = "Bank Details" 
    }else if(action==="TEST"){
        requestFrom = "Test" 
    }
    else{
        requestFrom = "Notes"
    }
    return (
        <>
            {showModal ? (
            <div className="md:min-w-screen h-screen animated fadeIn faster  fixed  left-0 top-0 flex justify-center items-center inset-0 z-50 outline-none focus:outline-none bg-no-repeat bg-center bg-cover"  id="modal-id">
                 <div className="absolute bg-black opacity-90 inset-0 z-0"></div>
                <div className="md:w-full  md:max-w-lg md:p-5 relative md:mx-auto md:my-auto rounded-xl shadow-lg  bg-white m-12">
                    <div className="">
                        
                        <div className="text-center p-5 flex-auto justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 -m-1 flex items-center text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 flex items-center text-red-500 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                                <h2 className="md:text-xl text-base font-bold py-4 ">Are you sure?</h2>
                                <p className="text-sm text-gray-500 md:px-8 text-center">Do you really want to delete your {requestFrom}</p>    
                        </div>
                        <div className="p-3  mt-2 text-center space-x-4 md:block">
                            <button className="mb-2 md:mb-0 bg-white px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-gray-600 rounded-full hover:shadow-lg hover:bg-gray-100"   onClick={() => handleEvent("CLOSE",action)}>
                                Cancel
                            </button>
                            <button className="mb-2 md:mb-0 bg-red-500 border border-red-500 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-red-600" onClick={() => handleEvent("DELETE",action)}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
            ) : null}
        </>
    );
}

