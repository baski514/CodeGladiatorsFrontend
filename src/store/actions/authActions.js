import { httpsPOST } from "../../backend_api/mentorAPI";
import { API_POST_CREATE_MENTOR, API_POST_UPDATE_CONTACT } from "../../backend";
import { toast } from 'react-toastify';
import '../../styles/ReactToastify.css';
import { Redirect } from "react-router-dom";
toast.configure()

export const signIn = (credentials) => {
  return (dispatch, getState, {getFirebase}) => {
    const firebase = getFirebase();
 
    firebase.auth().fetchSignInMethodsForEmail(credentials.email).then((data)=>{
        if(data.length===0){
            dispatch({ type: 'INCORRECT_CREDENTIAL'});
        }else{
            firebase.auth().signInWithEmailAndPassword(
                        credentials.email,
                        credentials.password
                      ).then(() => {
                            const user = firebase.auth().currentUser;
                            if(!user.emailVerified){
                                user.sendEmailVerification();
                                firebase.auth().signOut()
                                dispatch({ type: "EMAIL_NOT_VERIFIED"});
                            }else{
                                dispatch({ type: "LOGIN_SUCCESS" });
                            }
                      }).catch((err) => {
                        dispatch({ type: 'INCORRECT_CREDENTIAL', err });
                      });
        }
    }).catch((error)=>{
        console.log(error)
    })

  }
}

export const updateUserProfile = (userProfile, updateSF) => {
    
    return (dispatch, getState, { getFirebase }) => {
        userProfile.lastModifiedBy = new Date()
        
        const firebase = getFirebase();
        firebase
            .firestore()
            .collection("users")
            .doc(getState().firebase.auth.uid)
            .set(userProfile, { merge: true }).then(() => {
                if(updateSF && userProfile.picURL) {
                    httpsPOST(
                        null,
                        `${API_POST_UPDATE_CONTACT}${
                            getState().firebase.profile.sfid
                        }`,
                        {
                            Profile_Picture__c: userProfile.picURL,
                        }
                    ).then((data) => {
                        
                        if (data && data.error) {
                            dispatch({ type: "PROFILE_UPDATE_ERROR" });
                        } else {
                            dispatch({ type: "USER_PROFILE_UPDATED" });
                        }
                    });
                }else {
                    dispatch({ type: "USER_PROFILE_UPDATED" });  
                } 
            }).catch(err => { console.log(err)} );
    };
};

export const updateUserInfo = (userProfile,message) => {

    const {firstName, lastName, description, location, role, qualification} = userProfile

    userProfile.initials = firstName.charAt(0)+lastName.charAt(0)
    
    return (dispatch, getState, { getFirebase }) => {
        
        const firebase = getFirebase();
        firebase
            .firestore()
            .collection("users")
            .doc(getState().firebase.auth.uid)
            .set(userProfile,{merge:true})
            .then(() =>{
                toast.success(message)
                
                dispatch({ type: "USER_PROFILE_UPDATED" });
            }).catch(err => {  console.log(err)} );

            // .set(userProfile, { merge: true })
    };
};


export const signOut = () => {
    return (dispatch, getState, {getFirebase}) => {
        const firebase = getFirebase();
        firebase.auth().signOut().then(() => {
            // <Redirect to='/signin'/> 
            dispatch({ type: 'SIGNOUT_SUCCESS' });
        });

    }
}

export const resetPassword = (email) => {
    return (dispatch, getState, {getFirebase}) => {
        const firebase = getFirebase();

        firebase.auth().fetchSignInMethodsForEmail(email).then((data)=>{
            if(data.length===0){
                dispatch({ type: 'RESET_PASSWORD_ERROR'})
            }else{
                firebase.auth().sendPasswordResetEmail(email)
                .then(() => {
                    // Password reset email sent!
                    
                    dispatch({ type: 'RESET_PASSWORD_SUCCESS'})
                    // ..
                })
                .catch((error) => {
                    dispatch({ type: 'RESET_PASSWORD_ERROR' })
                    console.log("Getting error to send emails")
                    // ..
                });
            }
        }).catch((error)=>{
            dispatch({ type: 'RESET_PASSWORD_ERROR' })
        })
    }
}

