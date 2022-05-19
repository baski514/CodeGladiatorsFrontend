import React, { Component,useState,useEffect} from 'react';
import { AiFillCheckCircle, AiFillCloseCircle, AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { BsCheckCircle, BsFillPersonCheckFill } from 'react-icons/bs';

import { toast } from 'react-toastify';
import {firebase} from '../../config/fbConfig'
import {LoaderLarge} from '../../ui_components/ui_utilities/Loaders'

const CustomActionUrl =(props)=>{
    const {history} = props;
    console.log("ACTION History",history);

    const mode = new URL(window.location.href).searchParams.get("mode")
    const code = new URL(window.location.href).searchParams.get("oobCode")

    const [state, setState] = useState({
        password: "",
        confirmPassword: "",
        showLoader: true,
        showPassword:false,
        showAlert:false,
        invalidMsg:'',
        codeValid:false,
        passwordError:false,
        confirmPasswordError:false,
        passwordDoesnotMatch:false
    });

    useEffect(() => {
        if(mode==="verifyEmail"){
            firebase.auth().applyActionCode(code)
            .then(function(email) {
                console.log('email verified',email);
                setState({...state,codeValid:true,showLoader:false})
            })
            .catch(function() {
                setState({...state,codeValid:false,showLoader:false})
            })
        }else{
            firebase.auth().verifyPasswordResetCode(code)
            .then(function(email) {
                
                console.log('email verified',email);
                setState({...state,codeValid:true,showLoader:false})
            })
            .catch(function() {
                setState({...state,codeValid:false,showLoader:false})
            })
        }
       
    },[])

    const submitData = (e) => {
        e.preventDefault();
        console.log("password ",state.password)
        console.log("cPassword ",state.confirmPassword)

        if(!state.password || state.password.length<8){
            setState({...state,passwordError:true,confirmPasswordError:false})
        }else if(!state.confirmPassword || state.confirmPassword.length<8){
            setState({...state,confirmPasswordError:true,passwordError:false})
        }else if(state.password!==state.confirmPassword){
            setState({...state,passwordDoesnotMatch:true,passwordError:false,confirmPasswordError: false})
        }else{
            firebase.auth().confirmPasswordReset(code, state.password)
            .then(function() {
                toast.success("new password created")
                history.push('/signin')
            // Success
            })
            .catch(function() {
                toast.error("Error to change password")
            // Invalid code
            })
        }
    };

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.id]: e.target.value
        });
        console.log("Password",state.password,"CPassword",state.confirmPassword)
    };

    const togglePasswordVisiblity = () => {
        setState({...state,showPassword:!state.showPassword})
    };



    const changePasswordUi=()=>{
        return(
            <div className="grid md:grid-cols-2 h-screen">
                <div className="hidden md:block bg-gradient-to-r from-pink-700 via-pink-600 to-pink-500">
                    <div className="flex items-center justify-center h-screen">
                        <h5 className="text-7xl text-white">Welcome</h5>
                    </div>
                </div>
                <div className="md:p-4 flex flex-col items-center justify-center bg-gray-100 p-2">
                    <form
                        className="bg-white shadow-lg rounded-lg md:px-8  px-3 md:pt-6 pb-8 md:mb-4 md:w-7/12 w-full"
                        onSubmit={submitData}
                    >
                        <center>
                            <h3 className="text-gray-700 p-2">
                                Create new passsword
                            </h3>
                        </center>
                        <hr className="mb-4" />

                        <>
                                <div className="mb-4">
                                  
                                    <label
                                        className="block text-gray-700 text-sm font-bold mb-2"
                                        htmlFor="username"
                                    >
                                        New Password
                                    </label>

                                    <div className="shadow appearance-none border border-black rounded w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex flex-row">
                                        <input
                                            className=" py-2 px-3 rounded w-full border-0 focus:border-transparent focus:border-0"
                                            id="password"
                                            type={state.showPassword?"text":"password"}
                                            disableUnderline="true"
                                            placeholder="******************"       
                                            value={state.password}
                                            onChange={handleChange}
                                        />
                                        <div className="flex justify-center items-center mr-2">
                                            {state.showPassword?<AiFillEye size={22} className="self-center" onClick={togglePasswordVisiblity}/>:<AiFillEyeInvisible size={22} onClick={togglePasswordVisiblity}/>}
                                        </div>
                                    </div>
                                  
                                    <p className="text-red-700">{state.passwordError && "Must have at most 8 characters"}</p>
                                </div>
                                <div className="mb-6">
                                    <label
                                        className="block text-gray-700 text-sm font-bold mb-2"
                                        htmlFor="password"
                                    >
                                        Confirm Password
                                    </label>
                                    <div className="shadow appearance-none border border-black rounded w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex flex-row">
                                        <input
                                            id="confirmPassword"
                                            className=" py-2 px-3 rounded w-full border-0 focus:border-transparent focus:border-0"
                                            type={state.showPassword?"text":"password"}
                                            disableUnderline="true"
                                            placeholder="******************"       
                                            value={state.confirmPassword}
                                            onChange={handleChange} 
                                            />
                                              <div className="flex justify-center items-center mr-2">
                                                {state.showPassword?<AiFillEye size={22} className="self-center" onClick={togglePasswordVisiblity}/>:<AiFillEyeInvisible size={22} onClick={togglePasswordVisiblity}/>}
                                            </div>
                                    </div>
                                  
                                    <p className="text-red-700">{state.confirmPasswordError && "Must have at most 8 characters"}</p>
                                    
                                </div>
                                <p className="text-red-700">{state.passwordDoesnotMatch && "Password mismatch"}</p>
                                <div className="flex items-center justify-between">
                                    <button
                                        className="bg-gray-900 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="submit"
                                    >
                                        Save
                                    </button>
                                </div>
                            </>
                    </form>
                    <p className="text-center text-gray-500 text-xs">
                        &copy;2021 Acme Corp. All rights reserved.
                    </p>
                </div>
            </div>
        )
    }

    const getScreen =()=>{
        if(state.codeValid){
            if(mode==="resetPassword"){
                return changePasswordUi()
            }else{
                return  <div className="container mx-auto px-4 md:px-8 no-underline overflow-hidden md:max-w-3xl mt-2 md:p-5 text-gray-900">
                            <div className="py-3 flex justify-center">
                                <div className="md:px-4 flex sm:flex-row md:flex-row rounded-xl bg-white px-3 py-2">
                                    <div className="flex flex-col mb-1 sm:mb-0">
                                        <AiFillCheckCircle size={100} className="text-green-500 items-center ml-5"/>
                                        <h1 className="text-2xl text-gray-800 font-bold mt-5">Email verified</h1>
                                        <button className="px-5 py-2 bg-gray-700 rounded-sm hover:bg-gray-900 text-white mt-5" onClick={()=>history.push('/signin')}>Back to signin</button>
                                    </div>
                                </div>
                            </div>
                        </div>
            }
        }else{
            return <div className="container mx-auto px-4 md:px-8 no-underline overflow-hidden md:max-w-3xl mt-2 md:p-5 text-gray-900">
            <div className="py-3 flex justify-center">
                <div className="md:px-4 flex sm:flex-row md:flex-row rounded-xl bg-white px-3 py-2">
                    <div className="flex flex-col mb-1 sm:mb-0">
                        <AiFillCloseCircle size={100} className="text-red-500 items-center ml-7"/>
                        <h1 className="text-2xl text-gray-800 font-bold mt-5">Link has Expired</h1>
                        <button className="px-5 py-2 bg-gray-700 rounded-sm hover:bg-gray-900 text-white mt-5" onClick={()=>history.push('/signin')}>Back to signin</button>
                    </div>
                </div>
            </div>
        </div>   
        }
    }
    
    return(

        <div>
            {state.showLoader?
                <div className="flex items-center justify-center">
                    <LoaderLarge type="ThreeDots" />
                </div>:
                <>
                    {getScreen()}
                </>
            }
            
        </div>
    )
}
export default CustomActionUrl