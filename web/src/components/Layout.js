import React from 'react';
import styled from 'styled-components';
import Navigation from './Navigation';

const Main = styled.main`
  width: 100%;
  position: absolute;
  margin-top: 3.5em;
  margin: 0;
  top: 0;
  height: 100vh;

`;

const Layout = ({ children }) => {
  return (
    <React.Fragment>
        <Navigation />
        <Main>{children}</Main>
    </React.Fragment>
  );
};

export default Layout;
