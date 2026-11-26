/*
   New codebase for ionic capacitor app.  App will be too different from the pwa to maintain 
   in a branch and eventually pull to main.  Common code may eventually be pulled into 
   componenets/libraries, but that is probably more trouble than worth it because there are 
   divergences almost everywhere

   - fix itemView scroll/swipe - use swipe from gallery playItems
   - fix no wall items at startup

*/
export const versions = [   
   ["v1.12.0", "11/25/26"], // Re-enable dark mode
   ["v1.11.0", "11/24/26"], // Add ios login autofill
   ["v1.10.3", "11/23/26"], // Hold audio for each saved photos 
   ["v1.10.2", "11/22/26"], // Save every photo after taken
   ["v1.10.1", "11/21/26"], // Save images locally in capacitor/filesystem
   ["v1.10.0", "11/21/26"], // Initial CameraView saving images locally
   ["v1.9.0",  "11/20/26"], // Show CameraView in footer when user logged in
                            // Open CameraView to taking a photo if one isn't waiting for upload
   ["v1.8.1",  "11/19/26"], // Update hit/notificationAccess per Firebase auth/storage reversion
   ["v1.8.0",  "11/19/26"], // Update authMgr, item/userAccess as part of Firebase auth/storage reversion from 
                            // @capacitor-firebase back to @/firebase.  Issue exposed by CameraView unable to validate
                            // storage after the Firebase IOS app had to be deleted and recreated to change the bundleID
                            // for appStore upload.
                            // Add item galleryId, public/private selection to CameraView
                            // Display gallery.shortName for small thumbs
   ["v1.7.0",  "11/17/26"], // Add gallery select to CameraView
   ["v1.6.2",  "11/16/26"], // Add Camera keys to Info.plist
   ["v1.6.1",  "11/16/26"], // Working push notifications - updated appDelegate/google app info
   ["v1.6.0",  "11/15/26"], // Initial add of push notifications via firestore cloud messaging
   ["v1.5.1",  "11/14/26"], // Update Info.plist per appstoreconnect upload issue
   ["v1.5.0",  "11/13/26"], // Add icon to ItemArtistYear to play audio if present 
   ["v1.4.0",  "11/12/26"], // Add AboutView
   ["v1.3.0",  "11/12/26"], // Add version to Home
   ["v1.2.0",  "11/10/26"], // Add Audio, backend speech to text for photo name
   ["v1.1.0",  "11/7/26"],  // Add Camera
   ["v1.0.0",  "11/1/26"],  // Bump to 1.x per stable functionality
   ["v0.1.0",  "10/18/26"], // Revert Auth back to Capacitor/FB bridge because it's needed for Capacitor FB DB.  Had it
                            // previously but moved back to FB Auth SDK because bridge had a timing issue on login that
                            // caused permission errors on intial post/reply reads, which require auth. SDK Auth and Bridge
                            // DB worked in Simulator, but not physical phone, where post/reply reads never succeeded.
   ["v0.0.2",  "10/8/26"],  // Home/Galleries/ItemView ported, store/access added for native firebase integration
   ["v0.0.1",  "10/6/26"],  // Initial copy for ionic app dev
]
