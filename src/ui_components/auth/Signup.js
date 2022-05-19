import React, { Component,useEffect,useState} from "react";
import { Redirect } from "react-router-dom";
import { bSignup } from '../../store/actions/authActions';
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Base from "../Base";
import Alert from "../ui_utilities/Alert";
import PasswordStrengthBar from 'react-password-strength-bar';
import validator from "validator";

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";


const Signup = ({auth, authError, history, signUp}) => {

    const [state,setState] = useState({
        email: null,
        password: '',
        firstName: '',
        lastName: '',
        userType: 'student',
        confirmPassword: '',
        errorMsg:'',
        showPassword:false,
        hasError:false,
        authErrorAlert:true
    })

    useEffect(()=>{
        setState({...state,authErrorAlert:authError?true:false})
    },[authError])

    const [errors,setErrors] = useState({
        email:false,
        firstName: false,
        lastName: false,
        password: false,
        confirmPassword: false
    })

    if (auth.uid && auth.emailVerified) {
        return <Redirect to='/'/> 
    }else if(auth.uid && !auth.emailVerified){
        return <Redirect to='/signin'/> 
    }

  const handleChange = (e) => {
    setState({
        ...state,
      [e.target.id]: e.target.value
    })
    console.log(e.target.value);
  }

    const submitData = (e) => {
        e.preventDefault();
        console.log("DATATOPOST",state)
        var paswd=  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;
        var hasPasswordStrength = state.password.match(paswd)

        if(state.email===null||validator.isEmpty(state.firstName)||validator.isEmpty(state.lastName)||validator.isEmpty(state.password)||validator.isEmpty(state.confirmPassword)){
            // setState({...state,hasError:true,errorMsg:{header:'Fields',msg:'Can not be empty',color:'bg-yellow-400'}})
            if(state.email===null){
                setErrors({
                    email:true,
                    firstName: false,
                    lastName: false,
                    password: false,
                    confirmPassword: false  
                })
            }else if(validator.isEmpty(state.firstName)){
                setErrors({
                    email:false,
                    firstName: true,
                    lastName: false,
                    password: false,
                    confirmPassword: false  
                })
            }else if(validator.isEmpty(state.lastName)){
                setErrors({
                    email:false,
                    firstName: false,
                    lastName: true,
                    password: false,
                    confirmPassword: false  
                })
            }else if(validator.isEmpty(state.password)){
                setErrors({
                    email:false,
                    firstName: false,
                    lastName: false,
                    password: true,
                    confirmPassword: false  
                })
            }else if(validator.isEmpty(state.confirmPassword)){
                setErrors({
                    email:false,
                    firstName: false,
                    lastName: false,
                    password: false,
                    confirmPassword: true  
                })
            }
        }else{
            if(!validator.isEmail(state.email)){
                setState({...state,hasError:true,errorMsg:{header:'Email',msg:'is invalid!',color:'bg-yellow-400'}})
            }else if(state.password!==state.confirmPassword){
                setState({...state,hasError:true,errorMsg:{header:'Check once',msg:'Password mismatch',color:'bg-yellow-400'}})   
            }else if(state.password===state.confirmPassword && !hasPasswordStrength){
                setState({...state,hasError:true,errorMsg:{header:'Check once',msg:'Choose special characters like @,#,$,%,&,*,(,),!,~',color:'bg-yellow-400'}})
            }else{
                signUp(state);   
            }
        }
    }

    const handleAlerts = (alertType) => (event) => {
        
        if (alertType === "CLOSE"){
            setState({...state,hasError:false,authErrorAlert:false})
            console.log("close alert");
        }
    }

    const togglePasswordVisiblity = () => {
        setState({...state,showPassword:!state.showPassword})
    };

    return (
        <Base history={history} activeTabName="Signup">
            <div className="grid md:grid-cols-2 h-screen">
                <div className="hidden md:block bg-gradient-to-r from-pink-700 via-pink-600 to-pink-500">
                    <div className="flex items-center justify-center h-screen">
                        <h5 className="text-7xl text-white">Welcome</h5>
                        
                    </div>
                </div>
                <div className="p-4 flex flex-col items-center justify-center bg-gray-100">
                    <form
                        className="bg-white shadow-lg rounded px-8 pt-6 pb-8 mb-4"
                        style={{ minWidth: "70%" }}
                        onSubmit={submitData}
                    >
                        <center>
                            <h3 className="text-gray-700 p-2">Create new Account</h3>
                        </center>

                        <hr />
                        {state.hasError? (
                                <Alert
                                    alert={{
                                        header: state.errorMsg.header,
                                        message: state.errorMsg.msg,
                                        className: state.errorMsg.color,
                                    }}
                                    clickHandler={handleAlerts}
                                />
                            ) : (
                                <></>
                            )}
                            {authError && state.authErrorAlert? (
                                <Alert
                                    alert={{
                                        header: authError.header,
                                        message: authError.msg,
                                        className: authError.color,
                                    }}
                                    clickHandler={handleAlerts}
                                />
                            ) : (
                                <></>
                            )}
                        <div className="mb-4 mt-4">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="email"
                            >
                                Email
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="email"
                                type="text"
                                placeholder="email"
                                value={state.email}
                                onChange={handleChange}
                            />
                              <p className="text-red-700">{errors.email?"Enter Email":""}</p>
                        </div>
                        <div className="mb-4">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="firstName"
                            >
                                First Name
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="firstName"
                                type="text"
                                placeholder="First Name"
                                value={state.firstName}
                                onChange={handleChange}
                            />
                             <p className="text-red-700">{errors.firstName?"Enter First name":""}</p>
                        </div>
                        <div className="mb-4">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="lastName"
                            >
                                Last Name
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="lastName"
                                type="text"
                                placeholder="Last Name"
                                onChange={handleChange}
                                value={state.lastName}
                            />
                             <p className="text-red-700">{errors.lastName?"Enter Last name":""}</p>
                        </div>
                        <div className="mb-4">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="userType"
                            >
                                Are you a?
                            </label>
                            <select
                                id="userType"
                                onChange={handleChange}
                                value={state.userType}
                                className="cursor-pointer shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="student">Student</option>
                                <option value="instructor">Instructor</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="password"
                            >
                                Password
                            </label>
                            <div className="shadow appearance-none border rounded w-full text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline flex flex-row">
                                <input 
                                    className="py-2 px-3 rounded w-full border-0 active:border-0"
                                    id="password"
                                    type={state.showPassword?"text":"password"}
                                    disableUnderline="true"
                                    placeholder="******************"
                                    value={state.password}
                                    onChange={handleChange}
                                    />
                                 <div className="flex justify-center items-center mr-3">
                                            {state.showPassword?<AiFillEye size={22} className="self-center" onClick={togglePasswordVisiblity}/>:<AiFillEyeInvisible size={22} onClick={togglePasswordVisiblity}/>}
                                            </div>
                            </div>
                            <p className="text-red-700">{errors.password?"Choose Password":""}</p>
                        </div>
                        <div className="mb-6">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="confirmPassword"
                            >
                                Confirm Password
                            </label>
                            <div className="shadow appearance-none border rounded w-full text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline flex flex-row">
                                <input 
                                    className="py-2 px-3 rounded w-full border-0 active:border-0"
                                    id="confirmPassword"
                                    type={state.showPassword?"text":"password"}
                                    disableUnderline="true"
                                    placeholder="******************"
                                    value={state.confirmPassword}
                                    onChange={handleChange}
                                    />
                                <div className="flex justify-center items-center mr-3">
                                    {state.showPassword?<AiFillEye size={22} className="self-center" onClick={togglePasswordVisiblity}/>:<AiFillEyeInvisible size={22} onClick={togglePasswordVisiblity}/>}
                                </div>
                            </div>
                            <p className="text-red-700">{errors.confirmPassword?"Enter Confirm Password":""}</p>
                        </div>
                        <div className="mb-6">
                            <PasswordStrengthBar password={state.password} />
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                className="bg-gray-900 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit"
                            >
                                Sign Up
                            </button>
                            <Link
                                className="text-gray-700 p-2 inline-block align-baseline  hover:text-purple-800"
                                to="/signin"
                            >
                                Account already exist? signin
                            </Link>
                        </div>
                    </form>
                    <p className="text-center text-gray-500 text-xs">
                        &copy;2021 Acme Corp. All rights reserved.
                    </p>
                </div>
            </div>
        </Base>
    );


}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
    authError: state.auth.authError
  }
}

const mapDispatchToProps = (dispatch)=> {
  return {
    signUp: (creds) => dispatch(bSignup(creds))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup)