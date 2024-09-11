import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const CertificationDialog = ({
  open,
  handleCloseDialog,
  currentCertification,
  setCurrentCertification,
  handleSave,
  isEditing,
}) => {
  return (
    <Dialog open={open} onClose={handleCloseDialog} fullWidth>
      <DialogTitle>
        {isEditing ? "Edit Certification" : "Add Certification"}
        <IconButton
          aria-label="close"
          onClick={handleCloseDialog}
          sx={{ position: "absolute", right: 8, top: 8, color: "grey[500]" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Certification Name"
          value={currentCertification.name}
          onChange={(e) =>
            setCurrentCertification({
              ...currentCertification,
              name: e.target.value,
            })
          }
          fullWidth
          margin="normal"
        />
        <TextField
          label="Issuer"
          value={currentCertification.issuer}
          onChange={(e) =>
            setCurrentCertification({
              ...currentCertification,
              issuer: e.target.value,
            })
          }
          fullWidth
          margin="normal"
        />
        <TextField
          label="Issue Date"
          type="date"
          value={currentCertification.issueDate}
          onChange={(e) =>
            setCurrentCertification({
              ...currentCertification,
              issueDate: e.target.value,
            })
          }
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="secondary">
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {isEditing ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CertificationDialog;
