import React from 'react';
import {
  Dialog,
  DialogProps as MuiDialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ModalProps extends Omit<MuiDialogProps, 'onClose'> {
  title?: string;
  onClose: () => void;
  actions?: React.ReactNode;
  showCloseButton?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  actions,
  showCloseButton = true,
  maxWidth = 'sm',
  fullWidth = true,
  children,
  ...props
}) => {
  return (
    <Dialog
      open={props.open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 200,
        },
      }}
      {...props}
    >
      {(title || showCloseButton) && (
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {title && (
              <Typography variant="h6" component="h2" fontWeight={600}>
                {title}
              </Typography>
            )}
            {showCloseButton && (
              <IconButton
                onClick={onClose}
                size="small"
                aria-label="close"
                sx={{ ml: 'auto' }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}
      
      <DialogContent dividers>
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions sx={{ p: 2 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;

