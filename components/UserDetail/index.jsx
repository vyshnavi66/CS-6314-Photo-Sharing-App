import React, { useEffect, useState } from "react";
import { Typography, Paper, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./styles.css";
import axios from 'axios';

function UserDetail({userId}) {
  const [user, setUser] = useState(null);
  const [mostRecentPhoto, setMostRecentPhoto] = useState(null);
  const [mostCommentedPhoto, setMostCommentedPhoto] = useState(null);
  const [error, setError] = useState(null); //for fetching errors
  const navigate = useNavigate(); 
    
  useEffect(() => {
    // Fetch user details first
    axios.get(`http://localhost:3000/user/${userId}`)
    .then(response => setUser(response.data))
    .catch(err => setError(err));

    axios
    .get(`http://localhost:3000/userPhotoDetails/${userId}`)
    .then((response) => {
      setMostRecentPhoto(response.data.mostRecentPhoto);
      setMostCommentedPhoto(response.data.mostCommentedPhoto);
    })
    .catch((err) => setError(err));
    }, [userId]);

  if(error){
    if (error.response) {
      return <div>Error: {error.response.status}</div>;
    }
    else if(error.request) {
      return <div>Error: {error.request}</div>;
    }
    else {
      return <div>Error: {error.message}</div>;
    }
}


  if (!user) {
    return <div>Loading...</div>;
  }

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePhotoClick = () => {
    navigate(`/photos/${userId}`); // Navigate to the photos page of userID
  };


  return (
    <Paper sx={{ margin: "10px"}}>
      <Typography variant="h5" sx={{ margin: "10px", padding : "5px"}} className="user_detail_name">{`${user.first_name} ${user.last_name}`}</Typography>
      <Typography variant="body1" sx= {{fontFamily: "cursive", margin: "10px"}} className="user_detail"><strong> Location:</strong> {user.location}</Typography>
      <Typography variant="body1" sx= {{fontFamily: "cursive", margin: "10px"}} className="user_detail"><strong>Occupation:</strong> {user.occupation}</Typography>
      <Typography variant="body1" sx= {{fontFamily: "cursive", margin: "10px"}} className="user_detail"><strong>Description:</strong> {user.description}</Typography>      
      {mostRecentPhoto && (
        <Box sx={{textAlign: "left" ,margin: "10px", padding: "5px"}}>
          <Typography variant="body1" className="user_detail" sx= {{fontFamily: "cursive"}}>Recently Uploaded..</Typography>
          <Box
            sx={{
              width: 150,
              marginTop: "10px",
              display: "inline",
              textAlign: "center",
            }}
          >
            <img
              src={`http://localhost:3000/images/${mostRecentPhoto.file_name}`}
              alt={mostRecentPhoto.file_name}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "5px",
                marginTop: "5px",
                marginRight: "5px",
                cursor: "pointer",
              }}
              onClick={() => handlePhotoClick(mostRecentPhoto._id)}
            />
            <Typography variant="caption" sx={{ opacity: "70%", fontFamily: "cursive", fontSize: "1rem", fontStyle: "italic"}}>
            Uploaded on: {formatDate(mostRecentPhoto.date_time)}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Display the most commented photo */}
      {mostCommentedPhoto && (
        <Box sx={{textAlign: "left" ,margin: "10px", padding: "5px"}}>
          <Typography variant="body1" className="user_detail" sx= {{fontFamily: "cursive"}}>Most Comments on..</Typography>
          <Box
            sx={{
              width: 150,
              marginTop: "10px",
              display: "inline",
              textAlign: "center",
            }}
          >           
           <img
              src={`http://localhost:3000/images/${mostCommentedPhoto.file_name}`}
              alt={mostCommentedPhoto.file_name}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "5px",
                marginTop: "5px",
                marginRight: "5px",
                cursor: "pointer",
              }}
              onClick={() => handlePhotoClick(mostRecentPhoto._id)}
            />
            <Typography variant="caption" sx={{ opacity: "70%", fontFamily: "cursive", fontSize: "1rem", fontStyle: "italic"}}>
            {mostCommentedPhoto.comments.length} Comments
            </Typography>
          </Box>
        </Box>
      )}
      <Button
        onClick={() => navigate(`/photos/${userId}`)} // Programmatic navigation
        sx={{
          textDecoration: "none", 
          margin: "10px", 
          fontFamily: "cursive", 
          color: "violet", 
          cursor: "pointer",
          "&:hover": { 
            color: "darkviolet", 
          }
        }}
      > View Photos
      </Button>    
    </Paper>
  );
}

export default UserDetail;
