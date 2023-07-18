import styled from 'styled-components';

const Button = styled.button`
position: relative;
z-index: 1;
  padding: 25px 40px;
  border: none;
  display: inline;
  border-radius: .3em;
  font-size: 1.1em;
  color: #fff;
  background-color: #0077cc;
  cursor: pointer;

  :hover {
    background-color: #aa0606;
  }

  :active {
    background-color: #005fa3;
  }
`;

export default Button;
