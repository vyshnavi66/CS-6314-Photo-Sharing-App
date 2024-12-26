import React, { useState, useEffect } from "react";
import axios from "axios";
import { List, ListItem, ListItemText, Typography, Button } from "@mui/material";

function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);

  // Fetch activities function
  const fetchActivities = async () => {
    try {
      const response = await axios.get("http://localhost:3000/activities");
      setActivities(response.data); // Set activities data
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Error fetching activities. Please try again later.");
    }
  };

  useEffect(() => {
    fetchActivities(); // Call fetchActivities when component mounts
  }, []);

  return (
    <div>
      <Typography variant="h4" style={{ marginBottom: "20px" }}>
        Activity Feed
      </Typography>
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <List>
          {activities.map((activity) => (
            <ListItem key={activity._id}>
              <ListItemText
                //primary={`${activity.user_id.first_name} ${activity.user_id.last_name}`}
                primary={
                  activity.user_id
                    ? `${activity.user_id.first_name} ${activity.user_id.last_name}`
                    : "Unknown User"
                }
                secondary={`${activity.activity_type} at ${new Date(
                  activity.timestamp
                ).toLocaleString()}`}
              />
              {activity.photo_id && (
                <img
                  src={`../images/${activity.photo_id.file_name}`}
                  alt="Thumbnail"
                  style={{ width: "50px", height: "50px", marginLeft: "10px" }}
                />
              )}
            </ListItem>
          ))}
        </List>
      )}
      <Button variant="contained" color="primary" onClick={fetchActivities}>
        Refresh
      </Button>
    </div>
  );
}

export default ActivityFeed;
