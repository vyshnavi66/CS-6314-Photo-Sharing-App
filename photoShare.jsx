import React,  {useEffect, useState }  from "react";
import ReactDOM from "react-dom/client";
import { Grid, Typography, Paper } from "@mui/material";
import { HashRouter, Route, Navigate, Routes, useParams } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";
import FavoritePhotos from "./components/FavoritePhotos"; // Add this import at the top
import ActivityFeed from "./components/ActivityFeed"; // Add this import



function UserDetailRoute() {
  const {userId} = useParams();
  console.log("UserDetailRoute: userId is:", userId);
  return <UserDetail userId={userId} />;
}

function UserPhotosRoute({ photosUpdated, currentUser, handleActivityUpdate}) { 
  const {userId} = useParams();
  return <UserPhotos userId={userId} photosUpdated={photosUpdated} currentUser={currentUser} handleActivityUpdate={handleActivityUpdate} />;
}

function PhotoShare() {
  const [currentUser, setCurrentUser] = useState(null); // State for current user
  const [loading, setLoading] = useState(true); // For loading state (if needed)
  const [photosUpdated, setPhotosUpdated] = useState(false); // track if photos are updated
  
  const [activityUpdate, setActivityUpdate] = useState(true);
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:3000/admin/checkLoggedIn");
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData); // Set current user if logged in
        } else {
          setCurrentUser(null); // No user logged in
        }
      } catch (error) {
        setCurrentUser(null); 
      }
      finally {
        setLoading(false); 
      }
    };
    checkLoginStatus(); // Call the check login function on mount
  }, []);

  if (loading) {
    return <Typography variant="body1">Loading...</Typography>; // Show a loading message until login status is determined
  }

  const handlePhotoUploaded = () => {
    setPhotosUpdated((prev) => !prev); // Toggle state to trigger re-fetch in photos component
  };

  
  const handleActivityUpdate = () => {
    setActivityUpdate((prev) => !prev); // Toggle state to trigger re-fetch in photos component
  };
  

  return (
    <HashRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar currentUser={currentUser} setCurrentUser={setCurrentUser} onPhotoUploaded={handlePhotoUploaded} handleActivityUpdate={handleActivityUpdate}/>  {/*last point yammsss handleActivityUpdate={handleActivityUpdate} */}
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item">
            {currentUser ? (
                //<UserList />
                
                <UserList photosUpdated={photosUpdated} activityUpdate={activityUpdate} />
              ) : (
                <Typography sx={{ opacity: 0.7, fontStyle: 'italic'  }} variant="body2">Please log in to see the user list.</Typography>
              )}
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                {/* Login/Register route */}
                <Route
                  path="/login-register" element={<LoginRegister setCurrentUser={setCurrentUser} handleActivityUpdate={handleActivityUpdate}/>}
                />

                {/* Home route: Redirects to login-register if not logged in */}
                <Route
                  path="/"
                  element={
                    currentUser ? (
                      <Typography variant="body1" sx = {{fontFamily : "cursive"}}>Welcome to PhotoShare App!</Typography>
                    ) : (
                      <Navigate to="/login-register" />
                    )
                  }
                />

                {/* UserDetail route: Redirects to login-register if not logged in */}
                <Route
                  path="/users/:userId"
                  element={
                    currentUser ? <UserDetailRoute /> : <Navigate to="/login-register" />
                  }
                />

                {/* UserPhotos route: Redirects to login-register if not logged in */}
                <Route
                  path="/photos/:userId"
                  element={
                    currentUser ? <UserPhotosRoute photosUpdated={photosUpdated} currentUser={currentUser} handleActivityUpdate={handleActivityUpdate}/> : <Navigate to="/login-register" />
                  }
                />
                <Route
                  path="/favorites"
                  element={currentUser ? <FavoritePhotos currentUser={currentUser} /> : <Navigate to="/login-register" />}
                />

                {/* Activities route */}
                <Route
                  path="/activities"
                  /* element={
                    currentUser ? (<ActivityFeed currentUser={currentUser} /> 

                    ) : ( 
                    <Navigate to="/login-register" /> 
                    )
                  } */
                  element={currentUser ? <ActivityFeed /> : <Navigate to="/login-register" />}
                /> 
                {/*<Route 
                path="/activities" 
                element={<ActivityFeed />} /> */}


                {/* UserList route: Redirects to login-register if not logged in */}
                <Route
                  path="/users"
                  element={
                    currentUser ? <UserList photosUpdated={photosUpdated} activityUpdate={activityUpdate}/> : <Navigate to="/login-register" />
                  }
                />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </HashRouter>
  );
}


const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(<PhotoShare />);
