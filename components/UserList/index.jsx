import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import axios from 'axios';


function UserList({ photosUpdated, activityUpdate }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null); // for errors when fetching data from server

  useEffect(() => {
    axios.get('http://localhost:3000/user/list').then(response => setUsers(response.data)).catch(err => setError(err));}, [photosUpdated, activityUpdate]);
  const handleUserClick = (userId) => {
    //navigate to corresponding users root path
    navigate(`/users/${userId}`);
  };
  //error handling axios
  if(error) {
    if (error.response) {
      return <div>Error: {error.response.status} </div>;
    }
    else if(error.request) {
      return <div>Error: {error.request}</div>;
    }
    else {
      return <div>Error: {error.message}</div>;
    }
}
  if (!users) {
    return <div>Loading...</div>;
  }  
  const renderActivity = (activity) => {
    if (!activity) return null;

    if (activity.type === 'photo_upload') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', fontFamily: "cursive"  }}>
          <img 
            src={`../images/${activity.photo_thumbnail}`} 
            alt="Thumbnail" 
            style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '8px' }} 
          />
          <span>Uploaded a new photo</span>
        </div>
      );
    }
    if (activity.type === 'comment') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', fontFamily: "cursive"  }}>
          <img 
            src={`../images/${activity.photo_thumbnail}`} 
            alt="Thumbnail" 
            style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '8px' }} 
          />
          <span>Just commented on a photo</span>
        </div>
      );
    }
    if (activity.type === 'registered') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', fontFamily: "cursive"  }}>
          <span>Registered as a new user</span>
        </div>
      );
    }
    if (activity.type === 'logged_in') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', fontFamily: "cursive"  }}>
          <span>User Logged in</span>
        </div>
      );
    }
    if (activity.type === 'logged_out') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', fontFamily: "cursive" }}>
          <span>User Logged out</span>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div>
      <List className="usernames-list" component="nav">
        {users.map((user) => (
          <>
            <ListItem className = "username_listitem" key={user._id} onClick={() => handleUserClick(user._id)}>
            <ListItemText className="username-text" primary={`${user.first_name} ${user.last_name}`} />
            </ListItem>
            {user.latest_activity && (
              <div style={{ paddingLeft: '20px', fontSize: '14px', color: 'gray' }}>
                {renderActivity(user.latest_activity)}
              </div>
            )}
            <Divider className="usernames_divider" />
          </>
        ))}
      </List>
    </div>
  );
}

export default UserList;
