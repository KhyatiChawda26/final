import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Grid,
  Card,
  CardContent,
  Pagination,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CertificationDialog from "./Dialogs/CertificationDialog";

const Certification = () => {
  const [open, setOpen] = useState(false);
  const [certifications, setCertifications] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCertification, setCurrentCertification] = useState({
    id: null,
    name: "",
    issuer: "",
    issueDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const handleOpenDialog = () => {
    setOpen(true);
    resetForm();
  };

  const handleCloseDialog = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentCertification({ id: null, name: "", issuer: "", issueDate: "" });
    setIsEditing(false);
  };

  const handleSave = () => {
    if (isEditing) {
      // Update existing certification
      setCertifications((prevCerts) =>
        prevCerts.map((cert) =>
          cert.id === currentCertification.id ? currentCertification : cert
        )
      );
    } else {
      // Add new certification
      const newCertification = { ...currentCertification, id: Date.now() };
      setCertifications((prevCerts) => {
        const updatedCerts = [...prevCerts, newCertification];
        // Automatically navigate to the next page if we exceed the items per page
        const newPage = Math.ceil(updatedCerts.length / itemsPerPage);
        setCurrentPage(newPage);
        return updatedCerts;
      });
    }
    handleCloseDialog();
  };

  const handleEdit = (certification) => {
    setCurrentCertification(certification);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setCertifications((prevCerts) =>
      prevCerts.filter((cert) => cert.id !== id)
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(certifications.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const itemsToShow = certifications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Ensure user is redirected to the last valid page when an item is deleted
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <Grid item xs={12} md={6}>
      <Card sx={{ boxShadow: 3, borderRadius: "20px" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight="bold">
              Certification
            </Typography>
            <IconButton onClick={handleOpenDialog}>
              <AddIcon />
            </IconButton>
          </Box>

          {/* Display list of certifications with pagination */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: certifications.length > 3 ? 250 : "none",
            }}
          >
            <List>
              {itemsToShow.map((cert) => (
                <ListItem
                  key={cert.id}
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <ListItemAvatar>
                    <Avatar>{cert.name.charAt(0).toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={cert.name}
                    secondary={`Issuer: ${cert.issuer} | Issue Date: ${cert.issueDate}`}
                  />
                  <IconButton onClick={() => handleEdit(cert)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(cert.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Show Pagination if certifications exceed itemsPerPage */}
          {certifications.length > itemsPerPage && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Certification Add/Edit Dialog */}
      <CertificationDialog
        open={open}
        handleCloseDialog={handleCloseDialog}
        currentCertification={currentCertification}
        setCurrentCertification={setCurrentCertification}
        handleSave={handleSave}
        isEditing={isEditing}
      />
    </Grid>
  );
};

export default Certification;
