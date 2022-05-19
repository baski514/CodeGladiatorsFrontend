import React, { Component,useEffect,useState} from "react";
import { Redirect } from "react-router-dom";
import { signIn,bGoogleSignup,facebookAuth } from "../../store/actions/authActions";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Alert from "../ui_utilities/Alert";
import { LoaderLarge } from "../ui_utilities/Loaders";
import Base from "../Base";
import validator from "validator";
import {AiOutlineGoogle,AiFillFacebook, AiFillEyeInvisible, AiFillEye} from 'react-icons/all'


const Signin = ({authError, auth, history, location, googleSignup, signIn, facebookAuth}) =>  {
    
    const [state, setState] = useState({
        email: "",
        password: "",
        showLoader: false,
        showPassword:false,
        showAlert:false,
        invalidMsg:'',
        authErrorAlert:true
    });




    useEffect(()=>{
        setState({...state,authErrorAlert:authError?true:false})
    },[authError])


    const [error,setError] = useState({
        emailError:false,
        passwordError:false
    })

    if (auth.uid && auth.emailVerified) {
        if(location.state && location.state.callbackUrl)
            return <Redirect to={location.state.callbackUrl}/>;
        else
            return <Redirect to="/" />;
    }

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.id]: e.target.value,
        });
        console.log(e.target.id," ",e.target.value)
    };


    const handleAlerts = (alertType) => (event) => {
        debugger;
        console.log("Alert Type",alertType)
        
        if (alertType === "CLOSE"){
            
            if(authError){
                setState({...state,showAlert:false,authErrorAlert:false})
            }else{
                if(state.showAlert){
                    setState({...state,showAlert:false,authErrorAlert:true})
                }else{
                    setState({...state,showAlert:false})
                }
            }
            
            console.log("ShowAlert ",state.showAlert)
        }
    };

    
    
    const submitData = (e) => {
        e.preventDefault();
        console.log("username ",state.email)
        console.log("password ",state.password)

        
        console.log("Email ",state.email,"Password ",state.password)

        if(state.email.length<1 && state.email.length<1){
            setError({emailError:true,passwordError:true})
        }else if(state.email.length<1){
            setError({emailError:true,passwordError:false})
        }else if(state.password.length<1){
            setError({emailError:false,passwordError:true})
        }
        else{
            if(!validator.isEmail(state.email)){
                setState({...state,showAlert:true,invalidMsg:{header:'Email',msg:'invalid!'}})
            }else{
                setState({...state,showLoader:true})
                signIn({email:state.email, password: state.password});
                setState({...state,showLoader:false})
            }
        }
    };

    const togglePasswordVisiblity = () => {
        setState({...state,showPassword:!state.showPassword})
    };


    return (
    <Base history={history} activeTabName="Signin">
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
                                Login to your Account
                            </h3>
                        </center>
                        <hr className="mb-4" />

                        {authError && state.authErrorAlert?(
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

                            {state.showAlert? (
                            <Alert
                                alert={{
                                    header: state.invalidMsg.header,
                                    message: state.invalidMsg.msg,
                                    className:"bg-red-400",
                                }}
                                clickHandler={handleAlerts}
                            />
                        ) : (
                            <></>
                        )}

                        {state.showLoader ? (
                            <div className="flex items-center justify-center">
                                <LoaderLarge type="ThreeDots" />
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                  
                                    <label
                                        className="block text-gray-700 text-sm font-bold mb-2"
                                        htmlFor="username"
                                    >
                                        Username
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        
                                        id="email"
                                        type="text"
                                        placeholder="Email"
                                        value={state.email}
                                         // custom message
                                        onChange={handleChange}
                                        // {...register("email", {required: true, pattern: /^\S+@\S+$/i})}
                                    />
                                    
                                    <p className="text-red-700">{error.emailError?"Email is required":""}</p>

                                   
                                </div>
                                <div className="mb-6">
                                    <label
                                        className="block text-gray-700 text-sm font-bold mb-2"
                                        htmlFor="password"
                                    >
                                        Password
                                    </label>
                                    <div className="shadow appearance-none border border-black rounded w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex flex-row">
                                        <input
                                            id="password"
                                            className=" py-2 px-3 rounded w-full border-0 active:border-0"
                                            type={state.showPassword?"text":"password"}
                                            disableUnderline="true"
                                            placeholder="******************"       
                                            onChange={handleChange} />
                                            <div className="flex justify-center items-center mr-2">
                                            {state.showPassword?<AiFillEye size={22} className="self-center" onClick={togglePasswordVisiblity}/>:<AiFillEyeInvisible size={22} onClick={togglePasswordVisiblity}/>}
                                            </div>
                                    </div>
                                  
                                        <p className="text-red-700">{error.passwordError?"Password is required":""}</p>
                                    
                                </div>
                                <div className="flex items-center justify-between">
                                    <button
                                        className="bg-gray-900 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="submit"
                                    >
                                        Sign In
                                    </button>
                                    <Link
                                    className="inline-block align-baseline font-bold text-sm text-gray-500 hover:text-purple-800"
                                    to="/forgotpassword"
                                >
                                    Forgot Password?
                                </Link>
                                </div>
                                <div className="my-5 ">
                                    <div className="bg-red-800 cursor-pointer shadow-2xl rounded-lg px-3 py-3 flex mb-2 hover:bg-red-900" onClick={()=>{
                                        googleSignup()
                                    }} >
                                        <AiOutlineGoogle className="fill text-white text-2xl"/>
                                        <h2 className="text-white mx-3 ">Login with Google</h2>
                                    </div>

                                    <div className="bg-blue-700 cursor-pointer shadow-2xl rounded-lg px-3 py-3 flex hover:bg-blue-900" onClick={()=>{facebookAuth()}}>
                                        <AiFillFacebook className="fill text-white text-2xl"/>
                                        <h2 className="text-white mx-3 ">Login with Facebook</h2>
                                    </div>     
                            </div>
                            </>
                        )}
                        <center>
                        <Link className=" text-gray-700 p-2 inline-block align-baseline  hover:text-purple-800" to="/signup">
                                    Create Account
                                </Link>
                        </center>
                    </form>
                    <p className="text-center text-gray-500 text-xs">
                        &copy;2021 Acme Corp. All rights reserved.
                    </p>
                </div>
            </div>
        </Base>
  );
};


const mapStateToProps = (state) => {
  return {
    authError: state.auth.authError,
    auth: state.firebase.auth,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    signIn: (creds) => dispatch(signIn(creds)),
    googleSignup:()=> dispatch(bGoogleSignup()),
    facebookAuth:()=>dispatch(facebookAuth())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Signin);
