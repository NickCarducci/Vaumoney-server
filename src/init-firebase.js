import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
var firebaseConfig = {
  apiKey: "AIzaSyCEiWNGlidcYoXLizAstyhxBpyhfBFu3JY",
  authDomain: "vaumoney.firebaseapp.com",
  databaseURL: "https://vaumoney.firebaseio.com",
  projectId: "vaumoney",
  storageBucket: "vaumoney.appspot.com",
  messagingSenderId: "580465804476",
  appId: "1:580465804476:web:5fe118607e434910683cb9"
};
!firebase.apps.length && firebase.initializeApp(firebaseConfig);
//firebase.firestore().enablePersistence({ synchronizeTabs: true });
firebase.auth();
//firebaseApp && firebaseApp.firestore().enablePersistence(false);
/*.settings({
  cacheSizeBytes: 1048576
});*/
//firebase.firestore().settings({ persistence: false });

export default firebase;
