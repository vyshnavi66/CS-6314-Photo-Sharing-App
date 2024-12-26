import React, { useEffect, useState } from "react";
import { Box,AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import "./styles.css";

function TopBar({ currentUser ,setCurrentUser, onPhotoUploaded, handleActivityUpdate }) {
  const [userName, setUserName] = useState(null);
  const location = useLocation();
  const [version, setVersion] = useState("");
  const navigate = useNavigate(); 


  // Ref for file input
  const uploadInput = React.useRef(null);

  useEffect(() => {
    // Fetching version info
    axios.get('http://localhost:3000/test/info')
      .then(response => {
        if (response.data && response.data.version) {
          setVersion(response.data.version); 
        }
      })
      .catch(err => {
        console.error("Error fetching version info:", err); // Log error
      });
  }, []);
   
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const userId = pathParts[pathParts.length - 1]; 

    if (location.pathname.startsWith("/photos/") || location.pathname.startsWith("/users/")) {
      axios.get(`http://localhost:3000/user/${userId}`) 
        .then(response => {
          const user = response.data; 
          if (user) {
            setUserName(`${user.first_name} ${user.last_name}`);
          }
        })
        .catch(err => {
          console.error("Error fetching user data:", err); 
          setUserName(null); 
        });
    }
  }, [location.pathname]);

  const getContextText = () => {
    if (!currentUser) {
      return "Please Login"; 
    }
    if (location.pathname.startsWith("/photos/") && userName) {
      return `Photos of ${userName}`;
    }
    if (location.pathname.startsWith("/users/")) {
      return `Details of ${userName}`;
    }
    return "PhotoShare App!";
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:3000/admin/logout');
      if (response.status === 200) {
        console.log("Logged out successfully!");
        handleActivityUpdate(); 
        setCurrentUser(null); 
        localStorage.removeItem('currentUser');
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleUploadPhoto = () => {
    if (uploadInput.current && uploadInput.current.files.length > 0) {
      const domForm = new FormData();
      domForm.append("uploadedphoto", uploadInput.current.files[0]);

      axios
        .post("http://localhost:3000/photos/new", domForm)
        .then((res) => {
          console.log("Photo uploaded successfully:", res.data);
          if (onPhotoUploaded) {
            onPhotoUploaded();
          }
        })
        .catch((err) => console.error("Error uploading photo:", err));
    }
  };

  return (
    <AppBar className="topbar-appBar" position="absolute" style={{backgroundColor: "darkmagenta"}}>
      <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h8" style = {{color: "yellow"}}>
        {currentUser ? `Hi ${currentUser.first_name}` : ""}
        </Typography>
        <Typography variant="h5" style = {{color: "yellow", fontFamily: "cursive"}}>
          {getContextText()}
        </Typography>
        <Box display="flex" alignItems="center">
        <Typography variant="h8">
          Version: {version} 
        </Typography>
        {currentUser && (
          <>
          {/* File input for photo upload */}
          <input
            type="file"
            accept="image/*"
            ref={uploadInput}
            style={{ display: "none" }}
          />
          <Button
            onClick={() => uploadInput.current.click()}
            sx={{
              textDecoration: "none",
              margin: "10px",
              fontFamily: "cursive",
              color: "white",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "silver",
                color: "darkviolet",
              },
              backgroundColor: "silver",
            }}
          >
            Add Photo
          </Button>
          <Button
            onClick={handleUploadPhoto}
            sx={{
              textDecoration: "none",
              margin: "10px",
              fontFamily: "cursive",
              color: "white",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "silver",
                color: "darkviolet",
              },
              backgroundColor: "silver",
            }}
          >
            Upload
          </Button>
          <Button
                onClick={() => navigate(`/Favorites`)}
                to="/favorites"
                sx={{
                  textDecoration: "none",
                  margin: "10px",
                  fontFamily: "cursive",
                  color: "white",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "silver",
                    color: "darkviolet",
                  },
                  backgroundColor: "silver",
                }}
              >
                Favorites
          </Button>
          <Button 
                onClick={() => navigate(`/activities`)} // Navigate to Activities view
                sx={{
                  textDecoration: "none",
                  margin: "10px",
                  fontFamily: "cursive",
                  color: "white",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "silver",
                    color: "darkviolet",
                  },
                  backgroundColor: "silver",
                }}
              >
                Activities
          </Button>
          <Button 
          onClick={handleLogout} 
          sx={{
            textDecoration: "none", 
            margin: "10px", 
            fontFamily: "cursive", 
            color: "white", 
            cursor: "pointer",
            "&:hover": { 
              backgroundColor: "silver",
              color: "darkviolet",
            },
            backgroundColor: "silver"
          }}>
            Logout
          </Button>
          </>
        )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
