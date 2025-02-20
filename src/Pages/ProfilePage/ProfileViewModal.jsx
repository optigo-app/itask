import React, { useState } from "react";
import { Avatar, Modal, Box, IconButton } from "@mui/material";
import { DeleteIcon, EditIcon, Trash } from "lucide-react";

const ProfileViewModal = ({ imageSrc, onEdit, onDelete, altText = "Profile Image" }) => {
  const [openModal, setOpenModal] = useState(false);

  const handleAvatarClick = () => {
    setOpenModal(true); // Open the modal on avatar click
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Close the modal
  };

  return (
    <div>
      {/* Avatar */}
      <Avatar
        src={imageSrc}
        alt={altText}
        sx={{
          width: 110,
          height: 110,
          border: "4px solid white",
          position: "absolute",
          top: "-40px",
          left: 24,
        }}
        variant="rounded"
        onClick={handleAvatarClick} // Open modal on click
      />

      {/* Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="avatar-modal-title"
        aria-describedby="avatar-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: "center",
            outline:'none'
          }}
        >
          <Avatar
            src={imageSrc}
            alt={altText}
            sx={{
              width: 150,
              height: 150,
              mb: 2,
              border: "2px solid gray",
            }}
          />

          {/* Edit and Delete Icons */}
          <div>
            <IconButton onClick={onEdit}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={onDelete}>
              <Trash  />
            </IconButton>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default ProfileViewModal;
