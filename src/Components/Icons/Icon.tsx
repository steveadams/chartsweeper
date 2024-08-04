import { ComponentProps, FC } from 'react';

export type Icon = FC<ComponentProps<'svg'>>;

export const IconWrapper: Icon = ({ children, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
    {children}
  </svg>
);
