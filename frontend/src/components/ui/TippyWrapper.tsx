"use client";

import React, { forwardRef, ReactNode } from 'react';

interface TippyWrapperProps {
  children: ReactNode;
}

const TippyWrapper = forwardRef<HTMLSpanElement, TippyWrapperProps>((props, ref) => {
  return (
    <span ref={ref}>
      {props.children}
    </span>
  );
});

TippyWrapper.displayName = 'TippyWrapper';

export default TippyWrapper;