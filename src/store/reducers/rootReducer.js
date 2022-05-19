import authReducer from './authReducer'
import { combineReducers } from 'redux'
import { firestoreReducer } from "redux-firestore";
import { firebaseReducer } from "react-redux-firebase";
import appReducer from "./appReducer";

const rootReducer = combineReducers({
  auth: authReducer,
  app: appReducer,
  firestore: firestoreReducer,
  firebase: firebaseReducer,
});

export default rootReducer;