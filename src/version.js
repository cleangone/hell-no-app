/*
   New codebase for ionic capacitor app.  App will be too different from the pwa to maintain 
   in a branch and eventually pull to main.  Common code will eventually be pulled into 
   componenets/libraries

   Future:
   - add gallery.shortName
   - listen to audio
*/
export const versions = [   
   ["v1.5.0",  "11/13/26"],// Add icon to ItemArtistYear to play audio if present 
   ["v1.4.0",  "11/12/26"],// Add AboutView
   ["v1.3.0",  "11/12/26"],// Add version to Home
   ["v1.2.0",  "11/10/26"],// Add Audio, backend speech to text for photo name
   ["v1.1.0",  "11/7/26"], // Add Camera
   ["v1.0.0",  "11/1/26"], // Bump to 1.x per stable functionality
   ["v0.1.0",  "10/18/26"],// Revert Auth back to Capacitor/FB bridge because it's needed for Capacitor FB DB.  Had it
                           // previously but moved back to FB Auth SDK because bridge had a timing issue on login that
                           // caused permission errors on intial post/reply reads, which require auth. SDK Auth and Bridge
                           // DB worked in Simulator, but not physical phone, where post/reply reads never succeeded.
   ["v0.0.2",  "10/8/26"], // Home/Galleries/ItemView ported, store/access added for native firebase integration
   ["v0.0.1",  "10/6/26"], // Initial copy for ionic app dev
]
