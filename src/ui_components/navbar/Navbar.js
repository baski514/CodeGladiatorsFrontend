import React from "react";
import SignedInNavbar from "./SignedInNavbar";
import SignedoutNavbar from "./SignedOutNavbar";
import { connect } from "react-redux";

const Navbar = (props) => {
    const { auth, profile, history, activeTabName, pathList } = props;
    return auth && auth.uid && auth.emailVerified? (
        <SignedInNavbar profile={profile} history={history} activeTabName={activeTabName} pathList={pathList}/>
    ) : (
        <SignedoutNavbar history={history} activeTabName={activeTabName}/>
    );
};

const mapStateToProps = (state) => {
    // console.log(state);
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile,
    };
};

export default connect(mapStateToProps)(Navbar);