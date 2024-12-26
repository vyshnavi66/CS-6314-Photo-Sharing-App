/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the project6 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");

const express = require("express");
const app = express();

const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
const Activity = require("./schema/activity.js");


mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(session({ secret: "secretKey", resave: false, saveUninitialized: false }));
app.use(bodyParser.json());
const loggedInUsers = {};
// Middleware setup
const processFormBody = multer({ storage: multer.memoryStorage() }).single("uploadedphoto");

const logActivity = async (userId, activityType, photoId = null) => {
  try {
    const activity = new Activity({
      user_id: userId,
      activity_type: activityType,
      photo_id: photoId,
    });
    await activity.save();
  } catch (err) {
    console.error("Error logging activity:", err);
  }
};


// POST handler for uploading photos
app.post("/photos/new", (request, response) => {
  if (!request.session || !request.session.user) {
    return response.status(401).send({ message: "Unauthorized: User not logged in" });
  }

  return processFormBody(request, response, async (processError) => {
    if (processError || !request.file) {
      return response.status(400).send({ message: "No file uploaded or invalid file" });
    }

    const timestamp = new Date().valueOf();
    const filename = "U" + String(timestamp) + request.file.originalname;

    try {
      // Saving the file to the disk
      await fs.promises.writeFile("./images/" + filename, request.file.buffer);

      const newPhoto = new Photo({
        file_name: filename,
        date_time: new Date(),
        user_id: request.session.user._id,
        comments: [],
      });

      // Save photo to the database
      const savedPhoto = await newPhoto.save();

      // Log activity: Photo Upload
      await logActivity(request.session.user._id, "Photo Upload", savedPhoto._id);

      
      await User.findByIdAndUpdate(
        request.session.user._id,
        {
          latest_activity: {
            type: "photo_upload",         // Type of activity
            photo_thumbnail: savedPhoto.file_name,  // Attaching photo thumbnai
            timestamp: new Date(),        
          }
        },
        { new: true } // Option to return the updated document
      );
       const tuser = await User.findById(request.session.user._id);
      console.log(tuser);
      

      response.status(200).send(savedPhoto);

    } catch (err) {
      console.error("Error saving photo:", err);
      response.status(500).send({ message: "Error saving photo" });
    }
    return null;
  });
});

//Registration and Passwords
app.post("/user", async (request, response) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = request.body;

  if (!login_name || !password || !first_name || !last_name) {
    return response.status(400).send("Required fields are missing");
  }

  try {
    // Check if the login_name already exists
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return response.status(400).send("Login name already exists");
    }

    // Create a new user
    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    });

    await newUser.save();

    // Log activity: User Registered
    await logActivity(newUser._id, "User Registered");

    
    await User.findByIdAndUpdate(
      newUser._id,
      {
        latest_activity: {
          type: "registered", // Registration activity
          timestamp: new Date(),
        },
      },
      { new: true }
    );
    

    return response.status(200).json({ login_name, _id: newUser._id, first_name, last_name });
  } catch (err) {
    console.error("Error registering user:", err);
    return response.status(500).send("Error registering user");
  }
});


// Admin login route
app.post("/admin/login", async (req, res) => {
  const { login_name, password } = req.body;

  if (!login_name || !password) {
    return res.status(400).send("Login name and password are required");
  }

  try {
    const user = await User.findOne({ login_name: login_name });

    if (!user || user.password !== password) {
      return res.status(400).send("Invalid login credentials");
    }

    req.session.user = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name,
    };

    loggedInUsers[req.sessionID] = req.session.user;

    // Log activity: User Logged In
    await logActivity(user._id, "User Logged In");

    
    await User.findByIdAndUpdate(
      user._id,
      {
        latest_activity: {
          type: "logged_in", 
          timestamp: new Date(),
        },
      },
      { new: true }
    );

    

    return res.json({
      _id: user._id,
      first_name: user.first_name,
      login_name: user.login_name, // for registration and password
    });

  } catch (loginError) {
    console.error("Login error:", loginError);
    return res.status(500).send("Error logging in.");
  }
});

