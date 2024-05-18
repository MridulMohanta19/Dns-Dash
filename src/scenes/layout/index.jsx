import React from 'react';
import {Box } from "@mui/material";
import { Outlet } from 'react-router-dom';
import Navbar from "components/Navbar";
import Table from "components/Table"

const Layout = () => {
  return (
    <Box width="100%" height="100%">
      <Box>
        <Navbar/>
        <Outlet/>
        <Table/>
      </Box>
    </Box>
  )
}

export default Layout