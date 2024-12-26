import React, { useEffect, useState } from 'react';
import { Button, Modal, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

function FavoritePhotos({ currentUser }) {
  const [favoritedPhotos, setFavoritedPhotos] = useState([]); //current list of favorites.
  const [selectedPhoto, setSelectedPhoto] = useState(null); 
  const [open, setOpen] = useState(false); // for modal visibility

  // Fetch favorited photos of current logged in user.
  useEffect(() => {
    if (currentUser) {
      axios
        .get(`http://localhost:3000/getFavorites/${currentUser._id}`)
        .then((response) => {
          setFavoritedPhotos(response.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [currentUser]);

  // handling click on thumbnails.
  const handleThumbnailClick = (photo) => {
    setSelectedPhoto(photo);
    setOpen(true);
  };

  // Closing modal
  const handleClose = () => {
    setOpen(false);
    setSelectedPhoto(null);
  };

  // Remove a photo from the favorites in database and update favorite list here on front end.
  const handleRemoveFavorite = (photoId) => {
    if (currentUser) {
      axios
        .delete(`http://localhost:3000/removeFromFavorites/${currentUser._id}/${photoId}`)
        .then(() => {
          setFavoritedPhotos((prevFavorites) =>prevFavorites.filter((photo) => photo._id !== photoId)
          );
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  return (
    <div>
      <Typography variant="h4" style={{ fontFamily: "cursive", marginBottom: "10px"}}>
        Favourites
      </Typography>
      <div style={{ display: 'flex',flexDirection: "column", flexWrap: 'wrap',justifyContent: 'flex-start', gap: '8px' }}>
        {favoritedPhotos.map((photo) => (
          <div key={photo._id}>
            <img
              src={`../images/${photo.file_name}`}
              alt={photo.file_name}
              style={{
                width: '70px',
                height: '70px',
                cursor: 'pointer',
                borderRadius: '5px',
              }}
              onClick={() => handleThumbnailClick(photo)}
            />
            <IconButton
              style={{
                bottom: '60px',
                color: 'red',
                padding: '0px',
              }}
              onClick={() => handleRemoveFavorite(photo._id)}
            >
              <CloseIcon />
            </IconButton>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <div style={{
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: "white" , 
          padding: '10px', 
          borderRadius: '8px', 
          textAlign: 'center', 
          maxWidth: '90%'
        }}>
          <img
            src={`../images/${selectedPhoto?.file_name}`}
            alt={selectedPhoto?.file_name}
            style={{ width: '100%'}} 
          />
          <Typography variant="h6" style={{ marginTop: '10px' , fontFamily: "cursive" , fontStyle: "italic"}}>
            Photo Uploaded on {new Date(selectedPhoto?.date_time).toLocaleDateString()}
          </Typography>
          <Button onClick={handleClose} variant="contained" color="secondary" style={{ marginTop: '10px', fontFamily: "cursive" }}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default FavoritePhotos;