/*// Admin logout route
app.post("/admin/logout", (req, res) => {
  if (req.session && req.session.user) {
    

    
    delete loggedInUsers[req.sessionID];
    return req.session.destroy((destroyError) => {
      if (destroyError) {
        return res.status(500).send("Error logging out.");
      }
      res.clearCookie("connect.sid");

      // Log activity: User Logged Out
      await logActivity(userId, "User Logged Out");

      return res.status(200).send("Logged out successfully.");
    });
  } else {
    return res.status(400).send("No user is logged in.");
  }
});*/

// Admin logout route
app.post("/admin/logout", async (req, res) => {
  if (req.session && req.session.user) {
    const userId = req.session.user._id;

    try {
      delete loggedInUsers[req.sessionID];
      await new Promise((resolve, reject) => {
        req.session.destroy((destroyError) => {
          if (destroyError) {
            reject(destroyError);
          } else {
            resolve();
          }
        });
      });

      res.clearCookie("connect.sid");

      // Log activity: User Logged Out
      await logActivity(userId, "User Logged Out");


      
      // Update user's latest activity in the database
      await User.findByIdAndUpdate(
        userId,
        {
          latest_activity: {
            type: "logged_out", // Activity type is "logged_out"
            timestamp: new Date(), // Save timestamp for safety
          },
        },
        { new: true }
      );
      

      return res.status(200).send("Logged out successfully.");
    } catch (err) {
      console.error("Error logging out:", err);
      return res.status(500).send("Error logging out.");
    }
  } else {
    return res.status(400).send("No user is logged in.");
  }
});

  


app.get("/activities", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const activities = await Activity.find({})
      .sort({ timestamp: -1 }) // Most recent first
      .limit(5)
      .populate("user_id", "first_name last_name")
      .populate("photo_id", "file_name");

    //const validActivities = activities.filter(activity => activity.user_id); // Filter out invalid user_id
    console.log("Fetched activities:", activities); // Log activities
    res.status(200).json(activities);
  } catch (err) {
    console.error("Error fetching activities:", err);
    res.status(500).send({ message: "Error fetching activities" });
  }
  return null;
});




// Check logged-in status
app.get("/admin/checkLoggedIn", (req, res) => {
  if (req.session.user) {
    return res.json(req.session.user);
  }
  return res.status(401).send("Unauthorized");
});

// POST handler for adding comments
app.post('/commentsOfPhoto/:photoId', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { comment: commentText } = req.body;
  const { photoId } = req.params;

  if (!commentText || commentText.trim() === "") {
    return res.status(400).json({ message: 'Comment cannot be empty' });
  }

  try {
    // Add the comment to the photo's comments array
    const photo = await Photo.findById(photoId);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    const newComment = {
      comment: commentText,
      date_time: new Date(),
      user_id: req.session.user._id ,
    };
    //saving in backend
    photo.comments.push(newComment);
    await photo.save();

    // Log activity: New Comment
    await logActivity(req.session.user._id, "New Comment", photoId);

    
    await User.findByIdAndUpdate(
      req.session.user._id,
      {
        latest_activity: {
          type: "comment", // Activity type is "comment"
          photo_thumbnail: photo.file_name, // Attach the photo thumbnail for context
          timestamp: new Date(), 
        },
      },
      { new: true } 
    );
    

    res.status(200).json({ message: 'Comment added successfully' });

  } catch (err) {
    // Handle  errors
    console.error(err);
    res.status(500).json({ message: 'An error occurred while adding the comment' });
  }
  return null;
});


app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.send("Simple web server of files from " + __dirname);
});


app.get("/test/:p1", async function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    try{

      const info = await SchemaInfo.find({});
      if (info.length === 0) {
            // No SchemaInfo found - return 500 error
            return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]); // Use `json()` to send JSON responses
    } catch(err){
      // Handle any errors that occurred during the query
      console.error("Error in /test/info:", err);
      return response.status(500).json(err); // Send the error as JSON
    }

  } else if (param === "counts") {
   // If the request parameter is "counts", we need to return the counts of all collections.
// To achieve this, we perform asynchronous calls to each collection using `Promise.all`.
// We store the collections in an array and use `Promise.all` to execute each `.countDocuments()` query concurrently.
const collections = [
  { name: "user", collection: User },
  { name: "photo", collection: Photo },
  { name: "schemaInfo", collection: SchemaInfo },
];

try {
  await Promise.all(
    collections.map(async (col) => {
      col.count = await col.collection.countDocuments({});
      return col;
    })
  );

  const obj = {};
  for (let i = 0; i < collections.length; i++) {
    obj[collections[i].name] = collections[i].count;
  }
  return response.end(JSON.stringify(obj));
} catch (err) {
  return response.status(500).send(JSON.stringify(err));
}
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    return response.status(400).send("Bad param " + param);
  }
});