export const createNewBasicAccount=(newUser)=>{
    return(dispatch, getState, {getFirebase, getFirestore})=>{
        const firebase = getFirebase();
        const firestore = getFirestore();

        let {email,firstName,lastName,phone,branch,courseChoosed} = newUser;
        const password = firstName + '@' + new Date().getFullYear();


        firebase.auth().createUserWithEmailAndPassword(email,password).then(resp=>{
            const uid = resp.user.uid;
            firstName = firstName[0].toUpperCase()+firstName.substring(1);
            newUser.lastName = lastName[0].toUpperCase()+lastName.substring(1);

            let user = {
                email: email,
                firstName: firstName,
                lastName: lastName,
                firebaseId: uid,
                phone: phone,
                branch: branch,
                courseInterestedIn: courseChoosed,
                userType:'student'
            };

            httpsPOST(null, API_POST_CREATE_MENTOR, user).then((data) => {
                if (data && data.error) {
                    dispatch({ type: "SIGNUP_ERROR" });
                } else {
                    firestore
                            .collection("users")
                            .doc(uid)
                            .set({
                                email:email,
                                firstName: firstName,
                                lastName: lastName,
                                initials: firstName[0] + lastName[0],
                                sfid: data.contactId,
                                userType: "student",
                                picURL:"https://f0.pngfuel.com/png/136/22/profile-icon-illustration-user-profile-computer-icons-girl-customer-avatar-png-clip-art.png"
                            })
                }
            });
        }).then(() => {
        dispatch({ type: "SIGNUP_SUCCESS" });
    }).catch((err) => {
      dispatch({ type: 'SIGNUP_ERROR', err});
    });
    }
}

export const signUp = (newUser) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    
    const firebase = getFirebase();
    const firestore = getFirestore();
    firebase.auth().createUserWithEmailAndPassword(
      newUser.email, 
      newUser.password
    ).then(resp => {
        newUser.uid = resp.user.uid;
        newUser.firstName = newUser.firstName[0].toUpperCase()+newUser.firstName.substring(1);
        newUser.lastName = newUser.lastName[0].toUpperCase()+newUser.lastName.substring(1);

        let user = {
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            firebaseId: newUser.uid,
            userType: newUser.userType
        };
        httpsPOST(null, API_POST_CREATE_MENTOR, user).then((data) => {
            if (data && data.error) {
                dispatch({ type: "SIGNUP_ERROR" });
            } else {
                return firestore
                    .collection("users")
                    .doc(resp.user.uid)
                    .set({
                        firstName: newUser.firstName,
                        lastName: newUser.lastName,
                        initials: newUser.firstName[0] + newUser.lastName[0],
                        sfid: data.contactId,
                        userType: newUser.userType
                    });
            }
        });
    }).then(() => {
        dispatch({ type: "SIGNUP_SUCCESS" });
    }).catch((err) => {
      dispatch({ type: 'SIGNUP_ERROR', err});
    });
  }
}


// Coded by bhaskar
export const bSignup = (newUser) => {
    console.log("New User recieved "+JSON.stringify(newUser))
    return (dispatch, getState, {getFirebase, getFirestore}) => {
    
    const firebase = getFirebase();
    const firestore = getFirestore();
    
    //Check if user is existing or not
    firebase.auth().fetchSignInMethodsForEmail(newUser.email)
    .then((signInMethods) => {
        if(signInMethods.length===0){
            firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password).then((userCred)=>{
                userCred.user.sendEmailVerification();

                newUser.uid = userCred.user.uid;          
                newUser.firstName = newUser.firstName[0].toUpperCase()+newUser.firstName.substring(1);
                newUser.lastName = newUser.lastName[0].toUpperCase()+newUser.lastName.substring(1);

                let user = {
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    firebaseId: newUser.uid,
                    userType: newUser.userType
                };


                user.picURL = user.userType==="instructor"?"https://cdn1.iconfinder.com/data/icons/avatar-97/32/avatar-18-512.png":"https://f0.pngfuel.com/png/136/22/profile-icon-illustration-user-profile-computer-icons-girl-customer-avatar-png-clip-art.png"

                httpsPOST(null, API_POST_CREATE_MENTOR, user).then((data) => {
                    firebase.auth().signOut();
                    if (data && data.error) {
                        console.log("Error "+JSON.stringify(data))
                        dispatch({ type: "SIGNUP_ERROR",msg:data.error});
                    } else {
                         firestore
                            .collection("users")
                            .doc(userCred.user.uid)
                            .set({
                                email:user.email,
                                firstName: newUser.firstName,
                                lastName: newUser.lastName,
                                initials: newUser.firstName[0] + newUser.lastName[0],
                                sfid: data.contactId,
                                userType: newUser.userType,
                                picURL:user.picURL
                            })
                            // .then(() => {
                            //     firebase.auth().signOut();
                            // })
                    }
                })
            }).then(()=>{
                <Redirect to='/signin'/> 
                dispatch({ type: "VERIFIY_EMAIL" });
            }).catch((error)=>{
                console.log('Signup Error ',error)
                dispatch({ type: 'SIGNUP_ERROR', msg:error});
            })
        }else{
            dispatch({ type: 'SIGNUP_ERROR',msg:"Account already exist with this email"});
        }
    })
    .catch((error) => {
        
        dispatch({ type: 'SIGNUP_ERROR',msg:error});
        console.log(error)
    });
  }
}


