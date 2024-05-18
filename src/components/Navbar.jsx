import React, { useState, useCallback } from "react";
import {
  LightModeOutlined,
  DarkModeOutlined,
} from "@mui/icons-material";
import FlexBetween from "./FlexBetween";
import { useDispatch } from "react-redux";
import { setMode } from "state";
import {
  AppBar,
  IconButton,
  Toolbar,
  useTheme,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Dialog,
} from "@mui/material";
// import theme from "/client/src/theme.js"
const baseURL = process.env.REACT_APP_BASE_URL;

const Navbar = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [requestData, setRequestData] = useState({
    domainName: "",
    callerReference: "",
  });

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddDomain = useCallback(async () => {
    try {
      console.log(requestData);
      const response = await fetch(`${baseURL}/domain/add-domain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log(response);
      // Handle response if needed
    } catch (error) {
      console.error("Error adding domain:", error);
      alert(error);
    }
  }, [requestData]);

  return (
    <>
      <AppBar
        sx={{
          position: "static",
          background: "none",
          boxShadow: "none",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <FlexBetween>
            <FlexBetween
              backgroundColor={theme.palette.background.alt}
              borderRadius="9px"
              gap="3rem"
              p="0.1rem 1.5rem"
            >
            </FlexBetween>
          </FlexBetween>
          <FlexBetween gap="1.5rem">
            <Button variant="contained" onClick={handleOpenModal}>
              Add Domain
            </Button>
            <IconButton onClick={() => dispatch(setMode())}>
              {theme.palette.mode === "dark" ? (
                <DarkModeOutlined sx={{ fontSize: "25px" }} />
              ) : (
                <LightModeOutlined sx={{ fontSize: "25px" }} />
              )}
            </IconButton>
          </FlexBetween>
        </Toolbar>
      </AppBar>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Domain</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Domain: example.com"
            variant="outlined"
            color="success"
            margin="dense"
            name="domainName"
            value={requestData.domainName}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Caller Reference"
            variant="outlined"
            color="success"
            margin="dense"
            name="callerReference"
            value={requestData.callerReference}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              handleAddDomain();
              setOpen(false);
            }}
          >
            Add Domain
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
