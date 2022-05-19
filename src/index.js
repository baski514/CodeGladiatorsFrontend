import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import Routes from './Routes';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from "./store/reducers/rootReducer";
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createFirestoreInstance, getFirestore } from "redux-firestore";
import { ReactReduxFirebaseProvider, getFirebase } from "react-redux-firebase";
import { firebase } from './config/fbConfig';
import { useSelector } from "react-redux";
import { isLoaded } from "react-redux-firebase";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { BannerLoader } from "./ui_components/ui_utilities/Loaders";

const middlewares = [thunk.withExtraArgument({ getFirebase, getFirestore })];

const store = createStore(
  rootReducer,
  compose(applyMiddleware(...middlewares))
);

const rrfProps = {
  firebase,
  config: {
    userProfile: "users",
    useFirestoreForProfile: true,
    attachAuthIsReady: true,
  },
  dispatch: store.dispatch,
  createFirestoreInstance,
};

const AuthIsLoaded = ({ children }) => {
    const auth = useSelector((state) => state.firebase.auth);
    const profile = useSelector((state) => state.firebase.profile);
    console.log(profile);
    console.log(isLoaded(profile));
    if (!isLoaded(auth) || !isLoaded(profile)) return (
        <div className="flex items-center justify-center h-screen bg-gray-200">
            <div className="text-3xl">
                {/* <h5>loading...</h5> */}
                <BannerLoader type="BallTriangle"/>
            </div>
        </div>
    );
    return children;
}

ReactDOM.render(
  <Provider store={store}>
    <ReactReduxFirebaseProvider {...rrfProps}>
        <AuthIsLoaded>
            <Routes />
        </AuthIsLoaded>
    </ReactReduxFirebaseProvider>
  </Provider>,
  document.getElementById("root")
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();