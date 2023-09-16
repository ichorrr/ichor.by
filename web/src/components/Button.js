import styled from 'styled-components';

const Button = styled.button`
position: relative;
z-index: 1;
float: right;
  padding: 20px 30px 20px 51px;
  border: none;
  display: inline;
  border-radius: .6em;
  font-size: .9em;
  color: #727272;
  font-weight: bold;
  background-color: #dadada;
  cursor: pointer;
  letter-spacing: .03em;

  :hover {
    background-color: #aa0606;
    color: #fff;
  }

  :active {
    background-color: #005fa3;
  }
`;

export default Button;
