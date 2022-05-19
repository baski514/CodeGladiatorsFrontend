import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { bUpdateUserType } from "../../store/actions/authActions";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Alert from "../ui_utilities/Alert";
import { LoaderLarge } from "../ui_utilities/Loaders";
import Base from "../Base";


class UserType extends Component{
    

    constructor(props){
        super(props)
        this.state = {
            type:"student",
            showLoader:false
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(e){
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleSubmit = (e) => {
        e.preventDefault();
        console.log(this.state.type)
        this.setState({...this.state,showLoader: true})
        const { auth, profile} = this.props;
        console.log("Profile ",profile)
        let userProfile = {
            email:auth.email,
            firstName:profile.firstName,
            lastName: profile.lastName,
            firebaseId: auth.uid,
            userType: this.state.type
        }
        userProfile.firstName = userProfile.firstName[0].toUpperCase()+userProfile.firstName.substring(1);
        userProfile.lastName = userProfile.lastName[0].toUpperCase()+userProfile.lastName.substring(1);
        this.props.updateProfile(userProfile);
    };

    render(){
        if(this.props.profile.userType) {
            return <Redirect to='/'/>;
        }
        return(
            <>
            {this.state.showLoader ? (
                <div className="flex items-center justify-center h-3/6">
                    <LoaderLarge type="ThreeDots" />
                </div>
            ) : (
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
                            <h3 className="text-gray-700 p-2">Choose Your profile</h3>
                        </center>
                        <hr />
                       
                        <div className="mb-4">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="type"
                            >
                                Are you a?
                            </label>
                            <select
                                name="type"
                                onChange={this.handleChange}
                                value={this.state.type}
                                className="cursor-pointer shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="student">Student</option>
                                <option value="instructor">Instructor</option>
                            </select>
                        </div>
                        
                      
                        <div className="flex items-center justify-center">
                            <button
                                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit"
                            >
                             Save   
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-gray-500 text-xs">
                        &copy;2021 Acme Corp. All rights reserved.
                    </p>
                </div>
            </div>
            )}
            </>
          
        )
    }
};

const mapStateToProps = (state) => {
    // console.log(state);
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile
    };
};


const mapDispatchToProps = (dispatch) => {
    return {
        updateProfile: (localProfile) =>
            dispatch(bUpdateUserType(localProfile)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserType);