import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps, CardContent, CardHeader, CardActions } from '@mui/material';

interface CardProps extends MuiCardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  padding = 'medium',
  children,
  ...props
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return 1;
      case 'medium':
        return 2;
      case 'large':
        return 3;
      default:
        return 2;
    }
  };

  return (
    <MuiCard elevation={1} {...props}>
      {(title || subtitle) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
          subheaderTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
        />
      )}
      
      <CardContent sx={{ p: getPadding() }}>
        {children}
      </CardContent>
      
      {actions && (
        <CardActions sx={{ px: getPadding(), pb: getPadding() }}>
          {actions}
        </CardActions>
      )}
    </MuiCard>
  );
};

export default Card;