// Fetch all users
app.get("/user/list", async (req, res) => {
  if (!req.session.user) {
    //if (!request.session || !request.session.user) {
    return res.status(401).json({ message: "Unauthorized: User not logged in" });
  }

  try {
    const users = await User.find({}, "_id first_name last_name latest_activity");
    return res.json(users);
  } catch (err) {
    console.error("Error fetching /user/list:", err);
    return res.status(500).send({ message: "Error fetching user list" });
  }
});

// Fetch user details
/*app.get("/user/:id", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findById(req.params.id, "_id first_name last_name location description occupation");

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).send({ message: "Error fetching user" });
  }
});*/

app.get("/user/:id", async function (request, response) {
  if (!request.session.user) {
    return response.status(401).json({ message: "Unauthorized" });
  }
  
  const id = request.params.id;
  
  // Validate if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("Invalid user ID");
  }
  
  try {
    const userDetails = await User.findOne({ _id: id }, "_id first_name last_name location description occupation");
    if (!userDetails) {
      return response.status(400).send("User not found for given id");
    }

    return response.json(userDetails);
  } catch (err) {
    console.error("Error in /user/:id:", err);
    return response.status(400).send("Error fetching user details");
  }
});

app.get("/photosOfUser/:id", async (request, response) => {
  if (!request.session.user) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  const userId = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error("Invalid user ID:", userId);
    return response.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const photos = await Photo.find({ user_id: userId });
    if (photos.length === 0) {
      console.warn("No photos found for userId:", userId);
      return response.status(404).json({ message: "No photos found for this user." });
    }

    

    const formattedPhotos = await Promise.all(
      photos.map(async (photo) => {
        const populatedComments = await Promise.all(
          photo.comments.map(async (comment) => {
            const user = await User.findById(comment.user_id, "_id first_name last_name");
            return {
              _id: comment._id,
              comment: comment.comment,
              date_time: comment.date_time,
              user: user ? {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
              } : null,
            };
          })
        );
        return {
          _id: photo._id,
          user_id: photo.user_id,
          file_name: photo.file_name,
          date_time: photo.date_time,
          comments: populatedComments.filter(comment => comment.user !== null),
        };
      })
    );

    response.status(200).json(formattedPhotos);
  } catch (err) {
    console.error("Error fetching photos:", err);
    response.status(500).json({ message: "Server error" });
  }
  return null;
});

//to get most commented photo and latest photo
app.get("/userPhotoDetails/:id", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid user ID");
  }

  try {
    const photos = await Photo.find({ user_id: id });

    const mostRecentPhoto = photos.sort((a, b) => b.date_time - a.date_time)[0];

    const mostCommentedPhoto = photos.reduce((prev, current) => {
      return (prev.comments.length > current.comments.length) ? prev : current;
    }, photos[0]);

    res.json({
      mostRecentPhoto,
      mostCommentedPhoto,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching photo details', error: err });
  }
  return null;
});

app.post('/addToFavorites/:userId/:photoId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const photo = await Photo.findById(req.params.photoId);

    if (!user || !photo) {
      return res.status(404).json({ message: "no current user or photo not found" });
    }
    
    //validate and save in favorites
    if (!user.favorites.includes(photo._id)) {
      user.favorites.push(photo._id);
      await user.save();
    }

    res.status(200).json({ message: "Photo added to favorites." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  return null;
});

app.delete('/removeFromFavorites/:userId/:photoId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "Current user not found." });
    }

    // Remove photo from the favorites list
    user.favorites = user.favorites.filter(id => id.toString() !== req.params.photoId);
    await user.save();

    res.status(200).json({ message: "Photo removed from favorites." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  return null;
});

app.get('/getFavorites/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('favorites');

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  return null;
});

// Start the server
app.listen(3000, () => {
  console.log("Listening at http://localhost:3000 exporting the directory " + __dirname);
});
