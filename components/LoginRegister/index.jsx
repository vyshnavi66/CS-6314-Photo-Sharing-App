import React, { useState } from "react";
import { TextField, Button, Typography, Container, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginRegister({ setCurrentUser, handleActivityUpdate }) {
  // Separate state for login and register fields
  const [loginNameLogin, setLoginNameLogin] = useState(""); // For login form
  const [loginNameRegister, setLoginNameRegister] = useState(""); // For register form
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [occupation, setOccupation] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await axios.post("http://localhost:3000/user", {
        login_name: loginNameRegister,
        password,
        first_name: firstName,
        last_name: lastName,
        location,
        description,
        occupation,
      });

      setSuccessMessage("Registration successful! Please login.");
      handleActivityUpdate();
      setLoginNameRegister("");
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
      setLocation("");
      setDescription("");
      setOccupation("");
      setError("");
    } catch (err) {
      setError(err.response ? err.response.data : "Error registering user");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/admin/login", {
        login_name: loginNameLogin,
        password, // Ensure password is sent
      });
      setLoading(false);
      setCurrentUser(response.data);
      handleActivityUpdate();
      navigate(`/users/${response.data._id}`);
    } catch (err) {
      setLoading(false);
      setError("Login failed! Please check your login credentials.");
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: "5rem" }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontFamily: "cursive" }}>
          Login to PhotoShare
        </Typography>

        <form onSubmit={handleLogin} style={{ width: "100%", marginTop: "1rem" }}>
          <TextField
            label="Login Name"
            variant="outlined"
            fullWidth
            value={loginNameLogin}
            onChange={(e) => setLoginNameLogin(e.target.value)}
            required
            sx={{ marginBottom: "1rem" }}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ marginBottom: "1rem" }}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ marginBottom: "1rem" }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ marginBottom: "1rem", backgroundColor: "darkmagenta" }}
          >
            {loading ? "Logging In..." : "Login"}
          </Button>
        </form>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "2rem" }}>
        <Typography variant="h5" sx={{ fontFamily: "cursive" }}>Register</Typography>
        {error && <Typography color="error">{error}</Typography>}
        {successMessage && <Typography color="primary">{successMessage}</Typography>}
        <TextField
          label="Login Name"
          value={loginNameRegister}
          onChange={(e) => setLoginNameRegister(e.target.value)}
          fullWidth
          sx={{ marginBottom: "1rem" }}
        />
        <TextField
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
          sx={{ marginBottom: "1rem" }}
        />
        <TextField
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
          sx={{ marginBottom: "1rem" }}
        />
        <TextField
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
          sx={{ marginBottom: "1rem" }}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          sx={{ marginBottom: "1rem" }}
        />
        <TextField
          label="Occupation"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          fullWidth
          sx={{ marginBottom: "1rem" }}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          sx={{ marginBottom: "1rem" }}
        />
        <TextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          sx={{ marginBottom: "1rem" }}
        />
        <Button variant="contained" color="primary" onClick={handleRegister} sx={{ marginBottom: "1rem", backgroundColor: "darkmagenta" }}>
          Register Me
        </Button>
      </Box>
    </Container>
  );
}

export default LoginRegister;
