import React, { useEffect, useState } from "react";
import { Button, TextField, Typography, Paper, List, ListItem, ListItemText } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import "./styles.css";
import axios from "axios";

function UserPhotos({ userId, photosUpdated, currentUser, handleActivityUpdate}) { 
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [favoritedPhotos, setFavoritedPhotos] = useState([]);  //added to get favourite photos of current loggedin user..
  // Function to fetch photos
  const fetchPhotos = () => {
    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:3000/photosOfUser/${userId}`)
      .then((response) => {
        setPhotos(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  const fetchFavorites = () => {
    if (currentUser) {
      axios
        .get(`http://localhost:3000/getFavorites/${currentUser._id}`)
        .then((response) => {
          const favoritePhotoIds = response.data.map((photo) => photo._id);
          setFavoritedPhotos(favoritePhotoIds);
        })
        .catch((err) => {
          setError(err);
        });
    }
  };

  // Fetch photos on mount, when the user ID changes
  useEffect(() => {
    if (userId) {
      fetchPhotos();
    }

    fetchFavorites();
  }, [userId, currentUser]);

  // Trigger re-fetch photo is uploaded
  useEffect(() => {
      fetchPhotos();
  }, [photosUpdated]);

  //add favourite at backend and then update current favorite photos on front end.
  const handleAddFavorite = (photoId) => {
    if (currentUser) {
      axios
        .post(`http://localhost:3000/addToFavorites/${currentUser._id}/${photoId}`)
        .then(() => {
          setFavoritedPhotos((prevFavorites) => [...prevFavorites, photoId]);
        })
        .catch((err) => {
          setError(err);
        });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCommentChange = (event) => {
    setCommentText(event.target.value);
  };

  const handleCommentSubmit = (photoId) => {
    setIsCommentSubmitting(true);
    setError(null);
    axios.post(`http://localhost:3000/commentsOfPhoto/${photoId}`, { comment: commentText })
      .then(() => {
        //get new photos and corresponding details
        fetchPhotos();
        setCommentText(''); // Clear comment 
        handleActivityUpdate(); 
        setIsCommentSubmitting(false);
      })
      .catch(err => {
        setError(err);
        setIsCommentSubmitting(false);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    if (error.response) {
      return <div>Error: {error.response.status}</div>;
    } else if (error.request) {
      return <div>Error: {error.request}</div>;
    } else {
      return <div>Error: {error.message}</div>;
    }
  }

  return (
    <div>
      {photos.length === 0 ? (
        <Typography variant="body1">No photos available for this user.</Typography>
      ) : (
        photos.map((photo) => {
          const isFavorited = favoritedPhotos.includes(photo._id); // Check if the current photo is favorited by the loggedin user

          return (
            <Paper key={photo._id} style={{ margin: "10px 10px", padding: "10px" }}>
              <img
                src={`../images/${photo.file_name}`}
                alt={photo.file_name}
                style={{ width: "300px", height: "300px" }}
                className="images"
              />
              <Typography
                className="captions"
                variant="caption"
                style={{ backgroundColor: "lightyellow", color: "black" }}
              >
                Uploaded on: {formatDate(photo.date_time)}
              </Typography>
              <div style={{ marginTop: "10px" }}>
                {/* Add to Favorites Button */}
                {currentUser && (
                  <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddFavorite(photo._id)}
                  style={{ marginBottom: "10px", backgroundColor: "darkmagenta", fontFamily: "cursive", color: "yellow"}}
                  disabled={isFavorited} 
                >
                  {isFavorited ? (
                    <>
                      <FavoriteIcon style={{ marginRight: "8px", color: "red"  }} />
                      Added to Favourites.
                    </>
                  ) : (
                    <>
                      <FavoriteBorderIcon style={{ marginRight: "8px", color: "red" }} />
                      Add to Favorites
                    </>
                  )}
                  </Button>
              )}
                {/* Comments Section */}
                {photo.comments && photo.comments.length > 0 && (
                  <List>
                    {photo.comments.map((comment) => (
                      <ListItem key={comment._id} className="comment-item">
                        <ListItemText
                          style={{ fontFamily: "cursive", color: "darkblue" }}
                          primary={`${comment.user.first_name} ${comment.user.last_name}`}
                          secondary={(
                            <Typography
                              component="span"
                              variant="caption"
                              color="ActiveCaption"
                              style={{ fontFamily: "cursive", color: "magenta" }}
                            >
                              {formatDate(comment.date_time)}: {comment.comment.replace(/"/g, "&quot;").replace(/>/g, "&gt;")}
                            </Typography>
                          )}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                {/* Comment Input */}
                <TextField
                  label="Add a comment"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  value={commentText}
                  onChange={handleCommentChange}
                  disabled={isCommentSubmitting}
                  style={{
                    marginBottom: "10px",
                    borderColor: "darkmagenta",
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleCommentSubmit(photo._id)}
                  disabled={isCommentSubmitting || !commentText.trim()}
                  style={{
                    backgroundColor: "darkmagenta",
                    fontFamily: "cursive",
                    marginTop: "10px",
                    color: "yellow",
                  }}
                >
                  {isCommentSubmitting ? "Posting.." : "Post"}
                </Button>
              </div>
            </Paper>
          );
        })
      )}
    </div>
  );
}

export default UserPhotos;

