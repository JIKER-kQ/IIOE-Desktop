import React, { ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { updatePopupSatus } from '../features/settingsSlice';

type Props = {
  children: ReactNode;
};

export default function App(props: Props) {
  const { children } = props;
  const dispatch = useDispatch();
  return (
    <div
      role="button"
      tabIndex={0}
      className="world"
      onKeyDown={() => {}}
      onClick={() => {
        dispatch(updatePopupSatus(false));
      }}
    >
      {children}
    </div>
  );
}