export const bGoogleSignup = ()=>{
    console.log('Called GoogleAuth')
    return (dispatch, getState, {getFirebase, getFirestore}) => {
  
        const firebase = getFirebase();
        const firestore = getFirestore();

        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth()
            .signInWithPopup(provider)
            .then((result) => {
                var user = result.user;
                const usersRef = firestore.collection('users').doc(user.uid)
                user.firstName = user.displayName.split(' ')[0][0].toUpperCase()+user.displayName.split(' ')[0].substring(1);
                user.lastName = user.displayName.split(' ')[1][0].toUpperCase()+user.displayName.split(' ')[1].substring(1);

                usersRef.get()
                .then((docSnapshot) => {
                    if(!docSnapshot.exists){
                        firestore
                        .collection("users")
                        .doc(user.uid)
                        .set({
                            firstName:user.firstName,
                            lastName: user.lastName,
                            initials: user.firstName[0] + user.lastName[0],
                            email:user.email
                        });  
                        toast.success("Account created")
                    }
                }).then(()=>{
                    dispatch({ type: "LOGIN_SUCCESS" });
                }).catch((error)=>{
                    dispatch({ type: 'LOGIN_ERROR', error });    
                })
            })
            .catch((error) => {
                dispatch({ type: 'LOGIN_ERROR', error });
            });
  }    
}

export const facebookAuth = ()=>{
    console.log('Called FacebookAuth')
    return (dispatch, getState, {getFirebase, getFirestore}) => {
  
        const firebase = getFirebase();
        const firestore = getFirestore();

        var provider = new firebase.auth.FacebookAuthProvider();
        firebase.auth()
            .signInWithPopup(provider)
            .then((result) => {
                var user = result.user;
                user.firstName = user.displayName.split(' ')[0][0].toUpperCase()+user.displayName.split(' ')[0].substring(1);
                user.lastName = user.displayName.split(' ')[1][0].toUpperCase()+user.displayName.split(' ')[1].substring(1);
                
                const usersRef = firestore.collection('users').doc(user.uid)

                usersRef.get()
                .then((docSnapshot) => {
                    if(!docSnapshot.exists){
                        firestore
                        .collection("users")
                        .doc(user.uid)
                        .set({
                            firstName:user.firstName,
                            lastName: user.lastName,
                            initials: user.firstName[0] + user.lastName[0],
                            email:user.email
                        });  
                    }    
                });
            })
            .then(() => {
                dispatch({ type: "LOGIN_SUCCESS" });
            })
            .catch((error) => {
                dispatch({ type: 'LOGIN_ERROR', error });
            });
  }    
}

export const bUpdateUserType = (userProfile) => {
    console.log("Update User "+JSON.stringify(userProfile))
    userProfile.picURL = userProfile.userType ==="instructor"?"https://cdn1.iconfinder.com/data/icons/avatar-97/32/avatar-18-512.png":"https://f0.pngfuel.com/png/136/22/profile-icon-illustration-user-profile-computer-icons-girl-customer-avatar-png-clip-art.png"
    
    console.log("Update User2"+JSON.stringify(userProfile))
    debugger;
    return (dispatch, getState, { getFirebase }) => {
        const firebase = getFirebase();

        httpsPOST(null, API_POST_CREATE_MENTOR, userProfile).then((data) => {
            if (data && data.error) {
                dispatch({ type: "SIGNUP_ERROR",msg:data.error});
            } else {
                userProfile.sfid = data.contactId
                return firebase.firestore().collection("users").doc(userProfile.firebaseId).set({userType:userProfile.userType,sfid:data.contactId,picURL:userProfile.picURL}, { merge: true });
            }
        })
        .then(() => {
            dispatch({ type: "USER_PROFILE_UPDATED"});
        })
        .catch((err) => {
            console.log(err)
        });
    };
};

export const markAllReadNotifications=(notifications)=>{

    // console.log("Notifications Array size ",notifications.length)
    console.log("Notifications recieved",notifications)
    debugger;

    
    return (dispatch, getState, { getFirebase }) => {
        const firebase = getFirebase();
        try {
            notifications.forEach((notification,index)=>{
                firebase.firestore().collection("notifications").doc(notification.id).set({read:true},{merge:true})
            })
            dispatch({ type: "MARK_ALL_AS_READ"});
        } catch (error) {
            toast.error(error)
            dispatch({ type: "MARK_ALL_AS_READ_ERROR"});   
        }
    };
}