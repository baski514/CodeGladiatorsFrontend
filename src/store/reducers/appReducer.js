const initState = {
    course: [],
    dailyUpdates: [],
    mentors: [],
    enrollments: [],
    wishList: [],
    courseMasterList: [],
    readRecUser: undefined,
};

const authReducer = (state = initState, action) => {
    switch (action.type) {
        /* case "USER_PROFILE_UPDATED":
            return {
                ...state,
                profilePicUrl: action.picURL,
            }; */

        case "COURSE_MASTER_LOADED":
            return {
                ...state,
                course: action.course,
                dailyUpdates: action.dailyUpdates,
                mentors: action.mentors,
                courseMasterList: action.courseMasterList
            };

        case "ENROLLMENTS_LOADED":
            return {
                ...state,
                enrollments: action.enrollments,
            };

        case "WISHLIST_LOADED":
            return {
                ...state,
                wishList: action.wishList,
            };

        case "SIGNOUT_SUCCESS":
            return {
                course: [],
                dailyUpdates: [],
                mentors: [],
                enrollments: [],
                wishList: [],
                courseMasterList: []
            };
        
        case "MARK_MSG_AS_READ":
            return {
                ...state,
                readRecUser: action.userId
            }

        case "Course_Enrollment_Updated":
            return{
                ...state,
                readRecUser: action.userId
            }    
        
        case "MARK_MSG_AS_READ_ERROR":
            return {
                ...state,
                readRecUser: undefined,
            };

        default:
            return state;
    }
};

export default authReducer;
