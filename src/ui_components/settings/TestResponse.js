import React from 'react'
import { AiFillWarning } from 'react-icons/ai';
import success_sprikler from './success.json'
import fail from './fail.json'
import Lottie from 'react-lottie';

export default function SubmitExam({handleEvent, showModal,type}) {
    let message;
    
    if(type === true){
        message = "Congratulation, 🎉 You've cleared this round of our evaluation"
    }else{
        message = "Better luck next time 🙁"
    }
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData:type?success_sprikler:fail,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      };


    return (
        <>
            {showModal ? (
            <div className="md:min-w-screen h-screen animated fadeIn faster  fixed  left-0 top-0 flex justify-center items-center inset-0 z-50 outline-none focus:outline-none bg-no-repeat bg-center bg-cover"  id="modal-id">
                 <div className="absolute bg-black opacity-90 inset-0 z-0"></div>
                <div className="md:w-full  md:max-w-lg md:p-5 relative md:mx-auto md:my-auto rounded-xl shadow-lg  bg-white m-12 -ml-12">
                    <div className="">
                        
                        <div className="flex flex-col text-center p-5 items-center">
                            <Lottie
                                options={defaultOptions}
                                height={100}
                                width={100}
                                />
                                <h2 className="md:text-xl text-base font-bold py-4 ">{type===true?"Congrats!":"Oops!"}</h2>
                                <p className="text-sm text-gray-500 md:px-8 text-center">{message}</p>    
                        </div>
                        <div className="p-3  mt-2 text-center space-x-4 md:block">
                            <button className="mb-2 md:mb-0 bg-white px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-gray-600 rounded-full hover:shadow-lg hover:bg-gray-100"   onClick={() => handleEvent("CLOSE")}>
                                Ok
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            ) : null}
        </>
    );
}

