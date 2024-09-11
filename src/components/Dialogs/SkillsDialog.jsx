// import React, { useState, useEffect } from "react";
// import {
//   Autocomplete,
//   Box,
//   Button,
//   Chip,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   TextField,
//   Avatar,
//   IconButton,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import { styled } from "@mui/system";
// import predefinedSkills from "../../utils/skillsData";

// const BootstrapDialog = styled(Dialog)(({ theme }) => ({
//   "& .MuiDialogContent-root": {
//     padding: theme.spacing(2),
//   },
//   "& .MuiDialogActions-root": {
//     padding: theme.spacing(1),
//   },
// }));

// const SkillsDialog = ({ open, handleClose, handleSave, oldSkills = [] }) => {
//   const [selectedSkill, setSelectedSkill] = useState("");
//   const [skills, setSkills] = useState([]);

//   // Merge old skills with the current skills on mount or when oldSkills changes
//   useEffect(() => {
//     setSkills(oldSkills);
//   }, [oldSkills]);

//   const handleAddSkill = () => {
//     if (selectedSkill && !skills.includes(selectedSkill)) {
//       setSkills((prevSkills) => [...prevSkills, selectedSkill]);
//       setSelectedSkill(""); // Clear input after adding
//     }
//   };

//   const handleDeleteSkill = (skillToDelete) => {
//     setSkills((prevSkills) =>
//       prevSkills.filter((skill) => skill !== skillToDelete)
//     );
//   };

//   return (
//     <BootstrapDialog
//       onClose={handleClose}
//       aria-labelledby="dialog-title"
//       open={open}
//       fullWidth
//       onKeyDown={(e) => {
//         if (e.key === "Enter") {
//           e.preventDefault(); // Prevent the default form submission behavior
//           handleAddSkill();
//         }
//       }}
//     >
//       <DialogTitle id="dialog-title">
//         Add Skills
//         <IconButton
//           aria-label="close"
//           onClick={handleClose}
//           sx={{
//             position: "absolute",
//             right: 8,
//             top: 8,
//             color: (theme) => theme.palette.grey[500],
//           }}
//         >
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>
//       <DialogContent dividers>
//         <Autocomplete
//           freeSolo
//           options={predefinedSkills.map((item) => item.skill)}
//           value={selectedSkill}
//           onChange={(event, newValue) => {
//             if (typeof newValue === "string") {
//               setSelectedSkill(newValue);
//             }
//           }}
//           onInputChange={(event, newInputValue) =>
//             setSelectedSkill(newInputValue)
//           }
//           renderInput={(params) => (
//             <TextField
//               {...params}
//               label="Select or Add Skill"
//               variant="outlined"
//             />
//           )}
//         />
//         <Box sx={{ display: "flex", justifyContent: "center" }}>
//           <Button
//             onKeyDown={handleAddSkill}
//             variant="outlined"
//             color="primary"
//             onClick={handleAddSkill}
//             sx={{ mt: 2 }}
//           >
//             Add Skill
//           </Button>
//         </Box>

//         {/* Display the added skills (both old and new) as chips */}
//         <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
//           {skills.map((skill) => (
//             <Chip
//               key={skill}
//               label={skill}
//               avatar={<Avatar>{skill.charAt(0).toUpperCase()}</Avatar>}
//               onDelete={() => handleDeleteSkill(skill)}
//             />
//           ))}
//         </Box>
//       </DialogContent>
//       <DialogActions>
//         <Button variant="text" onClick={handleClose} sx={{ color: "red" }}>
//           Cancel
//         </Button>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => handleSave(skills)}
//         >
//           Save
//         </Button>
//       </DialogActions>
//     </BootstrapDialog>
//   );
// };

// export default SkillsDialog;

import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Avatar,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/system";
import predefinedSkills from "../../utils/skillsData";
import toast from "react-hot-toast";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const SkillsDialog = ({ open, handleClose, handleSave, oldSkills = [] }) => {
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skills, setSkills] = useState([]);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false); // Track if dropdown is open

  useEffect(() => {
    setSkills(oldSkills);
  }, [oldSkills]);

  const handleAddSkill = () => {
    if (selectedSkill && !skills.includes(selectedSkill)) {
      setSkills((prevSkills) => [...prevSkills, selectedSkill]);
      setSelectedSkill(""); // Clear input after adding
    } else {
      toast.error("Please Select New Skill");
    }
  };

  const handleDeleteSkill = (skillToDelete) => {
    setSkills((prevSkills) =>
      prevSkills.filter((skill) => skill !== skillToDelete)
    );
  };

  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="dialog-title"
      open={open}
      fullWidth
      onKeyDown={(e) => {
        if (e.key === "Enter" && !autocompleteOpen) {
          e.preventDefault(); // Prevent the default form submission behavior
          handleAddSkill();
        }
      }}
    >
      <DialogTitle id="dialog-title">
        Add Skills
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Autocomplete
          freeSolo
          open={autocompleteOpen}
          onOpen={() => setAutocompleteOpen(true)} // Detect when dropdown is opened
          onClose={() => setAutocompleteOpen(false)} // Detect when dropdown is closed
          options={predefinedSkills.map((item) => item.skill)}
          value={selectedSkill}
          onChange={(event, newValue) => {
            if (typeof newValue === "string") {
              setSelectedSkill(newValue);
            }
          }}
          onInputChange={(event, newInputValue) =>
            setSelectedSkill(newInputValue)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select or Add Skill"
              variant="outlined"
            />
          )}
        />
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            onKeyDown={handleAddSkill}
            variant="outlined"
            color="primary"
            onClick={handleAddSkill}
            sx={{ mt: 2 }}
          >
            Add Skill
          </Button>
        </Box>

        {/* Display the added skills (both old and new) as chips */}
        <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
          {skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              avatar={<Avatar>{skill.charAt(0).toUpperCase()}</Avatar>}
              onDelete={() => handleDeleteSkill(skill)}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={handleClose} sx={{ color: "red" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSave(skills)}
        >
          Save
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default SkillsDialog;
