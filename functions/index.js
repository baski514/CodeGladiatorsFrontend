//Author : Deagle
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp(functions.config().firebase);

//FB functions

const createNotifications = (notification) => {
    return admin
        .firestore()
        .collection("notifications")
        .add(notification)
        .then((doc) => console.log("Notification added", doc));
};

exports.messageCreated = functions.firestore
    .document("messages/{messsageId}")
    .onCreate((doc) => {
        const message = doc.data();
        const notification = {
            message: `You have a new message from : ${message.from_fid}`,
            time: admin.firestore.FieldValue.serverTimestamp(),
            user_id: message.to_fid,
            read: false,
            from: message.author,
        };

        return createNotifications(notification);
});
