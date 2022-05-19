import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isLoaded, isEmpty } from "react-redux-firebase";
import { useSelector } from "react-redux";

const PrivateRoute = ({ component: Component, ...rest }) => {
    const auth = useSelector((state) => state.firebase.auth);
    return (
        <Route
        {...rest}
        render={(props) =>
            isLoaded(auth) && !isEmpty(auth) ? (
            <Component {...props} />
            ) : (
            <Redirect
                to={{
                pathname: "/signin",
                state: { from: props.location },
                }}
            />
            )
        }
        />
    );
};

export default PrivateRoute;
