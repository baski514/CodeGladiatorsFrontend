import React,{Component} from 'react'
import Base from "../Base";
import {resetPassword} from '../../store/actions/authActions'
import { connect } from "react-redux";
import {firebase} from '../../config/fbConfig'
import validator from 'validator';

import Alert from "../ui_utilities/Alert";
class ResetPassword extends Component{
  
    constructor(props) {
        super(props);
        this.state = {
            email:"",
            fieldError:false
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleAlerts = this.handleAlerts.bind(this);
    }
    handleChange(e){
        this.setState({
            ...this.state,
            [e.target.name]: e.target.value
        });
    };

    handleSubmit(e){
        e.preventDefault();
               
        if(validator.isEmpty(this.state.email) || !validator.isEmail(this.state.email)){
            this.setState({...this.state,fieldError:true})
        }else{
            this.props.resetPassword(this.state.email);
        }
    }
     handleAlerts = (alertType) => (event) => {
        if (alertType === "CLOSE"){
            console.log("close alert");
            this.setState({...this.state,fieldError:false})
        }
    }
    

    render(){
        const { auth, authError, history } = this.props;
        console.log("AuthError ",JSON.stringify(authError))
        return (
            <Base history={history}>
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
                        onSubmit={this.handleSubmit}
                    >
                        <center>
                            <h3 className="text-gray-700 p-2">Reset Password</h3>
                        </center>
                        <hr />
                        {authError ?(
                            <Alert
                                alert={{
                                    header: authError.header,
                                    message: authError.msg,
                                    className: authError.color,
                                }}
                                clickHandler={this.handleAlerts}
                                
                            />
                        ) : (
                            <></>
                        )}
                       
                        <div className="mb-4">
                                    {console.log(this.state)}
                                    <label
                                        className="block text-gray-700 text-sm font-bold mb-2"
                                        htmlFor="username"
                                    >
                                        Username
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="email"
                                        name="email"
                                        type="text"
                                        placeholder="Email"
                                        onChange={this.handleChange}
                                    />
                                     {this.state.fieldError?<p className="text-red-500">Invalid Email</p>:null}
                                </div>
                        
                        <div className="flex items-center justify-center">
                            <button
                                className="bg-gray-900 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit"
                            >
                             Reset   
                            </button>
                            {/* <Link
                                className="inline-block align-baseline font-bold text-sm text-purple-500 hover:text-purple-800"
                                to="#"
                            >
                                Forgot Password?
                            </Link> */}
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
};


const mapStateToProps = (state) => {
    return {
      auth: state.firebase.auth,
      authError: state.auth.authError
    }
  }
  
  const mapDispatchToProps = (dispatch)=> {
    return {
      resetPassword: (email) => dispatch(resetPassword(email))
    }
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword)
