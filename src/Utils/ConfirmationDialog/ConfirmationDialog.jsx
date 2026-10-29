import "./for_confirmation.scss"
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Divider } from '@mui/material';
import { AlertTriangle, Trash2, Info, CheckCircle } from 'lucide-react';

const variantConfig = {
    danger: {
        icon: <Trash2 size={28} />,
        iconColor: '#d90429',
        iconBg: 'rgba(217, 4, 41, 0.1)',
        confirmClass: 'confirmBtnDanger',
        titleColor: '#d90429',
    },
    warning: {
        icon: <AlertTriangle size={28} />,
        iconColor: '#f59e0b',
        iconBg: 'rgba(245, 158, 11, 0.1)',
        confirmClass: 'confirmBtnWarning',
        titleColor: '#b45309',
    },
    info: {
        icon: <Info size={28} />,
        iconColor: '#7367f0',
        iconBg: 'rgba(115, 103, 240, 0.1)',
        confirmClass: 'confirmBtnInfo',
        titleColor: '#7367f0',
    },
    success: {
        icon: <CheckCircle size={28} />,
        iconColor: '#28a745',
        iconBg: 'rgba(40, 167, 69, 0.1)',
        confirmClass: 'confirmBtnSuccess',
        titleColor: '#1e7e34',
    },
};

const ConfirmationDialog = ({
    open,
    onClose,
    confirmLabel,
    cancelLabel,
    onConfirm,
    title,
    content,
    variant,
    icon,
    disableBackdropClick = true,
}) => {
    const config = variant ? variantConfig[variant] || variantConfig.info : null;

    const handleClose = (event, reason) => {
        if (disableBackdropClick && reason === 'backdropClick') return;
        if (disableBackdropClick && reason === 'escapeKeyDown') return;
        if (onClose) onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            className={`DRM ${variant ? `DRM-${variant}` : ''}`}
            disableBackdropClick={disableBackdropClick}
            disableEscapeKeyDown={disableBackdropClick}
            PaperProps={{
                sx: {
                    maxWidth: '450px',
                    width: '450px',
                },
            }}
        >
            {config && (
                <div className="dialogIconWrap" style={{ background: config.iconBg }}>
                    <span style={{ color: config.iconColor, display: 'flex' }}>
                        {icon || config.icon}
                    </span>
                </div>
            )}
            <DialogTitle
                id="alert-dialog-title"
                className='alert-TitleCl'
                sx={config ? { color: config.titleColor, textAlign: 'center', pt: config ? 0 : 2 } : undefined}
            >
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description" className='alert-titleContent'>
                    {content}
                </DialogContentText>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ px: 2.5, pb: 2, pt: 1.5 }}>
                <Button
                    className='for_DialogBtn cancelDialogBtn'
                    onClick={onClose}
                    autoFocus
                    fullWidth
                >
                    {cancelLabel ?? "Cancel"}
                </Button>
                <Button
                    className={`for_DialogBtn ${config ? config.confirmClass : 'confirmBtnDefault'}`}
                    onClick={onConfirm}
                    autoFocus
                    fullWidth
                >
                    {confirmLabel ?? "Remove"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;
