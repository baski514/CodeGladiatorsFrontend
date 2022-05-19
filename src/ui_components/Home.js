import React, { Component } from "react";
import Base from './Base';
import MentorDashboard from "./mentor/MentorDashboard";
import { connect } from "react-redux";
import UserType from './auth/UserType';
import {firebase} from '../config/fbConfig'
import { Redirect } from "react-router";

class Home extends Component {
    
    screen(){
        const { auth, profile, history } = this.props;

        console.log("Email verified ",auth.emailVerified)
        console.log("Auth Id ",auth)

        if(auth.uid && !auth.emailVerified){
            firebase.auth().signOut();
            <Redirect to="/signin"/>  
            return null
        }else if(!profile.userType && auth.email && auth.emailVerified){    
            console.log("Profile")
            console.log("UserType",profile.userType)
            console.log("Email ",auth.email)
            console.log("Auth email verified ",auth.emailVerified)

            return  (
            <Base history={history} activeTabName="Trending Course">
                <UserType/>  
            </Base>
            )
        }else{
            return (
                <Base history={history} activeTabName="Trending Course">
                    <MentorDashboard sfid={profile.sfid} history={history}/>
                </Base>
            )
        }
    }



    render() {
        const { history } = this.props;

        //changes by Bhaskar
        
        return(
            <>
            {this.screen()}
            </>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile
    };
};

export default connect(mapStateToProps)(Home);